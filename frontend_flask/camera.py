from datetime import datetime
import argparse
import json
import os
import socketio

import dlib
import cv2
from threading import Thread
import playsound
import numpy as np
from dotenv import load_dotenv
from inference import get_model
import supervision as sv
import requests
from google.auth import default
from google.auth.transport.requests import Request
import reference as world
import socketio


fps = 30
turning_angle_thres, turning_consec_count_thres = 25, 5
gyro_thres, gyro_consec_count_thres = 1.5, 3                   # assuming sum of latest two values is used
drosiness_consec_count_thres = 25                              # assuming 30fps
focal = 1
gcp_bucket_name = 'hackthe6ix'

gyroscope_data = ""

load_dotenv()

sio = socketio.Client()
@sio.on('gyroscopeData')
def on_gyroscope_data(data):
    global gyroscope_data
    # print('Gyroscope data received:', data)
    gyroscope_data = data

def get_argparser():
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", nargs='?', type=str, default="",
                        help="Path of the video or image to detect faces in. If Blank, camera feed will be used.")
    parser.add_argument("--face_detector_type", nargs='?', type=str, default="hog",
                        help="face_detector_type")
    return parser.parse_args()
def sound_alarm(path):
    # play an alarm sound
    playsound.playsound(path)


def upload_to_gcs(access_token, object_name, drowsiness_count, shoulder_check_count, turn_count):
    # Prepare the headers
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'video/mp4'
    }

    # Open the file and make the POST request
    with open('./' + object_name, 'rb') as file:
        response = requests.post(
            f'https://storage.googleapis.com/upload/storage/v1/b/{gcp_bucket_name}/o?uploadType=media&name={object_name}',
            headers=headers,
            data=file
        )

    # Check the response
    if response.status_code == 200:
        print('Upload successful!')
        gcs_file_id = response.json()['id']
    else:
        print(f'Upload failed with status code {response.status_code}')
        print(response.text)
        gcs_file_id = -1

    data = {
        "gcs_file_name": object_name,
        "video_public_url": f"https://storage.googleapis.com/{gcp_bucket_name}/{object_name}",
        "shoulder_check_done": shoulder_check_count,
        "number_of_turns": turn_count,
        "drowsiness_detected": drowsiness_count
    }
    return data


