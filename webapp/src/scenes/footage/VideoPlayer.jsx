import React, { useEffect, useState } from 'react';

const VideoPlayer = ({ url }) => {
  const [videoSrc, setVideoSrc] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL("https://storage.googleapis.com/hackthe6ix/camera_output_drowsy.mp4");
        setVideoSrc(videoUrl);
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    };

    fetchVideo();

    // Clean up the object URL when the component unmounts
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [url, videoSrc]);

  return (
    <div>
      {videoSrc ? (
        <video controls>
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>Loading video...</p>
      )}
    </div>
  );
};

export default VideoPlayer;