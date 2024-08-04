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
  Button,
} from '@mui/material';
import { colorTokens } from '../../theme';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Markdown from 'react-markdown';

const Footage = () => {
  // const FLASK_URL = 'http://100.66.18.218:3001/api';
  const FLASK_URL = 'http://100.66.21.135:3001/api'
  console.log(FLASK_URL);
  
  const theme = useTheme();
  const colors = colorTokens(theme.palette.mode);

  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState([]);

  const fetchAllVideos = async () => {
    try {
      const res = await axios.get(`${FLASK_URL}/getall`);
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
      const res = await axios.post(`${FLASK_URL}/query`, {
        query: searchQuery,
      });
      console.log(res.data);
      setVideos([res.data]); // Assuming res.data is a single video object
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
        height="4em"
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
        {videos.map((video, i) => (
          <Card key={video._id} sx={{ maxWidth: 345, margin: '1em' }}>
            <CardMedia
              component="img"
              alt={video.title}
              height="140"
              image={require(`../../../public/temp${i%3 + 1}.png`)} // Placeholder image, you can replace this with actual video thumbnail if available
            />
            <CardContent>
              <Markdown>{video.title}</Markdown>
              <Markdown>{video.query}</Markdown>
              <Markdown>{video.response}</Markdown>
              <Markdown>{video.summary}</Markdown>
              {/* <Typography gutterBottom variant="h5" component="div">
                {video.title}
              </Typography>
              <Typography variant="body2" color="text.primary">
                {video.query}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {video.response}
              </Typography>
              <Typography variant="body2" color="text.info">
                {video.summary}
              </Typography> */}
              <Link to={`/watch/${video.video_file_name}`} style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  sx={{ mt: 2 }}
                >
                  Play Video
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Footage;
