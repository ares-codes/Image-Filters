import numpy as np
from PIL import Image
import cv2
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import random
import os
import potrace
import base64
from io import BytesIO
import networkx as nx
from scipy.spatial.distance import euclidean
from backend.vid import VideoProcessor

matplotlib.use('Qt5Agg')

def find_optimal_path(lines):
    G = nx.Graph()

    # Add nodes for start points of each line with line identifiers
    for line in lines:
        G.add_node(line['start'], id=line['id'])

    # Add edges between start points with weights equal to the Euclidean distance
    for line1 in lines:
        for line2 in lines:
            if line1 != line2:
                dist = euclidean(line1['start'], line2['start'])
                G.add_edge(line1['start'], line2['start'], weight=dist)

    # Find the optimal path using a graph algorithm (e.g., Traveling Salesman Problem)
    tour = nx.approximation.traveling_salesman_problem(G, cycle=False)

    # Extract the line identifiers from the nodes in the optimal path
    line_identifiers = [G.nodes[node]['id'] for node in tour]

    return line_identifiers

def one_line_segs(latex, curve_txt):
    x_start, y_start, x_end, y_end = [], [], [], []
    out_txt = curve_txt[0] + "\n\n"
    curve_index = 3

    total_size = 0
    cnt = 1
    curves = []
    
    lines = []
    for k,v in latex.items():
        lines.append( {'start': v["start"], 'end': v["end"], "id": k})

    optimal_path = find_optimal_path(lines)
    index = optimal_path[0]
    added_curves = set([index])
    endx,endy = latex[index]["end"]
    curves.append(latex[index]["segments"])
    for txt in latex[index]["text"]:
        out_txt += txt + "\n"
    
    while cnt < len(latex):
        best_index = optimal_path[cnt]
        x_start.append(endx)
        y_start.append(endy)
        added_curves.add(best_index)
        endx,endy = latex[best_index]["end"]
        startx,starty = latex[best_index]["start"]
        x_end.append(startx)
        y_end.append(starty)
        curves.append(latex[best_index]["segments"])
        total_size += 1
        total_size += len(curves[-1])
        cnt += 1

        line = '(1-t) * %f + t * %f, (1-t) * %f + t * %f' % (x_start[-1], x_end[-1], y_start[-1], y_end[-1])
        out_txt += line + "\n"

        for txt in latex[best_index]["text"]:
            out_txt += txt + "\n"

    return x_start, y_start, x_end, y_end, curves,total_size,out_txt

def get_trace(data):
    bmp = potrace.Bitmap(data)
    path = bmp.trace(opttolerance=0.5)
    return path

def get_contours(image, nudge = .33):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edged = cv2.Canny(gray, 30, 200)
    _, binary_image = cv2.threshold(edged, 128, 255, cv2.THRESH_BINARY)
    bool_image = binary_image.astype(bool)
    return bool_image[::-1]

def update_progress(fig, cnt, total_size,socket, tracing_txt, user_id,custom_txt):
    fig.canvas.draw()
    frame = np.array(fig.canvas.renderer.buffer_rgba())
    frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGRA)

    encoded_data = base64.b64encode(cv2.imencode('.png', frame)[1].tobytes()).decode('utf-8')
    progress = 100 * float(min(cnt,total_size)/ total_size)
    text = f"[{tracing_txt} - Drawing Segments: {min(cnt,total_size)}/{total_size}]"
    if custom_txt: text = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {text}]"
    socket.emit('progress_update', {'text': text, 'progress': progress, "frame": encoded_data}, room = user_id)

def TraceVid(src_file,one_line,line_color,background_color,socket,user_id,custom_txt):
    video_processor = VideoProcessor(
        filter_type="Trace",
        src_file=src_file, 
        processing_function=TraceImg,
        socket=socket,  
        user_id=user_id,  
        custom_txt=custom_txt,  
        one_line = one_line,
        line_color = line_color,
        background_color = background_color
    )      

    return video_processor.process_video()

