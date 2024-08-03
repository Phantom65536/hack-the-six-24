from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

gyroscope_data = []

@socketio.on('connect')
def handle_connect():
    print('New client connected')

@socketio.on('gyroscopeData')
def handle_gyroscope_data(data):
    global gyroscope_data
    print('Gyroscope data received:', data)
    gyroscope_data = data
    # emit('gyroscopeData', data, broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

def get_gyroscope_data():
    global gyroscope_data
    return gyroscope_data

if __name__ == '__main__':
    socketio.run(app, port=4000)