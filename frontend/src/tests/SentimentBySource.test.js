import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SentimentBySource from '../components/dashboard/SentimentBySource';
import { SentimentProvider } from '../context/SentimentContext';

// Mock the API service
jest.mock('../api/sentimentApi', () => ({
  fetchSentimentSources: jest.fn(() => Promise.resolve([
    { id: 1, name: 'Twitter', type: 'twitter' },
    { id: 2, name: 'Reddit', type: 'reddit' },
    { id: 3, name: 'News API', type: 'news' }
  ])),
  fetchSentimentBySource: jest.fn((sourceId) => {
    // Return different mock data based on the source ID
    if (sourceId === 1) {
      return Promise.resolve([
        {
          id: 101,
          source_id: 1,
          content_text: "Great experience at Canadian Tire today! #CanadianTire",
          content_url: "https://twitter.com/user/status/123456",
          sentiment_score: 0.8,
          analyzed_date: "2025-07-08T10:30:00Z",
          topics: ["customer service", "store experience"]
        },
        {
          id: 102,
          source_id: 1,
          content_text: "Canadian Tire has the best deals on automotive parts",
          content_url: "https://twitter.com/user/status/123457",
          sentiment_score: 0.6,
          analyzed_date: "2025-07-07T15:45:00Z",
          topics: ["pricing", "automotive"]
        }
      ]);
    } else if (sourceId === 2) {
      return Promise.resolve([
        {
          id: 201,
          source_id: 2,
          content_text: "Canadian Tire's new app is terrible. So many bugs!",
          content_url: "https://reddit.com/r/canada/comments/123",
          sentiment_score: -0.7,
          analyzed_date: "2025-07-08T09:15:00Z",
          topics: ["app", "technology"]
        }
      ]);
    } else {
      return Promise.resolve([
        {
          id: 301,
          source_id: 3,
          content_text: "Canadian Tire reports strong quarterly earnings",
          content_url: "https://news.com/business/123",
          sentiment_score: 0.5,
          analyzed_date: "2025-07-08T08:00:00Z",
          topics: ["financial", "earnings"]
        }
      ]);
    }
  })
}));

// Mock chart.js
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>
}));

// Mock date-fns format to avoid timezone issues in tests
jest.mock('date-fns', () => ({
  format: jest.fn(() => 'Jul 08, 2025')
}));

describe('SentimentBySource Component', () => {
  beforeEach(() => {
    // Wrap the component in the SentimentProvider for testing
    render(
      <SentimentProvider>
        <SentimentBySource />
      </SentimentProvider>
    );
  });

  test('renders component title', async () => {
    await waitFor(() => {
      expect(screen.getByText('Sentiment by Source')).toBeInTheDocument();
    });
  });

  test('renders source selector', async () => {
    await waitFor(() => {
      expect(screen.getByLabelText('Source')).toBeInTheDocument();
    });
  });

  test('displays loading state initially', () => {
    // This will find the CircularProgress component or loading text
    const loadingElements = screen.queryAllByRole('progressbar');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  test('displays sentiment chart after loading', async () => {
    await waitFor(() => {
      const chart = screen.getByTestId('line-chart');
      expect(chart).toBeInTheDocument();
    });
  });

  test('displays recent mentions table', async () => {
    await waitFor(() => {
      expect(screen.getByText('Recent Mentions')).toBeInTheDocument();
      
      // Check for table headers
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Sentiment')).toBeInTheDocument();
      expect(screen.getByText('Topics')).toBeInTheDocument();
    });
  });

  test('displays sentiment data for Twitter source', async () => {
    await waitFor(() => {
      // Initially Twitter should be selected and its data shown
      expect(screen.getByText('Great experience at Canadian Tire today! #CanadianTire')).toBeInTheDocument();
      expect(screen.getByText('Positive')).toBeInTheDocument();
    });
  });

  // This test would need to be updated to properly simulate the select change
  // Currently just checking if the select element exists
  test('allows changing source', async () => {
    await waitFor(() => {
      const sourceSelect = screen.getByLabelText('Source');
      expect(sourceSelect).toBeInTheDocument();
    });
  });
});
