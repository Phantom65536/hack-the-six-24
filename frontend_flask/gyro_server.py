from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    print('New client connected')

@socketio.on('gyroscopeData')
def handle_gyroscope_data(data):
    print('Gyroscope data received:', data)
    emit('gyroscopeData', data, broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    socketio.run(app, port=4000)