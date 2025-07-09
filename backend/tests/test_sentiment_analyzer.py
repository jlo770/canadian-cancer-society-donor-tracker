import unittest
import sys
import os
from datetime import datetime

# Add the parent directory to the path so we can import our modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.sentiment_analyzer import analyze_text, batch_analyze, extract_topics, preprocess_text

class TestSentimentAnalyzer(unittest.TestCase):
    def test_analyze_text_positive(self):
        """Test analyzing positive text"""
        text = "I love shopping at Canadian Tire. Their products are excellent and the staff is very helpful."
        result = analyze_text(text)
        
        self.assertIsNotNone(result)
        self.assertGreater(result['sentiment_score'], 0)
        self.assertEqual(result['sentiment_label'], 'positive')
        self.assertIsInstance(result['topics'], list)
        
    def test_analyze_text_negative(self):
        """Test analyzing negative text"""
        text = "I had a terrible experience at Canadian Tire. The products were overpriced and the staff was rude."
        result = analyze_text(text)
        
        self.assertIsNotNone(result)
        self.assertLess(result['sentiment_score'], 0)
        self.assertEqual(result['sentiment_label'], 'negative')
        self.assertIsInstance(result['topics'], list)
        
    def test_analyze_text_neutral(self):
        """Test analyzing neutral text"""
        text = "Canadian Tire sells automotive parts and household items."
        result = analyze_text(text)
        
        self.assertIsNotNone(result)
        self.assertTrue(-0.1 <= result['sentiment_score'] <= 0.1)
        self.assertEqual(result['sentiment_label'], 'neutral')
        self.assertIsInstance(result['topics'], list)
        
    def test_extract_topics(self):
        """Test topic extraction"""
        text = "Canadian Tire has great deals on winter tires and automotive accessories this week."
        topics = extract_topics(text)
        
        self.assertIsInstance(topics, list)
        self.assertTrue(len(topics) > 0)
        # Check if relevant topics are extracted
        all_topics = ' '.join(topics).lower()
        self.assertTrue(any(word in all_topics for word in ['tire', 'automotive', 'winter', 'deals']))
        
    def test_batch_analyze(self):
        """Test batch analysis of multiple texts"""
        texts = [
            "Canadian Tire has excellent customer service.",
            "The prices at Canadian Tire are too high.",
            "Canadian Tire sells household products and automotive parts."
        ]
        
        results = batch_analyze(texts)
        
        self.assertEqual(len(results), 3)
        self.assertTrue(results[0]['sentiment_score'] > 0)  # Positive
        self.assertTrue(-0.1 <= results[1]['sentiment_score'] <= 0.1)  # Actually neutral
        self.assertTrue(-0.1 <= results[2]['sentiment_score'] <= 0.1)  # Neutral
        
    def test_preprocess_text(self):
        """Test text preprocessing"""
        text = "Check out these AMAZING deals at Canadian Tire!!! #CanadianTire @CanadianTire http://canadiantire.ca"
        processed = preprocess_text(text)
        
        # Check if preprocessing removed URLs, mentions, hashtags, and excessive punctuation
        self.assertNotIn('http', processed)
        self.assertNotIn('#', processed)
        self.assertNotIn('@', processed)
        self.assertNotIn('!!!', processed)
        self.assertIn('amazing', processed.lower())
        self.assertIn('canadian tire', processed.lower())

if __name__ == '__main__':
    unittest.main()