def TraceImg(img,one_line,line_color,background_color,socket,user_id,custom_txt, frame_cnts = None):
    latex,txt = {},""

    img_array = np.frombuffer(img, dtype=np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)  
    height, width = image.shape[:2]

    tracing_txt = "Tracing"
    if frame_cnts:
        frame_num, frame_cnt_total = frame_cnts
        tracing_txt += "(" + str(frame_num) + "/" + str(frame_cnt_total) + ")"
    else:
       frame_num, frame_cnt_total = 1,1

    contours = get_contours(image)
    hash_countour = contours.data.tobytes()
    text = f"[{tracing_txt} - Generating Path]"
    if custom_txt: text = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {text}]"
    socket.emit('progress_update', {'text': text, 'progress': 0, "frame": None}, room = user_id)

    path = get_trace(contours)
    text = f"[{tracing_txt} - Path Found]"
    if custom_txt: text = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {text}]"
    socket.emit('progress_update', {'text': text, 'progress': 100, "frame": None}, room = user_id)

    val = 3
    t = np.linspace(0, 1, 100)  
    curve_txt = ["Line Curves (t = [0,1]):", ""]
    for cnt,curve in enumerate(path.curves):
        segments = curve.segments
        start = curve.start_point
        latex[cnt] = {
            "start" : (start[0],start[1]),
            "end" : (start[0],start[1]),
            "segments" : [],
            "text" : []
        }
        for segment in segments:
            x0, y0 = round(start[0],val),round(start[1],val)
            if segment.is_corner:
                x1, y1 = round(segment.c[0],val), round(segment.c[1],val)
                x2, y2 = round(segment.end_point[0],val), round(segment.end_point[1],val)
               
                input_string = '(1-t) * %f + t * %f, (1-t) * %f + t * %f' % (x0, x1, y0, y1)
                expressions = input_string.split(',')
                lambda_x = eval(f"lambda t: {expressions[0]}")
                lambda_y = eval(f"lambda t: {expressions[1]}")
                latex[cnt]["segments"].append((lambda_x(t), lambda_y(t)))

                input_string = '(1-t) * %f+t * %f,(1-t) * %f+t * %f' % (x1, x2, y1, y2)
                expressions = input_string.split(',')
                lambda_x = eval(f"lambda t: {expressions[0]}")
                lambda_y = eval(f"lambda t: {expressions[1]}")
                latex[cnt]["segments"].append((lambda_x(t), lambda_y(t)))

                latex[cnt]["end"] = (x2, y2)
            else:
                x1, y1 = round(segment.c1[0],val), round(segment.c1[1],val)
                x2, y2 = round(segment.c2[0],val), round(segment.c2[1],val)
                x3, y3 = round(segment.end_point[0],val), round(segment.end_point[1],val)

                input_string = '(1-t) * ((1-t) * ((1-t) * %f+t * %f)+t * ((1-t) * %f+t * %f))+t * ((1-t) * ((1-t) * %f+t * %f)+t * ((1-t) * %f+t * %f)),\
                (1-t) * ((1-t) * ((1-t) * %f+t * %f)+t * ((1-t) * %f+t * %f))+t * ((1-t) * ((1-t) * %f+t * %f)+t * ((1-t) * %f+t * %f))' % \
                (x0, x1, x1, x2, x1, x2, x2, x3, y0, y1, y1, y2, y1, y2, y2, y3)
                expressions = input_string.split(',')
                lambda_x = eval(f"lambda t: {expressions[0]}")
                lambda_y = eval(f"lambda t: {expressions[1]}")
                latex[cnt]["segments"].append((lambda_x(t), lambda_y(t)))
                latex[cnt]["end"] = (x3, y3)
            latex[cnt]["text"].append(input_string)
            start = segment.end_point
            curve_txt.append(input_string)
  
        progress = 100 * float(min(cnt,len(path.curves))/ len(path.curves))
        text = f"[{tracing_txt} - Generating Segments: {min(cnt,len(path.curves))}/{len(path.curves)}]"
        if custom_txt: text = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {text}]"
        socket.emit('progress_update', {'text': text, 'progress': progress, "frame": None}, room = user_id)

    # Create a figure with the specified dimensions
    fig, ax = plt.subplots(figsize=(width/100, height/100), tight_layout=True)  # Adjust dpi for resolution
    fig.set_facecolor(tuple(comp / 255.0 for comp in background_color))
    plt.clf()
    plt.axis('off')

    if not one_line:
        result_rgb = np.full((contours.shape[0], contours.shape[1], 3), background_color, dtype=np.uint8)
        result_rgb[contours] = line_color
        result_rgb_flipped = np.flipud(result_rgb)

        pil_image = Image.fromarray(result_rgb_flipped)
        img_buffer = BytesIO()
        pil_image.save(img_buffer, format='PNG')
        img_buffer.seek(0)

        return img_buffer, '\n'.join(curve_txt)

    else:
        x_start, y_start, x_end, y_end, curves,total_size,out_txt = one_line_segs(latex,curve_txt)
        cnt = 0
        cursor = None
        for i in range(len(x_start)):
            for seg in curves[i]:
                x, y = seg[0],seg[1]
                plt.plot(x, y, color= tuple(comp / 255.0 for comp in line_color))

                if frame_cnt_total == 1: 
                    update_progress(fig, cnt, total_size,socket,tracing_txt, user_id,custom_txt)

                cnt += 1

            plt.plot([x_start[i], x_end[i]], [y_start[i], y_end[i]], linestyle='-', color= tuple(comp / 255.0 for comp in line_color))
            
            if frame_cnt_total == 1: 
                update_progress(fig, cnt, total_size,socket,tracing_txt, user_id,custom_txt)

            cnt += 1

    img_buffer = BytesIO()
    plt.savefig(img_buffer, format='png', dpi=100)
    img_buffer.seek(0)

    return img_buffer, out_txt