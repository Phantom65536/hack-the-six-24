import os
import time

import requests
from google.auth import default
from google.auth.transport.requests import Request
import google.generativeai as genai
from dotenv import load_dotenv

# Load the environment variables
load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Get the OAuth 2.0 token
credentials, _ = default()
credentials.refresh(Request())
access_token = credentials.token

# Define the parameters
bucket_name = 'hackthe6ix'
object_name = 'camera_output_no_check.mp4'
object_location = './camera_output_no_check.mp4'  # Path to the file you want to upload
content_type = 'video/mp4'  # Content type of the file

# Prepare the headers
headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': content_type
}

# Open the file and make the POST request
with open(object_location, 'rb') as file:
    response = requests.post(
        f'https://storage.googleapis.com/upload/storage/v1/b/{bucket_name}/o?uploadType=media&name={object_name}',
        headers=headers,
        data=file
    )

# Check the response
if response.status_code == 200:
    print('Upload successful!')
    print(response.json())
else:
    print(f'Upload failed with status code {response.status_code}')
    print(response.text)

gcs_file_id = response.json()['id']

video_file = genai.upload_file(path=object_location)
print(video_file.name)
print(f"Completed upload: {video_file.uri}")

while video_file.state.name == "PROCESSING":
    print('.', end='')
    time.sleep(2)
    video_file = genai.get_file(video_file.name)

if video_file.state.name == "FAILED":
    raise ValueError(video_file.state.name)

gemini_file_id = video_file.name

# Open the file and make the POST request
with open(object_location, 'rb') as file:
    response = requests.post(
        f'http://localhost:6000/api/upload',
        headers={"Content-Type": "application/json"},
        json={
            "video_file_name": gemini_file_id,
            "gcs_file_name": gcs_file_id,
            "shoulder_check_done" : 2,
            "number_of_turns": 3,
            "drowsiness_detected" : 1
}
)

# Check the response
if response.status_code == 200:
    print('Upload successful!')
    print(response.json())
else:
    print(f'Upload failed with status code {response.status_code}')
    print(response.text)