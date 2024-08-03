import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Adjust the URL as necessary

const Dashcam = () => {
  const [isRecording, setIsRecording] = useState(true); // State to track if video is receiving
  const theme = useTheme();
  const videoRef = useRef(null);

  const startReceivingVideo = () => {
    socket.on('video-frame', (data) => {
      if (videoRef.current) {
        videoRef.current.src = `data:image/jpeg;base64,${data}`;
      }
    });
  };

  const stopReceivingVideo = () => {
    socket.off('video-frame');
    if (videoRef.current) {
      videoRef.current.src = '';
    }
  };

  useEffect(() => {
    startReceivingVideo();
    return () => {
      stopReceivingVideo(); // Stop receiving video on component unmount
    };
  }, []);

  const handlePlayStop = () => {
    setIsRecording(!isRecording);
  };

  useEffect(() => {
    const startRecording = async () => {
      try {
        console.log('Start')
        const response = await fetch('http://127.0.0.1:3000/start_recording', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to start recording');
        }
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    };

    const stopRecording = async () => {
      try {
        console.log('Stop');
        const response = await fetch('http://127.0.0.1:3000/stop_recording', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to stop recording');
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    };

    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);

  return (
    <Box sx={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Box
          sx={{
            flex: 2,
            backgroundColor: 'black',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            ref={videoRef}
            alt="Live Video Stream"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            backgroundColor: '#f0f0f0',
            padding: '10px',
            height: '100%',
          }}
        >
          {/* Notification area */}
          <Typography variant="body2">
            Notifications will appear here
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          backgroundColor:
            theme.palette.mode === 'dark' ? '#1f1f1f' : '#f0f0f0',
          padding: '20px',
          display: 'flex',
          width: '100%',
          paddingLeft: '28vw' 
        }}
      >
        <Button variant="contained" color="primary" onClick={handlePlayStop}>
          {isRecording ? 'Stop' : 'Play'}
        </Button>
      </Box>
    </Box>
  );
};

export default Dashcam;
