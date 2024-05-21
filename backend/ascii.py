import numpy as np
import cv2
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from backend.vid import VideoProcessor

def AsciiVid(src_file,chars,cols,text_color,background,socket,user_id,custom_txt):
    video_processor = VideoProcessor(
        filter_type="Ascii",
        src_file=src_file,  
        processing_function=AsciiImg,
        socket=socket,  
        user_id=user_id,  
        custom_txt=custom_txt,  
        chars = chars,
        cols = cols,
        text_color = text_color,
        background = background
    )      

    return video_processor.process_video()

def AsciiImg(image_data,chars,cols,text_color,background, socket, user_id, custom_txt, frame_cnts = None):
    # Convert binary content to a NumPy array
    img_array = np.frombuffer(image_data, dtype=np.uint8)
    
    # Decode the image using OpenCV
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    aspect_ratio = img.shape[1] / img.shape[0]

    font_size = 40
    font = ImageFont.truetype("static/cour.ttf", int(font_size))

    width,height = 0,0
    for char in chars:
        (w, h), (_, _) = font.font.getsize(char)
        width = max(width,w)
        height = max(height,h)
   
    if cols:
        # Calculate the height based on the aspect ratio
        img2 = cv2.resize(img, (cols, int(cols / aspect_ratio)))
    else:
        img2 = cv2.resize(img, ( int(img.shape[1] / width),  int(img.shape[0] / height)))
       
    # Resize the image to the specified width and calculated height
    img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2RGBA)

    # Convert the image to grayscale for simplicity
    gray = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    ascii_art = ""
    character_colors = []
    for i, row in enumerate(gray):
        for j, pixel_value in enumerate(row):
            index = min(pixel_value // (256 // len(chars)), len(chars) - 1)
            ascii_char = chars[index]
            if not text_color:
                character_colors.append([ascii_char, tuple(img2[i, j])])
            else:
                character_colors.append([ascii_char, text_color])
            ascii_art += ascii_char
        character_colors.append(["\n", None])
        ascii_art += "\n"
 
    splits = ascii_art.split("\n")
    new_width = width * len(splits[0])
    new_height = height * len(splits)

    back = Image.new("RGBA", (new_width, new_height), background)
    draw = ImageDraw.Draw(back)

    x_position, y_position = 0, 0
    cnt, total = 0, len(character_colors)
    for char,color in character_colors:
        if char == '\n':
            x_position = 0
            y_position += height # Height of a space character

            if custom_txt: text = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {text}]"
            socket.emit('progress_update', {'text': text, 'progress': progress, "frame": None},room=user_id)
        else:
            draw.text((x_position, y_position), char, font=font, fill=color)
            x_position += font.font.getsize(char)[0][0]

        cnt += 1
        progress = 100 * cnt / total
        if frame_cnts:
            text = f"[Ascii ({frame_cnts[0]}/{frame_cnts[1]}) - Generating Characters: {cnt}/{total}]"
        else:
            text = f"[Ascii - Generating Characters: {cnt}/{total}]"
        
    if custom_txt: text = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {text}]"
    socket.emit('progress_update', {'text': text, 'progress': 100, "frame": None},room=user_id)
    output_data = BytesIO()
    back.save(output_data, format='PNG')
    output_data.seek(0)

    return output_data,ascii_art