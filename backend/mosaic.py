from PIL import Image
from io import BytesIO
import cv2
import os
import base64
import numpy as np
from backend.vid import VideoProcessor

def get_average_color(image):
    width, height = image.size
    pixels = list(image.getdata())
    r_sum, g_sum, b_sum = 0, 0, 0

    for r, g, b in pixels:
        r_sum += r
        g_sum += g
        b_sum += b

    num_pixels = width * height
    avg_color = (
        r_sum // num_pixels,
        g_sum // num_pixels,
        b_sum // num_pixels
    )

    return avg_color

def compute_average_colors(images,socket,user_id,custom_txt):
    tile_images = []
    average_colors = []

    txt = "[Mosaic - Computing Tile Colors]"

    cnt = 0
    for image in images:
        image_data = image.getvalue()
        img_array = np.frombuffer(image_data, dtype=np.uint8)
        img_array = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        img_array = cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB)
        tile_image = Image.fromarray(img_array).convert("RGB")

        average_color = get_average_color(tile_image)
        tile_images.append(tile_image)
        average_colors.append(average_color)

        cnt += 1
        progress = 100 * cnt / len(images)

        output_data = BytesIO()
        tile_image.save(output_data, format='PNG')
        output_data.seek(0)
        encoded_data = base64.b64encode(output_data.getvalue()).decode('utf-8')
        new_txt = txt[:-1] + f" ({cnt}/{len(images)})]"
        if custom_txt: new_txt = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {new_txt}]"
        socket.emit('progress_update', {'text': new_txt, 'progress': progress, "frame": encoded_data}, room = user_id)

    return tile_images, average_colors


def find_best_match(target_color, tile_images, average_colors):
    best_match = None
    best_diff = float('inf')

    for tile_image, tile_color in zip(tile_images,  average_colors):
        color_diff = sum(abs(target - tile) for target, tile in zip(target_color, tile_color))

        if color_diff < best_diff:
            best_diff = color_diff
            best_match = tile_image

    return best_match

def MosaicVid(src_file,tile_width,tile_length,images,socket, user_id,custom_txt):
    video_processor = VideoProcessor(
        filter_type="Mosaic",
        src_file=src_file,  
        processing_function=MosaicImg,
        socket=socket,  
        user_id=user_id,  
        custom_txt=custom_txt,  
        tile_width = tile_width,
        tile_height = tile_length,
        images = images,
        tile_images = None,
        average_colors = None
    )      

    return video_processor.process_video()

def MosaicImg(large_image, tile_width,tile_height,images,socket,user_id,custom_txt,frame_cnts = None,tile_images = [], average_colors = []):
    num_cols = max(large_image.width // tile_width,1)
    num_rows = max(large_image.height // tile_height,1)

    txt = "[Mosaic - Computing Tile Colors]"
    if custom_txt: txt = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {txt}]"
    socket.emit('progress_update', {'text': txt, 'progress': 0, "frame": None}, room = user_id)

    cnt = 0
    new_txt = ""
    encoded_data = None
    if not tile_images:
        tile_images, average_colors = compute_average_colors(images,socket,user_id,custom_txt)
    large_image = large_image.resize((num_cols * tile_width, num_rows * tile_height))

    encoded_data = None
    if frame_cnts:
        frame_num,total_frames = frame_cnts
        txt = f"[Mosaic ({frame_num}/{total_frames}) - Adding Images"
        if frame_num == 1:
            output_data = BytesIO()
            large_image.save(output_data, format='PNG')
            output_data.seek(0)
            encoded_data = base64.b64encode(output_data.getvalue()).decode('utf-8')
    else:
        txt = "[Mosaic - Adding Images"
    if custom_txt: new_txt = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {txt}]"
    socket.emit('progress_update', {'text': new_txt, 'progress': 0, "frame": encoded_data}, room = user_id)

    for row in range(num_rows):
        for col in range(num_cols):
            x1 = col * tile_width
            y1 = row * tile_height
            x2 = x1 + tile_width
            y2 = y1 + tile_height
            
            target_region = large_image.crop((x1, y1, x2, y2))
            target_color = get_average_color(target_region)

            best_match_tile = find_best_match(target_color, tile_images, average_colors)
            best_match_tile = best_match_tile.resize((tile_width, tile_height))
            large_image.paste(best_match_tile, (x1, y1))
            cnt += 1

            output_data = BytesIO()
            large_image.save(output_data, format='PNG')
            output_data.seek(0)
            encoded_data = base64.b64encode(output_data.getvalue()).decode('utf-8')
            progress = 100 * cnt / ((num_cols * num_rows))
            new_txt = f"{txt}({cnt}/{num_cols * num_rows})]"
            if custom_txt: new_txt = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {new_txt}]"
            socket.emit('progress_update', {'text': new_txt, 'progress': progress, "frame": encoded_data}, room = user_id)

    output_data = BytesIO()
    large_image.save(output_data, format='PNG')
    output_data.seek(0)
    return output_data,tile_images, average_colors