import React, { useState, useEffect } from 'react';
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
import { tokens } from '../../theme';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Footage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState([]);

  const fetchAllVideos = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:6000/api/get_all_videos');
      setVideos(res.data);
    } catch (error) {
      console.error('Error fetching all videos:', error);
    }
  };

  useEffect(() => {
    fetchAllVideos();
  }, []);

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      fetchAllVideos();
      return;
    }

    try {
      const res = await axios.post('http://127.0.0.1:6000/api/query', {
        query: searchQuery,
      });
      setVideos(res.data);
    } catch (error) {
      console.error('Error fetching query:', error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
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
          placeholder="Search (leave empty to retrieve all videos)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <IconButton type="button" sx={{ p: 1 }} onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* SEARCH RESULTS */}
      <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
        {videos.map((video) => (
          <Link
            to={`/watch/${video.id}`}
            key={video.id}
            style={{ textDecoration: 'none' }}
          >
            <Card sx={{ maxWidth: 345, margin: '1em' }}>
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
          </Link>
        ))}
      </Box>
    </Box>
  );
};

export default Footage;
