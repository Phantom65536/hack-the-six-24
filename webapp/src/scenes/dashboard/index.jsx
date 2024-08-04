import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material';
// import io from 'socket.io-client';

// const socket = io('http://localhost:3000'); // Adjust the URL as necessary

const Dashcam = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // State to track WebSocket connection status
  const theme = useTheme();
  const videoRef = useRef(null);

  const startReceivingVideo = () => {
    // socket.on('connect', () => {
    //   setIsConnected(true);
    // });

    // socket.on('disconnect', () => {
    //   setIsConnected(false);
    // });

    // socket.on('video-frame', (data) => {
      if (videoRef.current) {
        videoRef.current.src = "http://localhost:9000/video_feed";
      // }
    };
  };

  const stopReceivingVideo = () => {
    // socket.off('video-frame');
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
        console.log('Start');
        const response = await fetch('http://127.0.0.1:9000/start_recording', {
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
        const response = await fetch('http://127.0.0.1:9000/end_recording', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to stop recording');
        }
        else {
            console.log('Recording stopped and uploaded to GCS');
            const upload_data = await response.json();
            console.log(upload_data)

            const response_upload = await fetch('http://127.0.0.1:3001/api/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
                body: JSON.stringify(upload_data)
            });
            console.log('Recording uploaded to mongoDB');
            const mongobd_data = await response_upload.json();
            console.log(mongobd_data)
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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {!isConnected && <CircularProgress size={80} color="primary" />}
          <img
            ref={videoRef}
            alt="Live Video Stream"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: isConnected ? 'block' : 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 20, // Adjust as needed
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
            }}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: isRecording ? 'red' : 'primary.light',
                '&:hover': {
                  backgroundColor: isRecording ? 'red' : 'primary.dark', // Keep red color when hovering
                },
              }}
              onClick={handlePlayStop}
            >
              {isRecording ? 'Recording' : 'Not Recording'}
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            backgroundColor:
              theme.palette.mode === 'dark'
                ? theme.palette.primary[500]
                : '#FFFFFF',
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
    </Box>
  );
};

export default Dashcam;
