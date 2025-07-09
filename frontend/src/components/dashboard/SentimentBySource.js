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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { Twitter, Reddit, Newspaper } from '@mui/icons-material';
import { useSentiment } from '../../context/SentimentContext';
import { fetchSentimentBySource } from '../../api/sentimentApi';
import SentimentChart from '../charts/SentimentChart';
import { format } from 'date-fns';

const SentimentBySource = () => {
  const { sentimentSources, timeRange, loading: contextLoading } = useSentiment();
  const [selectedSource, setSelectedSource] = useState(null);
  const [sourceData, setSourceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data when source changes
  useEffect(() => {
    if (!selectedSource) {
      if (sentimentSources && sentimentSources.length > 0) {
        setSelectedSource(sentimentSources[0].id);
      }
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchSentimentBySource(selectedSource, timeRange);
        setSourceData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching source data:', err);
        setError('Failed to load source data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSource, timeRange, sentimentSources]);

  // Format chart data
  const chartData = React.useMemo(() => {
    if (!sourceData || sourceData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Group by date
    const groupedByDate = sourceData.reduce((acc, record) => {
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
  }, [sourceData]);

  // Get source icon
  const getSourceIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'twitter':
        return <Twitter />;
      case 'reddit':
        return <Reddit />;
      case 'news':
        return <Newspaper />;
      default:
        return null;
    }
  };

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
          Sentiment by Source
        </Typography>
        
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="source-select-label">Source</InputLabel>
          <Select
            labelId="source-select-label"
            id="source-select"
            value={selectedSource || ''}
            label="Source"
            onChange={(e) => setSelectedSource(e.target.value)}
          >
            {sentimentSources.map((source) => (
              <MenuItem key={source.id} value={source.id}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getSourceIcon(source.type)}
                  <Typography sx={{ ml: 1 }}>{source.name}</Typography>
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
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="Sentiment Trend" 
                subheader={selectedSource && sentimentSources.find(s => s.id === selectedSource)?.name}
              />
              <CardContent>
                <SentimentChart data={chartData} />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Recent Mentions" />
              <CardContent>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader aria-label="recent mentions table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Content</TableCell>
                        <TableCell>Sentiment</TableCell>
                        <TableCell>Topics</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sourceData.slice(0, 10).map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            {format(new Date(record.analyzed_date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                              {record.content_text}
                            </Typography>
                            {record.content_url && (
                              <Typography variant="caption">
                                <a href={record.content_url} target="_blank" rel="noopener noreferrer">
                                  Source Link
                                </a>
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getSentimentLabel(record.sentiment_score)}
                              sx={{ 
                                backgroundColor: getSentimentColor(record.sentiment_score),
                                color: 'white'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {record.topics && record.topics.slice(0, 3).map((topic, index) => (
                                <Chip key={index} label={topic} size="small" />
                              ))}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SentimentBySource;
