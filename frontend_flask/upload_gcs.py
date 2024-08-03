import requests
from google.auth import default
from google.auth.transport.requests import Request

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
