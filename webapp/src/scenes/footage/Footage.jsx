import React, { useState, useContext } from 'react';
import {
  Box,
  IconButton,
  useTheme,
  InputBase,
  Typography,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { ColorModeContext, tokens } from '../../theme';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const Footage = () => {
  const mockData = [
    {
      id: 1,
      title: 'Video 1',
      description: 'Description of video 1',
      thumbnail: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      title: 'Video 2',
      description: 'Description of video 2',
      thumbnail: 'https://via.placeholder.com/150',
    },
    {
      id: 3,
      title: 'Video 3',
      description: 'Description of video 3',
      thumbnail: 'https://via.placeholder.com/150',
    },
  ];

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState([]);

  // const handleSearch = async () => {
  //     try {
  //         const response = await axios.get(`http://localhost:4000/api/search?query=${searchQuery}`);
  //         setVideos(response.data);
  //     } catch (error) {
  //         console.error('Error fetching videos:', error);
  //     }
  // };

  const handleSearch = async () => {
    // Simulate API call
    // const response = await axios.get(`http://localhost:4000/api/search?query=${searchQuery}`);
    // setVideos(response.data);

    // Use mock data for testing
    const filteredVideos = mockData.filter((video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setVideos(filteredVideos);
  };

  return (
    <Box p={2}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
        height="8vh"
      >
        <InputBase
          sx={{ ml: 2, flex: 1 }}
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <IconButton type="button" sx={{ p: 1 }} onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* SEARCH RESULTS */}
      <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
        {videos.map((video) => (
          <Card key={video.id} sx={{ maxWidth: 345 }}>
            <CardMedia
              component="img"
              alt={video.title}
              height="140"
              image={video.thumbnail}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {video.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {video.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Footage;
