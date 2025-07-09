import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Paper
} from '@mui/material';
import { Tag } from '@mui/icons-material';
import { useSentiment } from '../../context/SentimentContext';
import { fetchSentimentByTopic } from '../../api/sentimentApi';
import SentimentChart from '../charts/SentimentChart';
import { format } from 'date-fns';

const SentimentByTopic = () => {
  const { sentimentTopics, timeRange, loading: contextLoading } = useSentiment();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicData, setTopicData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data when topic changes
  useEffect(() => {
    if (!selectedTopic) {
      if (sentimentTopics && sentimentTopics.length > 0) {
        setSelectedTopic(sentimentTopics[0].id);
      }
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchSentimentByTopic(selectedTopic, timeRange);
        setTopicData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching topic data:', err);
        setError('Failed to load topic data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTopic, timeRange, sentimentTopics]);

  // Format chart data
  const chartData = React.useMemo(() => {
    if (!topicData || topicData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Group by date
    const groupedByDate = topicData.reduce((acc, record) => {
      const date = record.analyzed_date.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {});

    // Calculate average sentiment for each date
    const dates = Object.keys(groupedByDate).sort();
    const sentiments = dates.map(date => {
      const records = groupedByDate[date];
      const sum = records.reduce((acc, record) => acc + record.sentiment_score, 0);
      return sum / records.length;
    });

    return {
      labels: dates,
      datasets: [
        {
          label: 'Sentiment Score',
          data: sentiments,
          borderColor: '#d71920', // Canadian Tire red
          backgroundColor: 'rgba(215, 25, 32, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [topicData]);

  // Calculate sentiment distribution
  const sentimentDistribution = React.useMemo(() => {
    if (!topicData || topicData.length === 0) {
      return { positive: 0, neutral: 0, negative: 0 };
    }

    return topicData.reduce((acc, record) => {
      if (record.sentiment_score > 0.05) acc.positive++;
      else if (record.sentiment_score < -0.05) acc.negative++;
      else acc.neutral++;
      return acc;
    }, { positive: 0, neutral: 0, negative: 0 });
  }, [topicData]);

  // Get sentiment color
  const getSentimentColor = (score) => {
    if (score > 0.05) return '#4caf50'; // Green for positive
    if (score < -0.05) return '#f44336'; // Red for negative
    return '#ff9800'; // Orange for neutral
  };

  // Get sentiment label
  const getSentimentLabel = (score) => {
    if (score > 0.05) return 'Positive';
    if (score < -0.05) return 'Negative';
    return 'Neutral';
  };

  if (contextLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sentiment by Topic
        </Typography>
        
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="topic-select-label">Topic</InputLabel>
          <Select
            labelId="topic-select-label"
            id="topic-select"
            value={selectedTopic || ''}
            label="Topic"
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            {sentimentTopics.map((topic) => (
              <MenuItem key={topic.id} value={topic.id}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Tag fontSize="small" />
                  <Typography sx={{ ml: 1 }}>{topic.name}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader 
                title="Sentiment Trend" 
                subheader={selectedTopic && sentimentTopics.find(t => t.id === selectedTopic)?.name}
              />
              <CardContent>
                <SentimentChart data={chartData} />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Sentiment Distribution" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Positive</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ color: '#4caf50', mr: 1 }}>
                        {sentimentDistribution.positive}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({Math.round((sentimentDistribution.positive / topicData.length) * 100)}%)
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Neutral</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ color: '#ff9800', mr: 1 }}>
                        {sentimentDistribution.neutral}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({Math.round((sentimentDistribution.neutral / topicData.length) * 100)}%)
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Negative</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ color: '#f44336', mr: 1 }}>
                        {sentimentDistribution.negative}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({Math.round((sentimentDistribution.negative / topicData.length) * 100)}%)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Recent Mentions" />
              <CardContent>
                <List sx={{ bgcolor: 'background.paper', maxHeight: 400, overflow: 'auto' }}>
                  {topicData.slice(0, 10).map((record, index) => (
                    <React.Fragment key={record.id}>
                      {index > 0 && <Divider />}
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1">
                                {format(new Date(record.analyzed_date), 'MMM dd, yyyy')}
                              </Typography>
                              <Chip 
                                label={getSentimentLabel(record.sentiment_score)}
                                size="small"
                                sx={{ 
                                  backgroundColor: getSentimentColor(record.sentiment_score),
                                  color: 'white'
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {record.content_text}
                              </Typography>
                              {record.content_url && (
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                  <a href={record.content_url} target="_blank" rel="noopener noreferrer">
                                    Source Link
                                  </a>
                                </Typography>
                              )}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SentimentByTopic;
