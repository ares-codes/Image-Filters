
import uuid 
import json
import os
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, join_room, leave_room
from io import BytesIO
from backend.helpers import run_media, get_results, run_filters
import base64

app = Flask(__name__)
socketio = SocketIO(app, async_mode='threading')

user_ids = {}
session_id = ""
@socketio.on('connect')
def handle_connect():
    global session_id
    session_id = request.sid

    # Check if the user has an existing ID
    if session_id in user_ids:
        user_id = user_ids[session_id]
    else:
        # Generate a new user ID using uuid
        user_id = str(uuid.uuid4())
        user_ids[session_id] = user_id
    
    join_room(user_id)

@socketio.on('disconnect')
def handle_disconnect():
    global session_id
    user_id = user_ids[session_id]

    # Remove the user ID when a client disconnects
    if  user_id in user_ids:
        print("Client disconnected:", session_id)

        leave_room(user_id)
        del user_ids[session_id]


@app.route('/string')
def string():
    return render_template('string.html')

@app.route('/quant')
def quant():
    return render_template('quant.html')

@app.route('/ascii')
def ascii():
    return render_template('ascii.html')

@app.route('/dither')
def dither():
    return render_template('dither.html')

@app.route('/misc')
def misc():
    return render_template('misc.html')

@app.route('/mosaic')
def mosaic():
    return render_template('mosaic.html')

@app.route('/shapes')
def shapes():
    return render_template('shapes.html')

@app.route('/style')
def style():
    return render_template('style.html')

@app.route('/trace')
def trace():
    return render_template('trace.html')

@app.route('/custom')
def custom():
    return render_template('custom.html')

@app.route('/')
def about():
    return render_template('about.html')


def updateParams(params,style_type,cnt):
    match style_type:
        case "Style":
            with open("static/uploaded_images/" + params[0], 'rb') as f:
                # Read the contents of the file
                file_content = f.read()
                return [BytesIO(file_content)]
        case "Misc":
            if params[0] == "Merge":
                params.pop()
                return params + [BytesIO(request.files[f"merge{cnt}"].read())]
            return params
        case "Mosaic":
            image_size = params.pop()
            
            images = [
                BytesIO(request.files[f"mosaic{cnt}_{i}"].read()) 
                for i in range(image_size)
            ]
            
            params.append(images)
            return params
        case _:
            return params

def common_media_handler(style_type):
    user_id = user_ids[session_id]
    media_file = BytesIO(request.files['media'].read())
    media_type = request.form["media_type"]
    params = json.loads(request.form["params"])

    params = updateParams(params,style_type,"0")
    return jsonify(run_media(style_type, params, media_file, media_type, user_id, None, socketio))

@app.route('/custom_media', methods=['POST'])
def custom_media():
    user_id = user_ids[session_id]
    res_file = [BytesIO(request.files['media'].read())]
    media_type = request.form["media_type"]
    params = json.loads(request.form["params"])
   
    cnt,total = 0, len(params)
    for param in params:
        cnt += 1
        custom_txt = (cnt,total)
        style_type = param[0]
        if(style_type == "Mosaic"):
            param.pop()
            param.append(len(param[1]))
            param = param[1:]
        param = updateParams(param[1:],style_type,cnt)
        socketio.emit('progress_update', {'text': f"[Custom ({cnt}/{total}) - Initializing]", 'progress': 0, "frame": None}, room=user_id)
        res_file = run_filters([style_type] + param,res_file[0],media_type,user_id,custom_txt,socketio)
        encoded_data = base64.b64encode(res_file[0].getvalue()).decode('utf-8')
        socketio.emit('progress_update', {'text': f"[Custom ({cnt}/{total}) - Complete]", 'progress': 100, "frame": encoded_data}, room=user_id)

    socketio.emit('progress_update', {'text': "[Custom - Complete]", 'progress': 100, "frame": None}, room=user_id)
    return jsonify(get_results(res_file,"Custom"))


@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    if file:
        file_path = os.path.join("static/uploaded_images", file.filename)
        file.save(file_path)
        return 'File uploaded successfully'
    return 'Invalid file format'

@app.route('/remove', methods=['POST'])
def remove_file():
    filename = request.form.get('filename')
    if filename:
        try:
            # Assuming files are stored in a specific directory
            filepath = os.path.join("static/uploaded_images", filename)
            os.remove(filepath)
            return 'File removed successfully'
        except OSError as e:
            return f'Error removing file: {e}'
    else:
        return 'Filename not provided', 400


@app.route('/shape_media', methods=['POST'])
def shape_media():
    return common_media_handler("Shape")

@app.route('/trace_media', methods=['POST'])
def trace_media():
    return common_media_handler("Trace")

@app.route('/style_media', methods=['POST'])
def style_media():
    return common_media_handler("Style")

@app.route('/string_media', methods=['POST'])
def string_media():
    return common_media_handler("String")

@app.route('/ascii_media', methods=['POST'])
def ascii_media():
    return common_media_handler("Ascii")

@app.route('/dither_media', methods=['POST'])
def dither_media():
    return common_media_handler("Dither")

@app.route('/misc_media', methods=['POST'])
def misc_media():
    return common_media_handler("Misc")

@app.route('/mosaic_media', methods=['POST'])
def mosaic_media():
    return common_media_handler("Mosaic")

@app.route('/quant_media', methods=['POST'])
def quant_media():
    return common_media_handler("Quant")

if __name__ == '__main__':
    socketio.run(app, debug = True)