consecutive_counts = [0] * 5
last = [False] * 5
decision = [False] * 5
def consecutive_check(data, upper_threshold, counts_threshold, consec_count_index):
    global consecutive_counts, last, decision
    result = (consec_count_index == 4 and data == upper_threshold) or (consec_count_index < 4 and data >= upper_threshold)
    if result == last[consec_count_index]:
        consecutive_counts[consec_count_index] += 1
    else:
        consecutive_counts[consec_count_index] = 1
        last[consec_count_index] = result
    if consecutive_counts[consec_count_index] >= counts_threshold:
        decision[consec_count_index] = last[consec_count_index]
    return decision[consec_count_index]

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

        self.alarm_on, self.drowsiness_count = False, 0
        self.shoulder_check_detected, self.shoulder_check_count = False, 0
        self.turn_detected, self.turn_count = False, 0
        self.recorded = False

        # connect to roboflow model
        self.model = get_model(model_id="drowsiness-detect-ozdfk/3")

        # Get the OAuth 2.0 token
        credentials, _ = default()
        credentials.refresh(Request())
        self.access_token = credentials.token

        sio.connect('http://localhost:3000')

        self.detector = dlib.get_frontal_face_detector()
        self.predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")
        self.face3Dmodel = world.ref3DModel()

        print("Camera initialized")

    def __del__(self):
        self.video.release()

    def start_recording(self):
        if self.recording_output is not None:
            print("Already recording")
            return {"error": "Already recording"}

        out_name = f"camera_output_{datetime.now().isoformat()}.mp4"
        self.recording_file_name = out_name
        self.recording_output = cv2.VideoWriter(out_name, self.fourcc, self.fps / 4, (self.width, self.height))
        print("start recording to ", out_name)
        self.drowsiness_count, self.shoulder_check_count, self.turn_count = 0, 0, 0
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
        data = upload_to_gcs(self.access_token, out_name, self.drowsiness_count, self.shoulder_check_count, self.turn_count)
        return data

    def get_frame(self):
        ret, frame = self.video.read()
        # print("frameeeeeeee")
        # drowsiness model inference
        results = self.model.infer(frame)[0]
        detections = sv.Detections.from_inference(results)
        result = detections.data['class_name']
        drowsy_class_text = result[0] if len(result) > 0 else "No face detected"
        cv2.putText(frame, f"{drowsy_class_text}", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 80), 2)
        if len(result) > 0 and consecutive_check(result[0], "drowsy", drosiness_consec_count_thres, 4):
            cv2.putText(frame, "drowsiness detected", (650, 150),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            if not self.alarm_on:
                self.alarm_on = True
                self.drowsiness_count += 1
                t = Thread(target=sound_alarm,
                           args=("alarm.wav",))
                t.deamon = True
                t.start()
        else:
            self.alarm_on = False

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.detector(gray)  # detect face

        if len(faces) > 0:
            # we only consider the first face detected
            x1 = faces[0].left()
            y1 = faces[0].top()
            x2 = faces[0].right()
            y2 = faces[0].bottom()

            # Note: cv2 color scheme is BGR.
            # Detection is done on Grayscale image and mapped back to BGR to display.
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 3)  # plot rectangle around the face

            landmarks = self.predictor(gray, faces[0])  # detect 68 landmarks

            refImgPts = world.ref2dImagePoints(landmarks)

            height, width, channels = frame.shape
            focalLength = focal * width
            cameraMatrix = world.cameraMatrix(focalLength, (height / 2, width / 2))

            mdists = np.zeros((4, 1), dtype=np.float64)

            # calculate rotation and translation vector using solvePnP
            success, rotationVector, translationVector = cv2.solvePnP(
                self.face3Dmodel, refImgPts, cameraMatrix, mdists)

            noseEndPoints3D = np.array([[0, 0, 1000.0]], dtype=np.float64)
            noseEndPoint2D, jacobian = cv2.projectPoints(
                noseEndPoints3D, rotationVector, translationVector, cameraMatrix, mdists)

            #  draw nose line
            p1 = (int(refImgPts[0, 0]), int(refImgPts[0, 1]))
            p2 = (int(noseEndPoint2D[0, 0, 0]), int(noseEndPoint2D[0, 0, 1]))
            cv2.line(frame, p1, p2, (110, 220, 0),
                     thickness=2, lineType=cv2.LINE_AA)

            # calculating euler angles
            rmat, jac = cv2.Rodrigues(rotationVector)
            angles, mtxR, mtxQ, Qx, Qy, Qz = cv2.RQDecomp3x3(rmat)
            horizontal_angle = angles[1]
            cv2.putText(frame, f"horizontal_angle: {horizontal_angle:.2f}", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 80), 2)

            # Retrieve current and last gyro data
            sio.emit('getGyroscopeData')
            gyro_y = sum(list(map(float, gyroscope_data.strip('[]').split(',')))) if gyroscope_data != "" else 0
            left_turn = consecutive_check(gyro_y, gyro_thres, gyro_consec_count_thres, 0)
            right_turn = consecutive_check(-gyro_y, gyro_thres, gyro_consec_count_thres, 2)
            left_shoulder_check = consecutive_check(-horizontal_angle, turning_angle_thres, turning_consec_count_thres, 1)
            right_shoulder_check = consecutive_check(horizontal_angle, turning_angle_thres, turning_consec_count_thres, 3)
            if left_turn or right_turn:
                cv2.putText(frame, "gyro turning detected", (500, 70),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                if not self.turn_detected:
                    self.turn_count += 1
                    self.turn_detected = True
            else:
                self.turn_detected = False
            if left_shoulder_check or right_shoulder_check:
                cv2.putText(frame, "head turning detected", (500, 100),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            if (left_turn and left_shoulder_check) or (right_turn and right_shoulder_check):
                cv2.putText(frame, "shoulder check present", (500, 150),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                if not self.shoulder_check_detected:
                    self.shoulder_check_count += 1
                    self.shoulder_check_detected = True
            else:
                self.shoulder_check_detected = False

        cv2.putText(frame, f"drowsiness count: {self.drowsiness_count}", (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 80), 2)
        cv2.putText(frame, f"shoulder check percentage: {self.shoulder_check_count} / {self.turn_count}", (50, 250), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 80), 2)

        # cv2.imshow("Frame", frame)
        frame_data = {
            "drowsiness_count": self.drowsiness_count,
            "shoulder_check_count": self.shoulder_check_count,
            "turn_count": self.turn_count,
            "frame": frame
        }


        if self.recording_output is not None:
            self.recording_output.write(frame)
        ret, jpeg = cv2.imencode('.jpg', frame)
        # print("outout frameeeeeeeee")
        return jpeg.tobytes()
