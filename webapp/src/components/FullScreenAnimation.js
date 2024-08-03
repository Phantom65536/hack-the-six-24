import React from 'react';
import Lottie from 'react-lottie';
import { TypeAnimation } from 'react-type-animation';
import animationData from '../assets/carAnimation.json'; // Make sure to replace this with the path to your Lottie animation JSON file
import { Box, Typography } from '@mui/material';

const FullScreenAnimation = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <Box 
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#121212',
        zIndex: -1,
      }}
    >
      <Typography 
        variant="h2" 
        sx={{
          position: 'absolute',
          top: '10%',
          color: '#FFFFFF',
          fontSize: '75px',
          zIndex: 1 // Ensure the text is above the animation
        }}
      >
        <TypeAnimation
          sequence={['Welcome', 100, 'Welcome']}
          wrapper="span"
          speed={0.05}
          style={{ display: 'inline-block' }}
          repeat={1}
        />
      </Typography>
      <Box 
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          paddingTop: '40px', // Adjust based on your button size and spacing
          paddingLeft: '40px', // Adjust based on your button size and spacing
        }}
      >
        <Lottie options={defaultOptions} height="100%" width="100%" />
      </Box>
    </Box>
  );
};

export default FullScreenAnimation;
