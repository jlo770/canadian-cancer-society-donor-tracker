import React from 'react';
import { Box, Typography } from '@mui/material';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const SentimentGauge = ({ value }) => {
  // Normalize value to be between 0 and 1 (from -1 to 1)
  const normalizedValue = (value + 1) / 2;
  
  // Calculate colors and segments
  const data = {
    labels: ['Negative', 'Neutral', 'Positive', 'Current'],
    datasets: [
      {
        data: [0.33, 0.34, 0.33, 0], // Base segments (negative, neutral, positive)
        backgroundColor: ['#f44336', '#ff9800', '#4caf50', 'rgba(0,0,0,0)'],
        borderWidth: 0,
      },
      {
        data: [normalizedValue, 1 - normalizedValue], // Needle position
        backgroundColor: ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)'],
        borderWidth: 0,
        circumference: 15, // Make it a thin slice
        rotation: (normalizedValue * 360) - 90 - 7.5, // Position the needle
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    rotation: -90,
    circumference: 180,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  };

  // Get sentiment label and color
  const getSentimentLabel = () => {
    if (value > 0.05) return 'Positive';
    if (value < -0.05) return 'Negative';
    return 'Neutral';
  };

  const getSentimentColor = () => {
    if (value > 0.05) return '#4caf50';
    if (value < -0.05) return '#f44336';
    return '#ff9800';
  };

  return (
    <Box sx={{ position: 'relative', height: 200 }}>
      <Doughnut data={data} options={options} />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="h4" 
          component="div"
          sx={{ 
            color: getSentimentColor(),
            fontWeight: 'bold',
          }}
        >
          {getSentimentLabel()}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Score: {value.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
};

export default SentimentGauge;
