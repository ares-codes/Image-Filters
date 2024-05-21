import cv2
import numpy as np
from io import BytesIO
import random
from backend.vid import VideoProcessor
from PIL import Image, ImageOps, ImageFilter, ImageEnhance

def MiscVid(src_file,misc,socket,user_id,custom_txt):
    video_processor = VideoProcessor(
        filter_type="Misc",
        src_file=src_file,  
        processing_function=MiscImg,
        socket=socket,  
        user_id=user_id,  
        custom_txt=custom_txt,  
        misc = misc
    )      

    return video_processor.process_video()

def simulate_transparency(rgba_image, background_color=(255, 255, 255)):
    # Create a new image with the same size and mode as the input image
    transparent_image = Image.new('RGBA', rgba_image.size, background_color + (0,))
    # Paste the input image onto the transparent image using the alpha channel
    transparent_image.paste(rgba_image, (0, 0), mask=rgba_image)
    return transparent_image.convert("RGB")

def interpolate_color(color_low, color_high, steps):
    palette = [
        (
            int(color_low[0] + (color_high[0] - color_low[0]) * i / (steps - 1)),
            int(color_low[1] + (color_high[1] - color_low[1]) * i / (steps - 1)),
            int(color_low[2] + (color_high[2] - color_low[2]) * i / (steps - 1)),
        )
        for i in range(steps)
    ]
    return palette

def calculate_brightness(r, g, b):
    return int(0.299 * r + 0.587 * g + 0.114 * b)

def adjust_brightness(pixel, palette):
    r, g, b, a = pixel
    brightness = calculate_brightness(r, g, b)
    index = int(brightness * (len(palette) - 1) / 255)
    return palette[index] + (a,)

