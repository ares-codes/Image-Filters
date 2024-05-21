import cv2
import numpy as np
from PIL import Image
from io import BytesIO
from backend.vid import VideoProcessor

def find_closest_palette_color(color, palette):
    return tuple(min(palette, key=lambda x: sum((a - b) ** 2 for a, b in zip(color, x))))

def DitherVid(src_file,palette,dither_type,matrix,socket,user_id,custom_txt):
    video_processor = VideoProcessor(
        filter_type="Dither",
        src_file=src_file,  
        processing_function=DitherImg,
        socket=socket,  
        user_id=user_id,  
        custom_txt=custom_txt,  
        palette = palette,
        dither_type = dither_type,
        matrix = matrix
    )      

    return video_processor.process_video()

def DitherImg(original_image,palette,dither_type,matrix,socket,user_id,custom_txt, frame_cnts = None):
    total_size = original_image.width * original_image.height
    width,height = original_image.width, original_image.height

    if frame_cnts:
        frame_cnt, frame_total = frame_cnts
        txt = f"[Dither ({frame_cnt}/{frame_total}) - Processing Pixels]"
    else:
        txt = f"[Dither - Processing Pixels]"

    pixels = original_image.load()
    if not dither_type: # ordered dither
        matrix = np.array(matrix)
        matrix = matrix / (np.max(matrix) + 1)
        m_height, m_width = matrix.shape

    count = 0
    for y in range(height - 1):
        for x in range(1, width - 1):
            old_pixel = pixels[x, y]
            old_pixel = tuple([int(min(max(0, x), 255)) for x in old_pixel])
           
            if dither_type == 1: #error
                new_pixel = find_closest_palette_color(old_pixel, palette)
                quant_error = [old - new_ for old, new_ in zip(old_pixel, new_pixel)]
                for i in range(len(matrix)):
                    for j in range(len(matrix[0])):
                        new_x = x + j - 1
                        new_y = y + i

                        if 0 <= new_x < width and 0 <= new_y < height:
                            pixels[new_x, new_y] = tuple([
                                int(c + max(0, matrix[i][j]) * err)
                                for c, err in zip(pixels[new_x, new_y], quant_error)
                            ])
            else:
                threshold = matrix[x % m_height][y % m_width]
                transformed_color = old_pixel + 255 * (threshold - 0.5)
                transformed_color = [int(min(max(0, x), 255)) for x in transformed_color]
                new_pixel = find_closest_palette_color(transformed_color, palette)
                
            pixels[x, y] = new_pixel
            count += 1
        progress = 100 * count / total_size
        new_txt = txt
        if custom_txt: new_txt = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {txt}]"
        socket.emit('progress_update', {'text': new_txt, 'progress': progress, "frame": None}, room = user_id)

    output_data = BytesIO()
    original_image.save(output_data, format='PNG')
    output_data.seek(0)
    return output_data