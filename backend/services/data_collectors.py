import os
import tweepy
import praw
import requests
from datetime import datetime, timedelta
import json
from dotenv import load_dotenv
from models import db, SentimentSource, SentimentRecord, Topic, DailySentimentSummary
from services.sentiment_analyzer import analyze_text, batch_analyze

# Load environment variables
load_dotenv()

# Constants
CANADIAN_TIRE_KEYWORDS = [
    'Canadian Tire', 
    'CanadianTire', 
    'CT Corp', 
    'Canadian Tire Corporation',
    '$CTC',  # Stock symbol
    'CTCa',  # Stock symbol variant
]

def get_or_create_source(name, source_type, description=None):
    """Get or create a sentiment source"""
    source = SentimentSource.query.filter_by(name=name, type=source_type).first()
    
    if not source:
        source = SentimentSource(
            name=name,
            type=source_type,
            description=description or f"{source_type.capitalize()} source for {name}"
        )
        db.session.add(source)
        db.session.commit()
        
    return source

def get_or_create_topic(topic_name):
    """Get or create a topic"""
    topic = Topic.query.filter_by(name=topic_name).first()
    
    if not topic:
        topic = Topic(name=topic_name)
        db.session.add(topic)
        db.session.commit()
        
    return topic

def save_sentiment_record(source, content_text, content_url=None, published_date=None):
    """Analyze and save a sentiment record"""
    # Skip if content is too short
    if not content_text or len(content_text) < 5:
        return None
        
    # Analyze sentiment
    analysis = analyze_text(content_text)
    
    # Create record
    record = SentimentRecord(
        source=source,
        content_text=content_text,
        content_url=content_url,
        sentiment_score=analysis['sentiment_score'],
        sentiment_magnitude=analysis['sentiment_magnitude'],
        sentiment_label=analysis['sentiment_label'],
        published_date=published_date or datetime.utcnow(),
        analyzed_date=datetime.utcnow()
    )
    
    # Add topics
    for topic_name in analysis['topics']:
        topic = get_or_create_topic(topic_name)
        record.topics.append(topic)
    
    # Save to database
    db.session.add(record)
    db.session.commit()
    
    return record

def update_daily_summary(date=None):
    """Update the daily sentiment summary"""
    if not date:
        date = datetime.utcnow().date()
    
    # Get all records for the day
    start_datetime = datetime.combine(date, datetime.min.time())
    end_datetime = datetime.combine(date, datetime.max.time())
    
    records = SentimentRecord.query.filter(
        SentimentRecord.analyzed_date >= start_datetime,
        SentimentRecord.analyzed_date <= end_datetime
    ).all()
    
    if not records:
        return None
    
    # Calculate metrics
    record_count = len(records)
    positive_count = sum(1 for r in records if r.sentiment_label == 'positive')
    negative_count = sum(1 for r in records if r.sentiment_label == 'negative')
    neutral_count = sum(1 for r in records if r.sentiment_label == 'neutral')
    
    average_sentiment = sum(r.sentiment_score for r in records) / record_count if record_count > 0 else 0
    
    # Collect all topics
    all_topics = {}
    for record in records:
        for topic in record.topics:
            if topic.name in all_topics:
                all_topics[topic.name] += 1
            else:
                all_topics[topic.name] = 1
    
    # Get top topics
    top_topics = sorted(all_topics.items(), key=lambda x: x[1], reverse=True)[:10]
    top_topics_json = json.dumps(dict(top_topics))
    
    # Get or create summary
    summary = DailySentimentSummary.query.filter_by(date=date).first()
    
    if not summary:
        summary = DailySentimentSummary(date=date)
    
    # Update summary
    summary.average_sentiment = average_sentiment
    summary.record_count = record_count
    summary.positive_count = positive_count
    summary.negative_count = negative_count
    summary.neutral_count = neutral_count
    summary.top_topics = top_topics_json
    
    # Save to database
    db.session.add(summary)
    db.session.commit()
    
    return summary

def collect_twitter_data():
    """Collect data from Twitter/X"""
    # Twitter API credentials
    consumer_key = os.environ.get('TWITTER_CONSUMER_KEY')
    consumer_secret = os.environ.get('TWITTER_CONSUMER_SECRET')
    access_token = os.environ.get('TWITTER_ACCESS_TOKEN')
    access_token_secret = os.environ.get('TWITTER_ACCESS_TOKEN_SECRET')
    
    if not all([consumer_key, consumer_secret, access_token, access_token_secret]):
        raise ValueError("Twitter API credentials not found in environment variables")
    
    # Initialize Twitter API client
    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)
    api = tweepy.API(auth)
    
    # Get source
    source = get_or_create_source("Twitter", "twitter", "Twitter/X posts about Canadian Tire")
    
    # Collect tweets for each keyword
    collected_tweets = []
    for keyword in CANADIAN_TIRE_KEYWORDS:
        try:
            tweets = api.search_tweets(q=keyword, count=100, tweet_mode="extended", lang="en")
            
            for tweet in tweets:
                # Skip retweets
                if hasattr(tweet, 'retweeted_status'):
                    continue
                
                # Get full text
                if hasattr(tweet, 'full_text'):
                    text = tweet.full_text
                else:
                    text = tweet.text
                
                # Create URL
                tweet_url = f"https://twitter.com/{tweet.user.screen_name}/status/{tweet.id}"
                
                # Save record
                record = save_sentiment_record(
                    source=source,
                    content_text=text,
                    content_url=tweet_url,
                    published_date=tweet.created_at
                )
                
                if record:
                    collected_tweets.append(record.to_dict())
        
        except Exception as e:
            print(f"Error collecting tweets for keyword '{keyword}': {str(e)}")
    
    # Update daily summary
    update_daily_summary()
    
    return {
        "count": len(collected_tweets),
        "source": "Twitter",
        "records": collected_tweets[:10]  # Return only first 10 for brevity
    }