def MiscImg(media_image,misc,socket,user_id,custom_txt, frame_cnts = None):
    misc_filter = misc[0]
    new_image = media_image
    
    match misc_filter:
        case "Negate":
            new_image = ImageOps.invert(media_image)
        case "Brighten":
            brightness_factor = float(misc[1])  
            enhancer = ImageEnhance.Brightness(media_image)
            new_image = enhancer.enhance(brightness_factor)
        case "Blur":
            # Calculate the number of times to apply the blur filter based on the intensity
            blur_intensity = int(misc[1])
            blur_iterations =  blur_intensity # Adjust the scaling factor as needed
            new_image = media_image

            if frame_cnts:
                text = f"[Blur ({frame_cnts[0]}/{frame_cnts[1]}) - Updating Pixels]"
            else:
                text = "[Blur - Updating Pixels]"

            for cnt in range(blur_iterations):
                new_image = new_image.filter(ImageFilter.BLUR)
                progress = 100 * (cnt + 1) / blur_iterations
                if custom_txt: text = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {text}]"
                socket.emit('progress_update', {'text': text, 'progress': progress, "frame": None}, room = user_id)

        case "Sharp":
            sharpen_intensity = int(misc[1])
            sharpen_iterations = sharpen_intensity

            new_image = media_image
            if frame_cnts:
                text = f"[Sharpen ({frame_cnts[0]}/{frame_cnts[1]}) - Updating Pixels]"
            else:
                text = "[Sharpen - Updating Pixels]"

            for cnt in range( sharpen_iterations):
                new_image = new_image.filter(ImageFilter.SHARPEN)
                progress = 100 * (cnt + 1) /  sharpen_iterations
                if custom_txt: text = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {text}]"
                socket.emit('progress_update', {'text': text, 'progress': progress, "frame": None}, room = user_id)

        case "Contrast":
            contrast_factor = float(misc[1])
            if contrast_factor == 1: 
                # Convert the PIL image to a NumPy array
                image_np = np.array(media_image)

                # Perform histogram equalization
                # Split the image into its color channels
                b, g, r = cv2.split(image_np)

                # Perform histogram equalization on each channel
                b_eq = cv2.equalizeHist(b)
                g_eq = cv2.equalizeHist(g)
                r_eq = cv2.equalizeHist(r)

                # Merge the equalized channels back into an RGB image
                equalized_image_np = cv2.merge((b_eq, g_eq, r_eq))
                new_image = Image.fromarray(equalized_image_np)
            else:
                enhancer = ImageEnhance.Contrast(media_image)
                new_image = enhancer.enhance(contrast_factor)
        case "Pixelate":
            pixelation_factor = int(misc[1]) 
            original_width, original_height = media_image.size
            small_image = media_image.resize((max(original_width // pixelation_factor,1), max(original_height // pixelation_factor,1)), Image.NEAREST)
            new_image = small_image.resize((original_width, original_height), Image.NEAREST)
        case "Resize":
            original_width, original_height = media_image.size
            width = min(2 * original_width, int(misc[1]))
            height = min(2 * original_height, int(misc[2]))
            new_image = media_image.resize((width,height))
        case "Crop":
            original_width, original_height = media_image.size

            x1 = min(max(0,int(misc[1])),original_width - 1)
            y1 = min(max(0,int(misc[2])),original_height - 1)

            x2 = min(original_width, int(misc[3]) + x1)
            y2 = min(original_height, int(misc[4]) + y1)

            box =  (x1, y1, x2, y2)
            new_image = media_image.crop(box)
          
        case "Fade":
            transparency = int(misc[1])
            image = media_image.convert('RGBA')
            r, g, b, a = image.split()
            new_alpha = Image.new('L', image.size, transparency)
            new_image = Image.merge('RGBA', (r, g, b, new_alpha))

            if (custom_txt and custom_txt[0] < custom_txt[1]) or frame_cnts: 
                new_image = simulate_transparency(new_image)

        case "Color":
            pixels = list(media_image.getdata())
            scale = float(misc[1])

            r,g,b = misc[2]
            custom_scale = [1,1,1]

            custom_scale[0] += (r / 255) * scale
            custom_scale[1] += (g / 255) * scale
            custom_scale[2] += (b / 255) * scale

            custom_scaled_pixels = [
                (
                    int(pixel[0] * custom_scale[0]),
                    int(pixel[1] * custom_scale[1]),
                    int(pixel[2] * custom_scale[2])
                )
                for pixel in pixels
            ]

            new_image = Image.new("RGBA", media_image.size)
            new_image.putdata(custom_scaled_pixels)

        case "Gradient":
            pixels = list(media_image.convert('RGBA').getdata())
            low = misc[1]
            high = misc[2]

            palette = interpolate_color(low, high, 255)
            new_pixels = [adjust_brightness(pixel, palette) for pixel in pixels]

            new_image = Image.new("RGBA", media_image.size)
            new_image.putdata(new_pixels)
        case "Saturate":
            saturation_factor = float(misc[1])   
            enhancer = ImageEnhance.Color(media_image)
            new_image = enhancer.enhance(saturation_factor)
        case "Solarize":
            solarize_threshold = int(misc[1])
            new_image = ImageOps.solarize(media_image, threshold=solarize_threshold)
        case "Flip":
            val = int(misc[1])
            if val == 0: # Flip horizontally
                new_image = media_image.transpose(Image.FLIP_LEFT_RIGHT)
            else: # Flip vertically
                new_image = media_image.transpose(Image.FLIP_TOP_BOTTOM)
        case "Kernel":
            image_array = np.array(media_image)
            convolved_image = cv2.filter2D(image_array, -1, np.array(misc[1]),borderType=cv2.BORDER_CONSTANT)
            new_image = Image.fromarray(convolved_image)
        case "Rotate":
            angle = int(misc[1])
            if angle == 360:
                angle = 360 * random.random()
            # Rotate the image
            rotated_image = media_image.rotate(angle)
            # Convert the rotated image to a NumPy array
            rotated_array = np.array(rotated_image)
            new_image = Image.fromarray(rotated_array)
       
        case "Merge":
            second_data = misc[1].getvalue()
            img_array = np.frombuffer(second_data, dtype=np.uint8)
            img_array = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            img_array = cv2.cvtColor(img_array, cv2.COLOR_BGR2RGBA)
            second_img = Image.fromarray(img_array).convert("RGBA")

            width, height = max(media_image.width, second_img.width), max(media_image.height, second_img.height)
            image1 = media_image.resize((width, height))
            image2 = second_img.resize((width, height))

            image1 = image1.convert("RGBA")
            image2 = image2.convert("RGBA")

            pixels1 = image1.load()
            pixels2 = image2.load()

            new_image = Image.new("RGBA", (width, height))
            pixels_merged = new_image.load()

            cnt = 0
            total = width * height
            if frame_cnts:
                text = f"[Merge ({frame_cnts[0]}/{frame_cnts[1]}) - Updating Pixels]"
            else:
                text = "[Merge - Updating Pixels]"

            for i in range(width):
                for j in range(height):
                    pixel1 = pixels1[i, j]
                    pixel2 = pixels2[i, j]

                    merged_pixel = (
                        int((pixel1[0] + pixel2[0]) / 2),
                        int((pixel1[1] + pixel2[1]) / 2),
                        int((pixel1[2] + pixel2[2]) / 2)
                    )

                    pixels_merged[i, j] = merged_pixel
                    cnt += 1
                progress = 100 * cnt / total
                new_txt = text
                if custom_txt: new_txt = f"[Custom ({custom_txt[0]}/{custom_txt[1]}) - {text}]"
                socket.emit('progress_update', {'text': new_txt, 'progress': progress, "frame": None}, room = user_id)
        case _:
            pass

    output_data = BytesIO()
    new_image = new_image.convert("RGBA")
    new_image.save(output_data, format='PNG')
    output_data.seek(0)
    return output_data