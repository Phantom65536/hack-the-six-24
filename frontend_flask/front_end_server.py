from flask import Flask, request, jsonify, render_template, Response
from flask_cors import CORS
import time
import os
import google.generativeai as genai
from dotenv import load_dotenv
from flasgger import Swagger

from camera import VideoCamera

app = Flask("frontend_server")
swagger = Swagger(app)
CORS(app)

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

video_camera = VideoCamera()


@app.route('/')
def index():
    return render_template('index.html')


def gen(camera):
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')


@app.route('/video_feed')
def video_feed():
    return Response(gen(video_camera),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/start_recording', methods=['POST'])
def start_recording():
    try:
        response = video_camera.start_recording()
        if "error" in response:
            return jsonify(response), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify(response)


@app.route('/end_recording', methods=['POST'])
def end_recording():
    try:
        response = video_camera.end_recording()
        if "error" in response:
            return jsonify(response), 400
        gemini_file_name = upload_recording_gemini(response["file_name"])
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "file_name": response["file_name"],
        "gemini_file_name": gemini_file_name
    })

def upload_recording_gemini(file_name):
    video_file = genai.upload_file(path=file_name)
    print(video_file.name)
    print(f"Completed upload: {video_file.uri}")

    while video_file.state.name == "PROCESSING":
        print('.', end='')
        time.sleep(2)
        video_file = genai.get_file(video_file.name)

    if video_file.state.name == "FAILED":
        raise ValueError(video_file.state.name)

    return video_file.name

if __name__ == '__main__':
    app.run(host='localhost', port=3000, threaded=True, use_reloader=False, debug=True)