import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with common configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch latest sentiment data
 * @param {number} days - Number of days to fetch
 * @returns {Promise<Array>} - Array of daily sentiment data
 */
export const fetchLatestSentiment = async (days = 7) => {
  try {
    const response = await apiClient.get(`/sentiment/latest?days=${days}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching latest sentiment:', error);
    throw error;
  }
};

/**
 * Fetch all sentiment sources
 * @returns {Promise<Array>} - Array of sentiment sources
 */
export const fetchSentimentSources = async () => {
  try {
    const response = await apiClient.get('/sentiment/sources');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching sentiment sources:', error);
    throw error;
  }
};

/**
 * Fetch sentiment data for a specific source
 * @param {number} sourceId - Source ID
 * @param {number} days - Number of days to fetch
 * @returns {Promise<Array>} - Array of sentiment records
 */
export const fetchSentimentBySource = async (sourceId, days = 7) => {
  try {
    const response = await apiClient.get(`/sentiment/by-source/${sourceId}?days=${days}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching sentiment for source ${sourceId}:`, error);
    throw error;
  }
};

/**
 * Fetch all sentiment topics
 * @returns {Promise<Array>} - Array of sentiment topics
 */
export const fetchSentimentTopics = async () => {
  try {
    const response = await apiClient.get('/sentiment/topics');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching sentiment topics:', error);
    throw error;
  }
};

/**
 * Fetch sentiment data for a specific topic
 * @param {number} topicId - Topic ID
 * @param {number} days - Number of days to fetch
 * @returns {Promise<Array>} - Array of sentiment records
 */
export const fetchSentimentByTopic = async (topicId, days = 7) => {
  try {
    const response = await apiClient.get(`/sentiment/by-topic/${topicId}?days=${days}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching sentiment for topic ${topicId}:`, error);
    throw error;
  }
};

/**
 * Trigger data collection from Twitter
 * @returns {Promise<Object>} - Collection result
 */
export const triggerTwitterCollection = async () => {
  try {
    const response = await apiClient.post('/admin/collect/twitter');
    return response.data;
  } catch (error) {
    console.error('Error triggering Twitter collection:', error);
    throw error;
  }
};

/**
 * Trigger data collection from Reddit
 * @returns {Promise<Object>} - Collection result
 */
export const triggerRedditCollection = async () => {
  try {
    const response = await apiClient.post('/admin/collect/reddit');
    return response.data;
  } catch (error) {
    console.error('Error triggering Reddit collection:', error);
    throw error;
  }
};

/**
 * Trigger data collection from News API
 * @returns {Promise<Object>} - Collection result
 */
export const triggerNewsCollection = async () => {
  try {
    const response = await apiClient.post('/admin/collect/news');
    return response.data;
  } catch (error) {
    console.error('Error triggering News collection:', error);
    throw error;
  }
};

/**
 * Analyze custom text for sentiment
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} - Analysis result
 */
export const analyzeCustomText = async (text) => {
  try {
    const response = await apiClient.post('/admin/analyze', { text });
    return response.data.data;
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
};
