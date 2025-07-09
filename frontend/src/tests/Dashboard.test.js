import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../components/dashboard/Dashboard';
import { SentimentProvider } from '../context/SentimentContext';

// Mock the API service
jest.mock('../api/sentimentApi', () => ({
  fetchLatestSentiment: jest.fn(() => Promise.resolve([
    {
      date: '2025-07-07',
      average_sentiment: 0.6,
      positive_count: 15,
      neutral_count: 5,
      negative_count: 3,
      total_count: 23
    },
    {
      date: '2025-07-06',
      average_sentiment: 0.4,
      positive_count: 12,
      neutral_count: 8,
      negative_count: 5,
      total_count: 25
    }
  ])),
  fetchSentimentSources: jest.fn(() => Promise.resolve([
    { id: 1, name: 'Twitter', type: 'twitter' },
    { id: 2, name: 'Reddit', type: 'reddit' },
    { id: 3, name: 'News API', type: 'news' }
  ])),
  fetchSentimentTopics: jest.fn(() => Promise.resolve([
    { id: 1, name: 'customer service' },
    { id: 2, name: 'pricing' },
    { id: 3, name: 'products' }
  ]))
}));

// Mock chart.js
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Wrap the component in the SentimentProvider for testing
    render(
      <SentimentProvider>
        <Dashboard />
      </SentimentProvider>
    );
  });

  test('renders dashboard title', async () => {
    await waitFor(() => {
      expect(screen.getByText('Canadian Tire Sentiment Dashboard')).toBeInTheDocument();
    });
  });

  test('renders summary cards', async () => {
    await waitFor(() => {
      expect(screen.getByText('Overall Sentiment')).toBeInTheDocument();
      expect(screen.getByText('Sentiment by Source')).toBeInTheDocument();
      expect(screen.getByText('Top Topics')).toBeInTheDocument();
    });
  });

  test('displays loading state initially', () => {
    // This will find the CircularProgress component or loading text
    const loadingElements = screen.queryAllByRole('progressbar');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  test('displays sentiment data after loading', async () => {
    await waitFor(() => {
      // Check for sentiment score display
      const positiveCount = screen.getByText('15');
      const negativeCount = screen.getByText('3');
      
      expect(positiveCount).toBeInTheDocument();
      expect(negativeCount).toBeInTheDocument();
    });
  });

  test('renders chart components', async () => {
    await waitFor(() => {
      const charts = screen.getAllByTestId(/chart/);
      expect(charts.length).toBeGreaterThan(0);
    });
  });
});
