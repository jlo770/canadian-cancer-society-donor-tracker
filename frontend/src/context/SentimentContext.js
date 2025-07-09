import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchLatestSentiment, fetchSentimentSources, fetchSentimentTopics } from '../api/sentimentApi';

// Create context
const SentimentContext = createContext();

// Custom hook for using the context
export const useSentiment = () => useContext(SentimentContext);

export const SentimentProvider = ({ children }) => {
  // State
  const [latestSentiment, setLatestSentiment] = useState([]);
  const [sentimentSources, setSentimentSources] = useState([]);
  const [sentimentTopics, setSentimentTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(7); // Default to 7 days

  // Fetch data on mount and when timeRange changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sentimentData, sourcesData, topicsData] = await Promise.all([
          fetchLatestSentiment(timeRange),
          fetchSentimentSources(),
          fetchSentimentTopics()
        ]);
        
        setLatestSentiment(sentimentData);
        setSentimentSources(sourcesData);
        setSentimentTopics(topicsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching sentiment data:', err);
        setError('Failed to load sentiment data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Calculate overall sentiment score (average of daily scores)
  const overallSentiment = React.useMemo(() => {
    if (!latestSentiment || latestSentiment.length === 0) return 0;
    
    const sum = latestSentiment.reduce((acc, day) => acc + day.average_sentiment, 0);
    return sum / latestSentiment.length;
  }, [latestSentiment]);

  // Get sentiment label based on score
  const getSentimentLabel = (score) => {
    if (score > 0.05) return 'Positive';
    if (score < -0.05) return 'Negative';
    return 'Neutral';
  };

  // Get color based on sentiment score
  const getSentimentColor = (score) => {
    if (score > 0.05) return '#4caf50'; // Green for positive
    if (score < -0.05) return '#f44336'; // Red for negative
    return '#ff9800'; // Orange for neutral
  };

  // Format data for charts
  const chartData = React.useMemo(() => {
    if (!latestSentiment || latestSentiment.length === 0) return {
      labels: [],
      datasets: []
    };

    // Sort by date
    const sortedData = [...latestSentiment].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

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
  }, [latestSentiment]);

  // Value to provide in context
  const value = {
    latestSentiment,
    sentimentSources,
    sentimentTopics,
    loading,
    error,
    timeRange,
    setTimeRange,
    overallSentiment,
    getSentimentLabel,
    getSentimentColor,
    chartData
  };

  return (
    <SentimentContext.Provider value={value}>
      {children}
    </SentimentContext.Provider>
  );
};

export default SentimentContext;
