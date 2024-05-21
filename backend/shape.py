import cv2
import numpy as np
import random
import base64
from PIL import Image, ImageDraw
from io import BytesIO
from backend.vid import VideoProcessor
import time

def load_image(imgfile, scale=1.0):
    img_array = np.frombuffer(imgfile, dtype=np.uint8) 
    
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    h, w = image.shape[:2]
    image = cv2.resize(
        image, (int(scale * w), int(scale * h)),
        interpolation=cv2.INTER_AREA
    )

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGBA)
    return image_rgb

def get_dist_transform_image(image):
    canny = cv2.Canny(image, 100, 200)
    edges_inv = 255 - canny
    dist_image = cv2.distanceTransform(edges_inv, cv2.DIST_L2, 0)
    return dist_image


def add_new_circles(filled, dist_image, image, count, frame_count, socket, user_id, custom_txt, border_color):
    circles = []
    H, W, _ = image.shape

    for x in range(W):  
        for y in range(H):  
            radius = calculate_dynamic_radius(dist_image[y, x])
            if not filled[y, x] and is_valid_circle(x, y, radius, W, H) and not is_circle_overlap(filled, x, y, radius):
                color = tuple(image[y, x]) 
                if color != border_color:
                    circles.append((x, y, radius,color))
                    filled[y - radius: y + radius + 1, x - radius: x + radius + 1] = 1

        if frame_count == 0:
            txt = f"[Shape - Analyzing Image]"
        else:
            txt = f"[Shape ({count}/{frame_count}) - Analyzing Image]"
        if custom_txt:
            txt = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {txt}]"
        socket.emit('progress_update', {'text': txt, 'progress': 100 * float(x / (W - 2)), "frame": None}, room=user_id)

    random.shuffle(circles)
    return circles

def calculate_dynamic_radius(dist_value):
    return int((dist_value + 1) / 2)

def is_valid_circle(center_x, center_y, radius, image_width, image_height):
    return (
        radius > 0 and
        center_x - radius >= 0 and
        center_x + radius < image_width and
        center_y - radius >= 0 and
        center_y + radius < image_height
    )

def is_circle_overlap(filled, x, y, r):
    x_range = np.arange(max(0, x - r), min(filled.shape[1], x + r + 1))
    y_range = np.arange(max(0, y - r), min(filled.shape[0], y + r + 1))
    ii, jj = np.meshgrid(x_range, y_range)
    ii, jj = ii.astype(int), jj.astype(int)  # Ensure indices are integers
    overlap = filled[jj, ii]
    return overlap.any()

def get_ang_scales(points):
    center = np.mean(points, axis=0)
    radius = np.max(np.linalg.norm(points - center, axis=1))

    res = []
    for x, y in points:
        dist_from_center = np.sqrt((x - center[0]) ** 2 + (y - center[1]) ** 2)
        adjusted_dist = round(dist_from_center / radius, 3)
        angle_in_radians = np.arctan2(y - center[1], x - center[0])
        res.append((adjusted_dist, angle_in_radians))
    return res

def updatePlot(socket,frame_count,total_frames, shape_num, total_shapes,user_id,final_img,custom_txt):
    buffer = BytesIO()
    final_img.save(buffer, format="PNG")
    encoded_data = base64.b64encode(buffer.getvalue()).decode('utf-8')

    if total_frames == 0:
        txt = f"[Shape - Drawing Shapes: {shape_num}/{total_shapes}]"
    else:
        txt = f"[Shape ({frame_count}/{total_frames}) - Drawing Shapes: {shape_num}/{total_shapes}]"

    if custom_txt: txt = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {txt}]"
    socket.emit('progress_update', {'text': txt, 'progress': 100 * float((shape_num) / total_shapes), "frame": encoded_data}, room = user_id)

def plot_all_cirlces(image, draw, socket, frame_num,total_frames, color, circles, user_id,final_img,custom_txt):
    total_shapes = len(circles)
    for i, circle in enumerate(circles):
        x, y, r,  pixel_color = circle[0], circle[1], circle[2], circle[3]
        draw.ellipse([x - r, y - r, x + r, y + r], fill = pixel_color, outline=color)
        updatePlot(socket,frame_num,total_frames, i, total_shapes,user_id,final_img,custom_txt)

