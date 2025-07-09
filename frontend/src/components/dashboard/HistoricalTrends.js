import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress
} from '@mui/material';
import { useSentiment } from '../../context/SentimentContext';
import SentimentChart from '../charts/SentimentChart';
import { format, subDays, subMonths } from 'date-fns';

const HistoricalTrends = () => {
  const { latestSentiment, loading, error, setTimeRange } = useSentiment();
  const [timeFrame, setTimeFrame] = useState('30');
  const [chartType, setChartType] = useState('daily');

  // Handle time frame change
  const handleTimeFrameChange = (event) => {
    const newTimeFrame = event.target.value;
    setTimeFrame(newTimeFrame);
    setTimeRange(parseInt(newTimeFrame, 10));
  };

  // Handle chart type change
  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  // Format chart data based on chart type
  const chartData = React.useMemo(() => {
    if (!latestSentiment || latestSentiment.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Sort data by date
    const sortedData = [...latestSentiment].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    if (chartType === 'daily') {
      // Daily data (default)
      return {
        labels: sortedData.map(day => day.date),
        datasets: [
          {
            label: 'Sentiment Score',
            data: sortedData.map(day => day.average_sentiment),
            borderColor: '#d71920', // Canadian Tire red
            backgroundColor: 'rgba(215, 25, 32, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      };
    } else if (chartType === 'weekly') {
      // Group by week
      const weeklyData = {};
      sortedData.forEach(day => {
        const date = new Date(day.date);
        // Get the week start date (Sunday)
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = format(weekStart, 'yyyy-MM-dd');
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            sum: 0,
            count: 0
          };
        }
        
        weeklyData[weekKey].sum += day.average_sentiment;
        weeklyData[weekKey].count++;
      });
      
      const weeks = Object.keys(weeklyData).sort();
      const averages = weeks.map(week => weeklyData[week].sum / weeklyData[week].count);
      
      return {
        labels: weeks.map(week => `Week of ${format(new Date(week), 'MMM d')}`),
        datasets: [
          {
            label: 'Weekly Average Sentiment',
            data: averages,
            borderColor: '#0d5c91', // Blue
            backgroundColor: 'rgba(13, 92, 145, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      };
    } else {
      // Group by month
      const monthlyData = {};
      sortedData.forEach(day => {
        const date = new Date(day.date);
        const monthKey = format(date, 'yyyy-MM');
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            sum: 0,
            count: 0
          };
        }
        
        monthlyData[monthKey].sum += day.average_sentiment;
        monthlyData[monthKey].count++;
      });
      
      const months = Object.keys(monthlyData).sort();
      const averages = months.map(month => monthlyData[month].sum / monthlyData[month].count);
      
      return {
        labels: months.map(month => format(new Date(`${month}-01`), 'MMMM yyyy')),
        datasets: [
          {
            label: 'Monthly Average Sentiment',
            data: averages,
            borderColor: '#4caf50', // Green
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      };
    }
  }, [latestSentiment, chartType]);

  // Calculate trend metrics
  const trendMetrics = React.useMemo(() => {
    if (!latestSentiment || latestSentiment.length < 2) {
      return {
        overall: 0,
        start: 0,
        end: 0,
        change: 0,
        percentChange: 0
      };
    }
    
    const sortedData = [...latestSentiment].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    const firstDay = sortedData[0];
    const lastDay = sortedData[sortedData.length - 1];
    const overall = sortedData.reduce((sum, day) => sum + day.average_sentiment, 0) / sortedData.length;
    const change = lastDay.average_sentiment - firstDay.average_sentiment;
    const percentChange = firstDay.average_sentiment !== 0 
      ? (change / Math.abs(firstDay.average_sentiment)) * 100 
      : 0;
    
    return {
      overall,
      start: firstDay.average_sentiment,
      end: lastDay.average_sentiment,
      change,
      percentChange
    };
  }, [latestSentiment]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Historical Sentiment Trends
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="time-frame-label">Time Frame</InputLabel>
            <Select
              labelId="time-frame-label"
              id="time-frame-select"
              value={timeFrame}
              label="Time Frame"
              onChange={handleTimeFrameChange}
            >
              <MenuItem value={7}>7 days</MenuItem>
              <MenuItem value={30}>30 days</MenuItem>
              <MenuItem value={90}>90 days</MenuItem>
              <MenuItem value={180}>180 days</MenuItem>
              <MenuItem value={365}>1 year</MenuItem>
            </Select>
          </FormControl>
          
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            aria-label="chart type"
            size="small"
          >
            <ToggleButton value="daily" aria-label="daily">
              Daily
            </ToggleButton>
            <ToggleButton value="weekly" aria-label="weekly">
              Weekly
            </ToggleButton>
            <ToggleButton value="monthly" aria-label="monthly">
              Monthly
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Card>
            <CardHeader 
              title={`${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Sentiment Trend`}
              subheader={`Last ${timeFrame} days`}
            />
            <CardContent sx={{ height: 400 }}>
              <SentimentChart data={chartData} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title="Trend Analysis" />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Overall Average
                  </Typography>
                  <Typography variant="h5">
                    {trendMetrics.overall.toFixed(2)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Starting Sentiment
                  </Typography>
                  <Typography variant="h6">
                    {trendMetrics.start.toFixed(2)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Current Sentiment
                  </Typography>
                  <Typography variant="h6">
                    {trendMetrics.end.toFixed(2)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Change
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: trendMetrics.change > 0 
                        ? '#4caf50' 
                        : trendMetrics.change < 0 
                          ? '#f44336' 
                          : 'inherit'
                    }}
                  >
                    {trendMetrics.change > 0 ? '+' : ''}{trendMetrics.change.toFixed(2)}
                    {' '}
                    ({trendMetrics.change > 0 ? '+' : ''}{trendMetrics.percentChange.toFixed(1)}%)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardHeader title="Interpretation" />
            <CardContent>
              <Typography variant="body2">
                {trendMetrics.change > 0.1 
                  ? 'Canadian Tire sentiment is showing a significant positive trend. This could indicate successful marketing campaigns, positive customer experiences, or favorable news coverage.'
                  : trendMetrics.change < -0.1
                    ? 'Canadian Tire sentiment is showing a concerning negative trend. This could be due to customer service issues, negative press, or market challenges that should be addressed.'
                    : 'Canadian Tire sentiment is relatively stable. While there are minor fluctuations, overall public perception remains consistent.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HistoricalTrends;
