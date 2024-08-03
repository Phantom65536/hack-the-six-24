from datetime import datetime

import cv2

class VideoCamera(object):
    def __init__(self):
        self.video = cv2.VideoCapture(0)
        self.video.set(cv2.CAP_PROP_FPS, 15)

        self.fps = self.video.get(cv2.CAP_PROP_FPS)
        self.width = int(self.video.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.video.get(cv2.CAP_PROP_FRAME_HEIGHT))

        self.fourcc = cv2.VideoWriter_fourcc(*'FMP4')
        self.recording_file_name = None
        self.recording_output = None


    def __del__(self):
        self.video.release()

    def start_recording(self):
        if self.recording_output is not None:
            print("Already recording")
            return {"error": "Already recording"}

        out_name = f"recordings/camera_output_{datetime.now().time().strftime('%H:%M:%S')}.mp4"
        self.recording_file_name = out_name
        self.recording_output = cv2.VideoWriter(out_name, self.fourcc, self.fps, (self.width, self.height))
        print("start recording to ", out_name)
        return {"file_name": out_name}

    def end_recording(self):
        if self.recording_output is None:
            print("Not recording")
            return {"error": "Not recording"}

        self.recording_output.release()
        print("Recording released")
        out_name = self.recording_file_name
        self.recording_file_name = None
        self.recording_output = None
        print("end recording to ", out_name)
        return {"file_name": out_name}

    def get_frame(self):
        ret, frame = self.video.read()
        if self.recording_output is not None:
            self.recording_output.write(frame)
        ret, jpeg = cv2.imencode('.jpg', frame)
        return jpeg.tobytes()
