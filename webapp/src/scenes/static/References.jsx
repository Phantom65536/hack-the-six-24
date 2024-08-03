import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const references = [
  {
    title: 'MUI Youtube Tutorial',
    description:
      'https://www.youtube.com/watch?v=coRTRjCQ15U - Heavily inspired the UIUX of this application.',
  },
  {
    title: 'React Native Gyroscope Data Collection',
    description:
      'https://www.youtube.com/watch?v=xAHChyquEG8 - Used to gather data from Gyroscope in mobile device.',
  },
  {
    title: 'Luca Nagy Lottiefiles Animated Car',
    description:
      'https://lottiefiles.com/free-animation/car-isometric-3d-animation-navigation-car-red-car-in-nature-car-on-the-road-UmX9w6OIN4 - Used for the animated welcome page.',
  },
  {
    title: 'ChatGPT',
    description:
      'https://chatgpt.com - for general help and inquiries about code.',
  },
  
];

const References = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        padding: '20px',
        backgroundColor: theme.palette.background.default,
        height: '100vh',
      }}
    >
      <Typography variant="h4" gutterBottom>
        References
      </Typography>
      <Paper sx={{ padding: '20px' }}>
        <List>
          {references.map((reference, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Typography variant="h6">{reference.title}</Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="textSecondary">
                      {reference.description}
                    </Typography>
                  }
                />
              </ListItem>
              {index < references.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default References;
