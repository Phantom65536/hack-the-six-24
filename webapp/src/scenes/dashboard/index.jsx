// src/Dashcam.js
import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Adjust the URL as necessary

const Dashcam = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const theme = useTheme();
    const videoRef = useRef(null);

    const handlePlayStop = () => {
        setIsPlaying(!isPlaying);
        if (videoRef.current) {
            if (!isPlaying) {
                startReceivingVideo();
            } else {
                stopReceivingVideo();
            }
        }
    };

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
        return () => {
            stopReceivingVideo(); // Stop receiving video on component unmount
        };
    }, []);

    return (
        <Box sx={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', flex: 1 }}>
                <Box sx={{ flex: 2, backgroundColor: 'black', position: 'relative', overflow: 'hidden' }}>
                    <img ref={videoRef} alt="Live Video Stream" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Box sx={{ flex: 1, backgroundColor: '#f0f0f0', padding: '10px', height: '100%' }}>
                    {/* Notification area */}
                    <Typography variant="body2">Notifications will appear here</Typography>
                </Box>
            </Box>
            <Box
                sx={{
                    backgroundColor: theme.palette.mode === 'dark' ? '#1f1f1f' : '#f0f0f0',
                    padding: '20px',
                    display: 'flex',
                    width: '100%',
                    paddingLeft: '28vw'
                }}
            >
                <Button variant="contained" color="primary" onClick={handlePlayStop}>
                    {isPlaying ? 'Stop' : 'Play'}
                </Button>
            </Box>
        </Box>
    );
};

export default Dashcam;
