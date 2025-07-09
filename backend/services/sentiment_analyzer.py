import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from textblob import TextBlob
import re
from collections import Counter
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Download necessary NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')
    nltk.download('vader_lexicon')

# Initialize NLTK components
stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()
sid = SentimentIntensityAnalyzer()

def preprocess_text(text):
    """Clean and preprocess text for analysis"""
    if not text:
        return ""
        
    # Convert to lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'http\S+|www\S+|https\S+', '', text)
    
    # Remove user mentions (for Twitter)
    text = re.sub(r'@\w+', '', text)
    
    # Remove hashtags but keep the text
    text = re.sub(r'#(\w+)', r'\1', text)
    
    # Remove punctuation and special characters
    text = re.sub(r'[^\w\s]', '', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def extract_topics(text, num_topics=5):
    """Extract main topics from text"""
    if not text:
        return []
        
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords and lemmatize
    filtered_tokens = [lemmatizer.lemmatize(token) for token in tokens if token.lower() not in stop_words and len(token) > 2]
    
    # Count word frequencies
    word_freq = Counter(filtered_tokens)
    
    # Get most common words as topics
    topics = [word for word, freq in word_freq.most_common(num_topics)]
    
    return topics

def analyze_text(text):
    """Analyze text for sentiment and topics"""
    if not text:
        return {
            'sentiment_score': 0,
            'sentiment_magnitude': 0,
            'sentiment_label': 'neutral',
            'topics': []
        }
    
    # Preprocess text
    processed_text = preprocess_text(text)
    
    # VADER sentiment analysis
    vader_scores = sid.polarity_scores(processed_text)
    compound_score = vader_scores['compound']
    
    # TextBlob for additional analysis
    blob = TextBlob(processed_text)
    textblob_polarity = blob.sentiment.polarity
    textblob_subjectivity = blob.sentiment.subjectivity
    
    # Combine scores (weighted average)
    final_score = (compound_score * 0.7) + (textblob_polarity * 0.3)
    
    # Determine sentiment label
    if final_score > 0.05:
        sentiment_label = 'positive'
    elif final_score < -0.05:
        sentiment_label = 'negative'
    else:
        sentiment_label = 'neutral'
    
    # Extract topics
    topics = extract_topics(processed_text)
    
    # Calculate magnitude (strength of sentiment)
    # Using TextBlob's subjectivity as a proxy for magnitude
    magnitude = abs(final_score) + (textblob_subjectivity * 0.5)
    
    return {
        'sentiment_score': round(final_score, 3),
        'sentiment_magnitude': round(magnitude, 3),
        'sentiment_label': sentiment_label,
        'topics': topics
    }

def batch_analyze(texts):
    """Analyze a batch of texts"""
    results = []
    for text in texts:
        results.append(analyze_text(text))
    return results
