import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const VideoPlayer = ({ videoUrl, notifications }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#000' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="white" gutterBottom>
          Live Video Stream
        </Typography>
        <Box
          component="video"
          sx={{ width: '80%', backgroundColor: 'black' }}
          controls
          src={videoUrl}
        >
          Your browser does not support the video tag.
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrowIcon />}
          sx={{ mt: 2 }}
        >
          Play
        </Button>
      </Box>
      <Box sx={{ width: '300px', backgroundColor: '#f0f0f0', padding: '16px' }}>
        <Typography variant="h6" color="textSecondary">
          Notifications
        </Typography>
        <Box sx={{ mt: 2 }}>
          {notifications && notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <Typography key={index} variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                {notification}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              Notifications will appear here
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPlayer;
