import cv2
import imageio
import numpy as np
from PIL import Image
import base64
from io import BytesIO
import os

class VideoProcessor:
    def __init__(self, filter_type, src_file, processing_function, socket, user_id, custom_txt=None, **process_kwargs):
        self.filter_type = filter_type
        self.processing_function = processing_function
        self.socket = socket
        self.user_id = user_id
        self.custom_txt = custom_txt
        self.kwargs = process_kwargs
        self.reader = imageio.get_reader(src_file, format='mp4')
        self.fps = self.reader.get_meta_data().get('fps', 1)
        self.duration = self.reader.get_meta_data().get('duration', 1)
        self.count = 0
        self.out_file = f"static/out{user_id}.mp4"
        self.writer = imageio.get_writer(self.out_file, fps=self.fps)
        self.frame_cnt = int(self.fps * self.duration)
    
    def process_video(self):
        if self.filter_type not in ["Quant","Style"]:
            self.kwargs["socket"] = self.socket
            self.kwargs["user_id"] = self.user_id
            self.kwargs["custom_txt"] = self.custom_txt
        
        # Iterate through frames
        for frame in self.reader:  
            read_frame = self._read_frame(frame)
            progress = (self.count / self.frame_cnt) * 100
            text = self._get_progress_text()
         
            if self.filter_type == "Trace":
                if self.kwargs["one_line"]:
                    progress = 100
                else:
                    text = "[Tracing - Frame " + str(self.count) + "/" + str(self.frame_cnt) + "]"

            if self.custom_txt:
                text = f"[Custom ({self.custom_txt[0]}/{self.custom_txt[1]}) - {text}]"

            self._emit_progress_update(text, progress,read_frame)

        return self._cleanup()

    def _read_frame(self,img):
        new_frame,bytes_frame = None,None

        if self.filter_type not in ["Quant","Style"]:
            self.kwargs["frame_cnts"] = (self.count + 1, self.frame_cnt)

      
        height,width, _ = img.shape
        _, buffer = cv2.imencode(".png", img)
        image_bytes = buffer.tobytes()


        if self.filter_type in ["Trace"]:
            frame, _ = self.processing_function(image_bytes, **self.kwargs)
        elif self.filter_type == "Ascii":
            # Convert BGR to RGB
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

            # Encode the RGB image to base64
            _, buffer = cv2.imencode(".png", img_rgb)
            image_bytes = buffer.tobytes()

            frame, _ = self.processing_function(image_bytes, **self.kwargs)

        elif self.filter_type == "Shape":
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

            # Encode the RGB image to base64
            _, buffer = cv2.imencode(".png", img_rgb)
            image_bytes = buffer.tobytes()

            frame = self.processing_function(image_bytes, **self.kwargs)
        elif self.filter_type in ["Dither", "Misc", "Quant"]:
            colorImg = Image.fromarray(img).convert("RGB")
            frame = self.processing_function(colorImg, **self.kwargs)
        elif self.filter_type == "Mosaic":
            large_image = Image.fromarray(img)
            frame, tile_images, average_colors = self.processing_function(large_image, **self.kwargs)
              
            self.kwargs["tile_images"] = tile_images
            self.kwargs["average_colors"] = average_colors
        elif self.filter_type == "String":
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            _, buffer = cv2.imencode(".png", img_rgb)
            image_bytes = buffer.tobytes()
            frame, line_points, _ = self.processing_function(image_bytes, **self.kwargs)
               
            self.kwargs["line_points"] = line_points
        elif self.filter_type == "Style":
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

            # Convert the NumPy array to a BytesIO object
            img_buffer = BytesIO()
            img_pil = Image.fromarray(img_rgb)  # Assuming you have PIL installed
            img_pil.save(img_buffer, format='PNG')

            # Move the file position back to the beginning if needed
            img_buffer.seek(0)
            frame = self.processing_function(img_buffer.getvalue(), **self.kwargs)

        pil_image = Image.open(frame).convert("RGB")
        numpy_array = np.array(pil_image)
        bytes_frame = frame

        if self.filter_type in ["Ascii", "Mosaic", "Misc"]:
            new_frame = numpy_array
        elif self.filter_type in ["Dither", "Quant", "Shape", "String", "Style", "Trace"]:
            new_frame = cv2.resize(numpy_array, (width, height))
            
        self.count += 1
        self.writer.append_data(new_frame)
        return bytes_frame

    def _get_progress_text(self):
        return f"[{self.filter_type} ({self.count}/{self.frame_cnt}) Complete]"

    def _emit_progress_update(self, text, progress,frame):
        encoded_data = base64.b64encode(frame.getvalue()).decode('utf-8')
        self.socket.emit('progress_update', {'text': text, 'progress': progress, "frame": encoded_data}, room=self.user_id)

    def _cleanup(self):
        self.writer.close()
     
        with open(self.out_file, 'rb') as file:
            video_bytes = BytesIO(file.read())
        
        os.remove(self.out_file)
        return video_bytes