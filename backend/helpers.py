import base64
from PIL import Image
from io import BytesIO
from backend.quant import QuantImg, QuantVid
from backend.trace import TraceImg,TraceVid
from backend.shape import ShapeImg,ShapeVid
from backend.mosaic import MosaicImg, MosaicVid
from backend.string import StringImg,StringVid
from backend.ascii import AsciiImg, AsciiVid
from backend.dither import DitherImg, DitherVid
from backend.misc import MiscImg, MiscVid
from backend.style import StyleImg,StyleVid

def run_media(txt,params,media_file,media_type,user_id,custom_txt,socket):
    socket.emit('progress_update', {'text': f"[{txt} - Initializing]", 'progress': 0, "frame": None}, room=user_id)
    new_media = run_filters([txt] + params,media_file,media_type,user_id,custom_txt,socket)
    result = get_results(new_media, txt)
    socket.emit('progress_update', {'text': f"[{txt} - Complete]", 'progress': 100, "frame": None}, room=user_id)
    return result

def get_results(res,txt):
    if res == None:
        result =  {
            'message': f'{txt} rendering unsuccessful',
            'media_url': None,  # Provide the URL to the rendered image
        }
    else:
        res[0] =  base64.b64encode(res[0].getvalue()).decode('utf-8')
        result = {
            'message': f'{txt} rendering successful',
            'media_url': res,  # Provide the URL to the rendered image
        }
    
    return result

def run_filters(fil,res_file,media_type,user_id,custom_txt,socket):
    if media_type == "image":
        return img_filter(fil,res_file,user_id,custom_txt,socket)
    elif  media_type == "video":
        return [vid_filter(fil,res_file,user_id,custom_txt,socket)]
    else:
        return None

def img_filter(fil,res_file,user_id,custom_txt,socket):
    match fil[0]:
        case "Ascii":
            chars = fil[1]
            cols = fil[2]
            text_color = tuple(fil[3])
            background = tuple(fil[4])
            out,ascii_art = AsciiImg(res_file.getvalue(),chars,cols,text_color,background,socket, user_id, custom_txt)
            return [out,ascii_art]
        case "Dither":
            palette = fil[1]
            dither_type = fil[2]
            matrix = fil[3]
            colorImg = Image.open(res_file).convert("RGB")
            return [DitherImg(colorImg,palette, dither_type, matrix, socket, user_id,custom_txt)]
        case "Misc":
            misc = fil[1:]
            colorImg = Image.open(res_file).convert("RGB")
            return [MiscImg(colorImg,misc,socket,user_id,custom_txt)]
        case "Mosaic":
            tile_width = fil[1]
            tile_length = fil[2]
            images = fil[3]
            large_image = Image.open(res_file).convert("RGB")
            out,_,_ = MosaicImg(large_image, tile_width,tile_length,images,socket, user_id,custom_txt)
            return [out]
        case "Quant":
            palette = fil[1]
            multiplier = int(768 / len(palette))
            colorImg = Image.open(res_file).convert("RGB")
            return [QuantImg(colorImg,palette,multiplier)]
        case "Shape":
            shape = fil[1]
            border_color = tuple(fil[2])
            background = tuple(fil[3])
            rotation = fil[4]
            return [ShapeImg(res_file.getvalue(),shape,rotation,border_color,background,socket,user_id,custom_txt)]
        case "String":
            nail_cnt = fil[1]
            string_color = tuple(fil[2])
            background_color = tuple(fil[3])
            border_shape = fil[4]
            line_cnt = fil[5]
            out,_,nail_txt = StringImg(res_file.getvalue(), nail_cnt, string_color, background_color, border_shape, line_cnt,socket,user_id,custom_txt)
            return [out,nail_txt]
        case "Style":
            style_data = fil[1].getvalue()
            return [StyleImg(res_file.getvalue(),style_data)]
        case "Trace":
            one_line = fil[1]
            line_color = tuple(fil[2])
            background_color = tuple(fil[3])
            out,curve_txt = TraceImg(res_file.getvalue(),one_line,line_color,background_color,socket, user_id,custom_txt)
            return [out,curve_txt]
        case _:
            return [res_file]

def vid_filter(fil,res_file,user_id,custom_txt,socket):
    file_name = res_file.getvalue()
    match fil[0]:
        case "Ascii":
            chars = fil[1]
            cols = fil[2]
            text_color = tuple(fil[3])
            background = tuple(fil[4])
            return AsciiVid(file_name, chars, cols, text_color, background, socket, user_id, custom_txt)
        case "Dither":
            palette = fil[1]
            dither_type = fil[2]
            matrix = fil[3]
            return DitherVid(file_name,palette,dither_type,matrix,socket,user_id,custom_txt)
        case "Misc":
            misc = fil[1:]
            return MiscVid(file_name,misc,socket,user_id,custom_txt)
        case "Mosaic":
            tile_width = fil[1]
            tile_length = fil[2]
            images = fil[3]
            return MosaicVid(file_name, tile_width, tile_length, images, socket, user_id, custom_txt)
        case "Quant":
            palette = fil[1]
            multiplier = int(768 / len(palette))
            return QuantVid(file_name, palette, multiplier, socket, user_id, custom_txt)
        case "Shape":
            shape = fil[1]
            border_color = tuple(fil[2])
            background = tuple(fil[3])
            rotation = fil[4]
            return ShapeVid(file_name,shape,border_color,rotation,background,socket, user_id,custom_txt)
        case "String":
            nail_cnt = fil[1]
            string_color = tuple(fil[2])
            background_color = tuple(fil[3])
            border_shape = fil[4]
            line_cnt = fil[5]
            return StringVid(file_name, nail_cnt, string_color, background_color, border_shape, line_cnt,socket,user_id,custom_txt)
        case "Style":
            style_data = fil[1].getvalue()
            return StyleVid(file_name,style_data,socket,user_id,custom_txt)
        case "Trace":
            one_line = fil[1]
            line_color = tuple(fil[2])
            background_color = tuple(fil[3])
            return TraceVid(file_name,one_line,line_color,background_color,socket, user_id,custom_txt)
        case _:
            return res_file