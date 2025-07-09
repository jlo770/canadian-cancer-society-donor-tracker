import React from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SentimentChart = ({ data }) => {
  // Format dates for display
  const formattedData = React.useMemo(() => {
    if (!data || !data.labels || data.labels.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    return {
      labels: data.labels.map(date => format(new Date(date), 'MMM dd')),
      datasets: data.datasets.map(dataset => ({
        ...dataset,
        pointBackgroundColor: dataset.data.map(value => {
          if (value > 0.05) return '#4caf50'; // Green for positive
          if (value < -0.05) return '#f44336'; // Red for negative
          return '#ff9800'; // Orange for neutral
        }),
        pointRadius: 5,
        pointHoverRadius: 7
      }))
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              const value = context.parsed.y;
              let sentiment;
              if (value > 0.05) sentiment = 'Positive';
              else if (value < -0.05) sentiment = 'Negative';
              else sentiment = 'Neutral';
              
              label += `${value.toFixed(2)} (${sentiment})`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        min: -1,
        max: 1,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            if (value === 1) return 'Very Positive';
            if (value === 0.5) return 'Positive';
            if (value === 0) return 'Neutral';
            if (value === -0.5) return 'Negative';
            if (value === -1) return 'Very Negative';
            return '';
          }
        }
      }
    }
  };

  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 300 }}>
      <Line data={formattedData} options={options} />
    </Box>
  );
};

export default SentimentChart;
