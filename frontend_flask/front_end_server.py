from flask import Flask, request, jsonify, render_template, Response
from flask_cors import CORS
import time
import os
from dotenv import load_dotenv

print("Importing camera")

from camera import VideoCamera

print("Starting frontend server")

app = Flask("frontend_server")
CORS(app)

load_dotenv()

print("Starting camera")

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
        # gemini_file_name = upload_recording_gemini(response["file_name"])
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(response)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000, threaded=True, use_reloader=False, debug=True) #100.67.76.199
