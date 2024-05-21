from PIL import Image
from io import BytesIO
from backend.vid import VideoProcessor

def QuantVid(src_file,palette,multiplier, socket, user_id,custom_txt):
    video_processor = VideoProcessor(
        filter_type="Quant",
        src_file=src_file, 
        processing_function=QuantImg,
        socket=socket,  
        user_id=user_id,  
        custom_txt=custom_txt,  
        palette=palette, 
        multiplier=multiplier, 
    )      

    return video_processor.process_video()

def QuantImg(colorImg,palette,multiplier):

    p_img = Image.new('P', colorImg.size)
    p_img.putpalette(palette * multiplier)
  
    colorImg = colorImg.convert("RGB")
    colorImg = colorImg.quantize(palette=p_img, dither = 0).convert("RGBA")

    output_data = BytesIO()
    colorImg.save(output_data, format='PNG')
    output_data.seek(0)

    return output_data