def plot_all_polygons(image, points,rotation,draw, socket, frame_num, total_frames, color, circles, user_id, final_img, custom_txt):
    point_angscales = []
    if len(points) > 1: # custom
        point_angscales = get_ang_scales(points)
    elif points[0] == 2: # heart
        point_angscales = [(.364,1.768),(.931,2.138),(.863, 2.715),(.789, -3.051),(.931, -1.648),(.789, -.091),(.863, .427), (.863, 1.144)]
    elif points[0] == 1: # star
        point_angscales = [(1.0, 1.571), (0.5, 2.199), (1.0, 2.827), (0.5, 3.456), (1.0, -2.199), (0.5, -1.571), (1.0, -0.942), (0.5, -0.314), (1.0, 0.314), (0.5, 0.942)]
    elif points[0] == -1: # apple
        point_angscales = [(0.579, 1.41), (0.833, 1.674), (0.976, 1.93), (0.727, 1.911), (0.571, 1.571), (0.677, 2.006), (0.729, 2.652), (0.376, 3.294), (0.454, 3.598), (0.84, 3.758), (0.904, 4.028), (0.886, 4.35), (0.8, 4.712), (0.886, 5.075), (0.921, 5.232), (0.92, 5.343), (0.864, 5.686), (0.801, 6.247), (0.793, 0.236), (0.766, 0.64), (0.703, 1.107)]
    else: # regular_polygon
        angle_step = 2 * np.pi / points[0]
        point_angscales = [(1, round(np.pi / 2 + i * angle_step,3))for i in range(points[0])] 
    
    total_shapes = len(circles)
    for i, circle in enumerate(circles):
        new_points = []
        center_x, center_y, radius,  pixel_color = circle[0], circle[1], circle[2], circle[3]

        if rotation == 360: rotate = 2 * np.pi * random.random()
        elif len(points) > 1: rotate = 0
        else: rotate = (360 - rotation) * np.pi / 180

        for scale,angle in point_angscales:
            angle += (np.pi + rotate)
            new_points.append((
                center_x + radius * scale * np.cos(angle),
                center_y + radius * scale * np.sin(angle)
            ))

        draw.polygon(new_points, fill=pixel_color, outline=color)
        updatePlot(socket, frame_num, total_frames, i, total_shapes, user_id, final_img, custom_txt)

def ShapeVid(src_file,points,color,rotation,background, socket, user_id,custom_txt):
    video_processor = VideoProcessor(
        filter_type="Shape",
        src_file=src_file, 
        processing_function=ShapeImg,
        socket=socket,  
        user_id=user_id,  
        custom_txt=custom_txt,  
        points = points,
        color = color,
        rotation = rotation,
        background = background
    )      

    return video_processor.process_video()

def ShapeImg(img_data,points,rotation,color,background, socket, user_id,custom_txt,frame_cnts = None):
    image = load_image(img_data)
    dist_image = get_dist_transform_image(image)
    img = cv2.GaussianBlur(image, (5, 5), 0)
    H, W = image.shape[:2]
    final_img = Image.new('RGBA', (W, H), color=background)
    draw = ImageDraw.Draw(final_img)

    filled = np.zeros([H, W], dtype=np.int32)
    encoded_data = base64.b64encode(img_data).decode('utf-8')

    if frame_cnts:
        frame_num,total_frames = frame_cnts
        txt = f"[Shape ({frame_num}/{total_frames}) - Analyzing Image]"
    else:
        frame_num,total_frames = 0,0
        txt = f"[Shape - Analyzing Image]"

    if custom_txt:
        txt = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {txt}]"

    socket.emit('progress_update', {'text': txt, 'progress': 0, "frame": encoded_data}, room=user_id)
    circles =  add_new_circles(filled, dist_image, image, frame_num,total_frames, socket, user_id,custom_txt, background)
    
    if points[0] == 0:
        plot_all_cirlces(image, draw, socket, frame_num,total_frames, color, circles, user_id,final_img,custom_txt)
    else:
        plot_all_polygons(image, points,rotation,draw, socket, frame_num, total_frames, color, circles, user_id, final_img, custom_txt)

    output_data = BytesIO()
    final_img.save(output_data, format='PNG')
    output_data.seek(0)
    return output_data