def collect_reddit_data():
    """Collect data from Reddit"""
    # Reddit API credentials
    client_id = os.environ.get('REDDIT_CLIENT_ID')
    client_secret = os.environ.get('REDDIT_CLIENT_SECRET')
    user_agent = os.environ.get('REDDIT_USER_AGENT', 'python:canadian-tire-sentiment:v1.0 (by /u/yourUsername)')
    
    if not all([client_id, client_secret]):
        raise ValueError("Reddit API credentials not found in environment variables")
    
    # Initialize Reddit API client
    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=user_agent
    )
    
    # Get source
    source = get_or_create_source("Reddit", "reddit", "Reddit posts and comments about Canadian Tire")
    
    # Subreddits to search
    subreddits = ['PersonalFinanceCanada', 'CanadianInvestor', 'canada', 'investing', 'stocks']
    
    # Collect posts and comments
    collected_posts = []
    
    for subreddit_name in subreddits:
        try:
            subreddit = reddit.subreddit(subreddit_name)
            
            # Search for posts
            for keyword in CANADIAN_TIRE_KEYWORDS:
                posts = subreddit.search(keyword, limit=25, time_filter='week')
                
                for post in posts:
                    # Save post
                    record = save_sentiment_record(
                        source=source,
                        content_text=f"{post.title} {post.selftext}",
                        content_url=f"https://www.reddit.com{post.permalink}",
                        published_date=datetime.fromtimestamp(post.created_utc)
                    )
                    
                    if record:
                        collected_posts.append(record.to_dict())
                    
                    # Get top comments
                    post.comments.replace_more(limit=0)
                    for comment in post.comments.list()[:10]:
                        comment_record = save_sentiment_record(
                            source=source,
                            content_text=comment.body,
                            content_url=f"https://www.reddit.com{comment.permalink}",
                            published_date=datetime.fromtimestamp(comment.created_utc)
                        )
                        
                        if comment_record:
                            collected_posts.append(comment_record.to_dict())
        
        except Exception as e:
            print(f"Error collecting Reddit data from r/{subreddit_name}: {str(e)}")
    
    # Update daily summary
    update_daily_summary()
    
    return {
        "count": len(collected_posts),
        "source": "Reddit",
        "records": collected_posts[:10]  # Return only first 10 for brevity
    }

def collect_news_data():
    """Collect data from News API"""
    # News API key
    api_key = os.environ.get('NEWS_API_KEY')
    
    if not api_key:
        raise ValueError("News API key not found in environment variables")
    
    # Get source
    source = get_or_create_source("News Articles", "news", "News articles about Canadian Tire")
    
    # Collect news articles
    collected_articles = []
    
    # Date range (last 7 days)
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)
    
    # Format dates for API
    from_date = start_date.strftime('%Y-%m-%d')
    to_date = end_date.strftime('%Y-%m-%d')
    
    # Search for each keyword
    for keyword in CANADIAN_TIRE_KEYWORDS:
        try:
            url = f"https://newsapi.org/v2/everything?q={keyword}&from={from_date}&to={to_date}&language=en&sortBy=relevancy&apiKey={api_key}"
            response = requests.get(url)
            data = response.json()
            
            if data.get('status') == 'ok':
                articles = data.get('articles', [])
                
                for article in articles:
                    # Save article
                    record = save_sentiment_record(
                        source=source,
                        content_text=f"{article.get('title')} {article.get('description')}",
                        content_url=article.get('url'),
                        published_date=datetime.strptime(article.get('publishedAt'), '%Y-%m-%dT%H:%M:%SZ') if article.get('publishedAt') else None
                    )
                    
                    if record:
                        collected_articles.append(record.to_dict())
        
        except Exception as e:
            print(f"Error collecting news data for keyword '{keyword}': {str(e)}")
    
    # Update daily summary
    update_daily_summary()
    
    return {
        "count": len(collected_articles),
        "source": "News",
        "records": collected_articles[:10]  # Return only first 10 for brevity
    }
