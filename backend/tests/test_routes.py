import unittest
import sys
import os
import json
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

# Add the parent directory to the path so we can import our modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from models import db, SentimentSource, SentimentRecord, Topic, DailySentimentSummary

class TestRoutes(unittest.TestCase):
    def setUp(self):
        """Set up test client and initialize test database"""
        self.app = create_app(testing=True)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # Configure the app to use an in-memory SQLite database
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        db.create_all()
        
        # Create test data
        self._create_test_data()
    
    def tearDown(self):
        """Clean up after tests"""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def _create_test_data(self):
        """Create test data in the database"""
        # Create sources
        twitter = SentimentSource(name='Twitter', type='twitter')
        reddit = SentimentSource(name='Reddit', type='reddit')
        news = SentimentSource(name='News API', type='news')
        
        db.session.add_all([twitter, reddit, news])
        db.session.commit()
        
        # Create topics - check for existing ones first
        topic_names = ['customer service', 'pricing', 'products', 'stores']
        topics = []
        
        for name in topic_names:
            # Check if topic already exists
            existing_topic = Topic.query.filter_by(name=name).first()
            if existing_topic:
                topics.append(existing_topic)
            else:
                new_topic = Topic(name=name)
                db.session.add(new_topic)
                topics.append(new_topic)
                
        db.session.commit()
        
        # Create sentiment records
        today = datetime.now().date()
        yesterday = today - timedelta(days=1)
        
        records = [
            # Twitter records
            SentimentRecord(
                source_id=twitter.id,
                content_text="Great experience at Canadian Tire today! Staff was very helpful.",
                content_url="https://twitter.com/user/status/123456",
                sentiment_score=0.8,
                analyzed_date=today
            ),
            SentimentRecord(
                source_id=twitter.id,
                content_text="Canadian Tire prices are too high compared to competitors.",
                content_url="https://twitter.com/user/status/123457",
                sentiment_score=-0.6,
                analyzed_date=yesterday
            ),
            
            # Reddit records
            SentimentRecord(
                source_id=reddit.id,
                content_text="Canadian Tire has the best selection of automotive parts.",
                content_url="https://reddit.com/r/canada/comments/123",
                sentiment_score=0.7,
                analyzed_date=today
            ),
            
            # News records
            SentimentRecord(
                source_id=news.id,
                content_text="Canadian Tire reports strong quarterly earnings.",
                content_url="https://news.com/business/123",
                sentiment_score=0.5,
                analyzed_date=today
            )
        ]
        
        # Add topics to records
        records[0].topics.append(topics[0])  # customer service
        records[1].topics.append(topics[1])  # pricing
        records[2].topics.append(topics[2])  # products
        records[3].topics.append(topics[3])  # stores
        
        db.session.add_all(records)
        db.session.commit()
        
        # Create daily summaries
        summaries = [
            DailySentimentSummary(
                date=today,
                average_sentiment=0.4,
                positive_count=2,
                neutral_count=0,
                negative_count=1,
                record_count=3
            ),
            DailySentimentSummary(
                date=yesterday,
                average_sentiment=-0.6,
                positive_count=0,
                neutral_count=0,
                negative_count=1,
                record_count=1
            )
        ]
        
        db.session.add_all(summaries)
        db.session.commit()
    
    def test_get_latest_sentiment(self):
        """Test getting latest sentiment data"""
        response = self.client.get('/api/sentiment/latest')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, dict)
        self.assertTrue(data['success'])
        self.assertIsInstance(data['data'], list)
        self.assertEqual(len(data['data']), 2)  # Two days of data
        
        # Check fields
        self.assertIn('date', data['data'][0])
        self.assertIn('average_sentiment', data['data'][0])
        self.assertIn('positive_count', data['data'][0])
        self.assertIn('negative_count', data['data'][0])
    
    def test_get_sentiment_by_source(self):
        """Test getting sentiment data by source"""
        # Get Twitter source id
        twitter = SentimentSource.query.filter_by(name='Twitter').first()
        
        response = self.client.get(f'/api/sentiment/by-source/{twitter.id}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, dict)
        self.assertTrue(data['success'])
        self.assertIsInstance(data['data'], list)
        self.assertEqual(len(data['data']), 2)  # Two Twitter records
        
        # Check all records are from Twitter
        for record in data['data']:
            self.assertEqual(record['source_id'], twitter.id)
    
    def test_get_sentiment_by_topic(self):
        """Test getting sentiment data by topic"""
        # Get pricing topic id
        pricing_topic = Topic.query.filter_by(name='pricing').first()
        
        response = self.client.get(f'/api/sentiment/by-topic/{pricing_topic.id}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, dict)
        self.assertTrue(data['success'])
        self.assertIsInstance(data['data'], list)
        self.assertTrue(len(data['data']) > 0)
        
        # Check topic is in each record's topics list
        for record in data['data']:
            self.assertIn('pricing', record['topics'])
    
    def test_analyze_text(self):
        """Test analyzing custom text"""
        test_text = "Canadian Tire has great products at reasonable prices"
        
        response = self.client.post(
            '/admin/analyze',
            data=json.dumps({'text': test_text}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertTrue(data['success'])
        self.assertIn('data', data)
        self.assertIn('sentiment_score', data['data'])
        self.assertIn('sentiment_label', data['data'])
        self.assertIn('topics', data['data'])
    
    @patch('routes.collect_twitter_data')
    def test_collect_twitter_data(self, mock_collect):
        """Test Twitter data collection endpoint"""
        # Mock the collector function
        mock_collect.return_value = {'count': 5, 'success': True}
        
        response = self.client.post('/admin/collect/twitter')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('data', data)
        self.assertIn('success', data)
        self.assertTrue(data['success'])
        self.assertIn('message', data)
    
    @patch('routes.collect_reddit_data')
    def test_collect_reddit_data(self, mock_collect):
        """Test Reddit data collection endpoint"""
        # Mock the collector function
        mock_collect.return_value = {'count': 3, 'success': True}
        
        response = self.client.post('/admin/collect/reddit')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('data', data)
        self.assertIn('success', data)
        self.assertTrue(data['success'])
        self.assertIn('message', data)
    
    @patch('routes.collect_news_data')
    def test_collect_news_data(self, mock_collect):
        """Test News data collection endpoint"""
        # Mock the collector function
        mock_collect.return_value = {'count': 7, 'success': True}
        
        response = self.client.post('/admin/collect/news')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('data', data)
        self.assertIn('success', data)
        self.assertTrue(data['success'])
        self.assertIn('message', data)

if __name__ == '__main__':
    unittest.main()
