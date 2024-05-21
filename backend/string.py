import os
import cv2
from io import BytesIO
import base64
import numpy as np
from PIL import Image
from backend.vid import VideoProcessor

def generate_border_points(width, height, n):
    points = []
    perimeter = 2 * (width + height)
    step = perimeter / n

    for i in range(n):
        if i * step < width:
            x = i * step
            y = 0
        elif i * step < width + height:
            x = width
            y = (i * step) - width
        elif i * step < 2 * width + height:
            x = width - (i * step - (width + height))
            y = height
        else:
            x = 0
            y = height - (i * step - (2 * width + height))

        points.append((int(x), int(y)))

    return points

def calculate_line_points(x0, y0, x1, y1, thickness):
    """
    Returns a list of (x, y) tuples representing the pixels on a thick line
    between (x0, y0) and (x1, y1) with the specified thickness, while ensuring
    that the pixels are inside a circular region defined by (h, k) and r.
    """
    # Check if the line is steep, and if so, swap x and y coordinates
    is_steep = abs(y1 - y0) > abs(x1 - x0)
    if is_steep:
        x0, y0 = y0, x0
        x1, y1 = y1, x1

    # Check if the line goes from right to left, and if so, swap start and end points
    if x0 > x1:
        x0, x1 = x1, x0
        y0, y1 = y1, y0

    dx = x1 - x0
    dy = abs(y1 - y0)
    error = dx / 2
    y = y0
    y_step = 1 if y0 < y1 else -1

    line_pixels = []
    for x in range(x0, x1 + 1):
        if is_steep:
            for i in range(-thickness // 2, (thickness + 1) // 2):
                    line_pixels.append((y + i, x))
        else:
            for i in range(-thickness // 2, (thickness + 1) // 2):
                    line_pixels.append((x, y + i))

        error -= dy
        if error < 0:
            y += y_step
            error += dx

    return line_pixels

def StringVid(src_file, nail_cnt, string_color, background_color, border, line_cnt, socket, user_id,custom_txt):
    video_processor = VideoProcessor(
        filter_type="String",
        src_file=src_file, 
        processing_function=StringImg,
        socket=socket,  
        user_id=user_id,  
        custom_txt=custom_txt,  
        nail_cnt=nail_cnt,
        string_color=string_color,
        background_color=background_color,
        border=border,
        max_lines=line_cnt,
        line_points={}
    )      

    return video_processor.process_video()

def StringImg(image_data, nail_cnt, string_color, background_color, border, max_lines, socket, user_id,custom_txt, line_points = {}, frame_cnts = None):
    thickness = 1
    img_array = np.frombuffer(image_data, dtype=np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    threshold_value = 128
    _, thresholded_image = cv2.threshold(gray_image, threshold_value, 255, cv2.THRESH_BINARY)
    binary_image = cv2.cvtColor(thresholded_image, cv2.COLOR_GRAY2RGBA)

    height, width, _ = binary_image.shape

    background_image = np.ones((height, width,3), dtype=np.uint8) * background_color
    background_image = np.ascontiguousarray( background_image, dtype=np.uint8)
    
    if border == 0: # circle border
        center_x, center_y = width // 2, height // 2
        radius = min(center_x, center_y)
        cv2.circle(background_image, (center_x, center_y), radius, string_color, 2 * thickness)
        angles = np.linspace(0, 2 * np.pi, nail_cnt, endpoint=False)

        points = []
        for angle in angles:
            x = int(center_x + radius * np.cos(angle))
            y = int(center_y + radius * np.sin(angle))
            points.append((x, y))

    else: # rect border
        points = generate_border_points(width, height, nail_cnt)

    src_data = np.array(255 - binary_image)
    all_lines = []
    size = len(points)

    start_index,end_index = None,None
    best_line = 0
    data = src_data.copy()
    cnt = 0

    if frame_cnts:
        frame_num, frame_cnt_total = frame_cnts
        text = f"[String ({frame_num}/{frame_cnt_total}) - Analyzing Frame]"
    else:
        frame_num, frame_cnt_total = 0,0
        text = "[String - Analyzing Frame]"
    
    # Assuming imageData is BytesIO object
    _, buffer = cv2.imencode(".png", image)
    image_bytes = buffer.tobytes()

    # Encode the RGB image
    encoded_data = base64.b64encode(image_bytes).decode('utf-8')
    #encoded_data = base64.b64encode(image_data).decode('utf-8') #white image
    if custom_txt: text = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {text}]"
    socket.emit('progress_update', {'text': text, 'progress': 0, "frame": encoded_data}, room = user_id) 

    nail_txt = f"Below is the nail path for the string art. Nail 1 starts at 0 degrees with all {nail_cnt} nails equally spaced by {(360 / nail_cnt)} degrees.\n\n"
    nail_path = []
    for i in range(size):
        for j in range(i + 1, size):
            if j != start_index and min((i - j) % nail_cnt, (j - i) % nail_cnt) > 5:
                start = points[i]
                end = points[j]

                line_val = 0
                if (i, j) in line_points or (j,i) in line_points:
                    vals = line_points[(i,j)]
                else:
                    vals = np.array(calculate_line_points(start[0], start[1], end[0], end[1], thickness))
                    line_points[(i,j)] = vals
                    line_points[(j,i)] = vals
                
                if vals.size:
                    xx, yy = line_points[(i,j)].T
                    valid_indices = (xx >= 0) & (xx < width) & (yy >= 0) & (yy < height)

                    line_val = np.mean(data[yy[valid_indices], xx[valid_indices]])
                    

                    if line_val >= best_line:
                        start_index = i
                        end_index = j
                        best_line = line_val
            cnt += 1
            if frame_cnt_total > 0:
                text = f"[String ({frame_num}/{frame_cnt_total}) - Analyzing Frame]"
            else:
                text = "[String - Analyzing Frame]"
            progress = 100 * cnt / (size * (size - 1) / 2)
            if custom_txt: text = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {text}]"
            socket.emit('progress_update', {'text': text, 'progress': progress, "frame": None}, room = user_id)     
    
    vals = line_points[(start_index,end_index)]
    nail_path.append(start_index + 1)
    nail_path.append(end_index + 1)
    xx, yy = vals.T
    valid_indices = (xx >= 0) & (xx < width) & (yy >= 0) & (yy < height)
    src_data[yy[valid_indices], xx[valid_indices]] = 0
   
    cv2.line(background_image, points[start_index], points[end_index], string_color, thickness)
    all_lines.append(start_index)
    all_lines.append(end_index)
    line_cnt = 1

    if frame_cnt_total == 0:
        text = f"[String - Drawing Lines: {line_cnt}/{max_lines}]"
    else:
        text = f"[String ({frame_num}/{frame_cnt_total}) - Drawing Lines: {line_cnt}/{max_lines}]"

    progress = 100 / max_lines
    image_bytes = cv2.imencode('.png', background_image)[1].tobytes()
    encoded_data = base64.b64encode(image_bytes).decode('utf-8')
    if custom_txt: text = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {text}]"
    socket.emit('progress_update', {'text': text, 'progress': progress, "frame": encoded_data}, room = user_id)

    while line_cnt < max_lines:
        best_line = 0
        data = src_data.copy()
        start_index = end_index
        end_index = None

        start = points[start_index]
        for j in range(size):
            if j != start_index and min((j - start_index) % nail_cnt, (start_index - j) % nail_cnt) > 5:
                end = points[j]
                line_val = 0
                
                vals = line_points[(start_index,j)]
                if vals.size:
                    xx, yy = line_points[(start_index,j)].T
                    valid_indices = (xx >= 0) & (xx < width) & (yy >= 0) & (yy < height)
                    line_val = np.mean(data[yy[valid_indices], xx[valid_indices]])

                    if line_val >= best_line:
                        end_index = j
                        best_line = line_val

        vals = line_points[(start_index,end_index)]
        nail_path.append(end_index + 1)
        xx, yy = vals.T
        valid_indices = (xx >= 0) & (xx < width) & (yy >= 0) & (yy < height)
        src_data[yy[valid_indices], xx[valid_indices]] = 0

        cv2.line(background_image, points[start_index], points[end_index], string_color, thickness)
        all_lines.append(start_index)
        all_lines.append(end_index)
        line_cnt += 1

        if frame_cnt_total == 0:
            text = f"[String - Drawing Lines: {line_cnt}/{max_lines}]"
        else:
            text = f"[String ({frame_num}/{frame_cnt_total}) - Drawing Lines: {line_cnt}/{max_lines}]"

        progress = 100 * line_cnt / max_lines
      
        pil_image = Image.fromarray(background_image)
        img_buffer = BytesIO()
        pil_image.save(img_buffer, format='PNG')
        image_bytes = img_buffer.getvalue()

        encoded_data = base64.b64encode(image_bytes).decode('utf-8')
        if custom_txt: text = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {text}]"
        socket.emit('progress_update', {'text': text, 'progress': progress, "frame": encoded_data}, room = user_id)       

    nail_txt += str(nail_path)
    if custom_txt: text = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {text}]"
    socket.emit('progress_update', {'text': text, 'progress': 100, "frame": None}, room = user_id) 

    pil_image = Image.fromarray(background_image)
    img_buffer = BytesIO()
    pil_image.save(img_buffer, format='PNG')
    img_buffer.seek(0)

    return img_buffer, line_points, nail_txt