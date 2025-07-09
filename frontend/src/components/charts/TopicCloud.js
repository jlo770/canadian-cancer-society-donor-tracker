import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useSentiment } from '../../context/SentimentContext';

const TopicCloud = () => {
  const { latestSentiment, loading } = useSentiment();
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    if (!latestSentiment || latestSentiment.length === 0) return;

    // Extract topics from daily summaries
    const allTopics = [];
    latestSentiment.forEach(day => {
      if (day.top_topics) {
        try {
          const dayTopics = JSON.parse(day.top_topics);
          Object.entries(dayTopics).forEach(([topic, count]) => {
            const existingTopic = allTopics.find(t => t.text === topic);
            if (existingTopic) {
              existingTopic.value += count;
            } else {
              allTopics.push({ text: topic, value: count });
            }
          });
        } catch (e) {
          console.error('Error parsing topics:', e);
        }
      }
    });

    // Sort by value and take top 20
    const sortedTopics = allTopics
      .sort((a, b) => b.value - a.value)
      .slice(0, 20)
      .map(topic => ({
        ...topic,
        // Normalize size between 14-40px
        size: 14 + Math.min(26, Math.floor(topic.value / 2))
      }));

    setTopics(sortedTopics);
  }, [latestSentiment]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (topics.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Typography variant="body1" color="text.secondary">
          No topics available
        </Typography>
      </Box>
    );
  }

  // Generate random positions for the topics
  const getRandomPosition = () => {
    return {
      left: `${Math.floor(Math.random() * 70) + 5}%`,
      top: `${Math.floor(Math.random() * 70) + 5}%`,
    };
  };

  // Assign colors based on value
  const getColor = (value) => {
    const maxValue = topics[0].value;
    const intensity = Math.min(0.9, (value / maxValue) * 0.7 + 0.2);
    return `rgba(215, 25, 32, ${intensity})`;
  };

  return (
    <Box sx={{ position: 'relative', height: 300, width: '100%' }}>
      {topics.map((topic, index) => {
        const position = getRandomPosition();
        return (
          <Typography
            key={index}
            variant="body1"
            component="div"
            sx={{
              position: 'absolute',
              left: position.left,
              top: position.top,
              fontSize: `${topic.size}px`,
              fontWeight: topic.size > 25 ? 'bold' : 'normal',
              color: getColor(topic.value),
              transform: `rotate(${Math.floor(Math.random() * 30) - 15}deg)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.2)',
                zIndex: 10
              }
            }}
          >
            {topic.text}
          </Typography>
        );
      })}
    </Box>
  );
};

export default TopicCloud;
