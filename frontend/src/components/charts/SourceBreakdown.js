import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const SourceBreakdown = ({ data }) => {
  // Format data for Chart.js
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    return {
      labels: data.map(item => item.name),
      datasets: [
        {
          data: data.map(item => item.value),
          backgroundColor: [
            '#1DA1F2',  // Twitter blue
            '#FF4500',  // Reddit orange
            '#2196F3',  // News blue
          ],
          borderColor: [
            '#ffffff',
            '#ffffff',
            '#ffffff',
          ],
          borderWidth: 2,
        }
      ]
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 15,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    }
  };

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 200 }}>
      <Pie data={chartData} options={options} />
    </Box>
  );
};

export default SourceBreakdown;
