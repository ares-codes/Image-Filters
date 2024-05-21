import numpy as np
import tensorflow as tf
from io import BytesIO
from PIL import Image
import cv2
from backend.vid import VideoProcessor

model = tf.keras.models.load_model('static/style_model')
def load_image(img_data):
    img_array = np.frombuffer(img_data, dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    img = tf.image.convert_image_dtype(img, tf.float32)
    img = img[tf.newaxis, :]
    return img

def StyleVid(src_file,style_data,socket, user_id,custom_txt):
    video_processor = VideoProcessor(
        filter_type="Style",
        src_file=src_file, 
        processing_function=StyleImg,
        socket=socket,  
        user_id=user_id,  
        custom_txt=custom_txt,  
        style_data = style_data
    )      

    return video_processor.process_video()
    
def StyleImg(image_data,style_data):
    content_image = load_image(image_data)
    style_image = load_image(style_data)

    stylized_images = model(tf.constant(content_image), tf.constant(style_image))
    stylized_image = stylized_images[0]
  
    # Convert the tensor to a NumPy array
    stylized_image_np = stylized_image.numpy()

    # Ensure the shape is appropriate (H, W, C) or (H, W), and data type is uint8
    if stylized_image_np.ndim == 4 and stylized_image_np.shape[0] == 1:
        stylized_image_np = stylized_image_np.squeeze(axis=0)

    # Normalize pixel values to the range [0, 255]
    stylized_image_np = (stylized_image_np * 255).astype(np.uint8)

    pil_image = Image.fromarray(stylized_image_np)

    # Create a BytesIO object to store the PNG image
    img_buffer = BytesIO()

    # Save the PIL Image as PNG to the BytesIO object
    pil_image.save(img_buffer, format='PNG')

    # Move the file position back to the beginning if needed
    img_buffer.seek(0)

    return img_buffer