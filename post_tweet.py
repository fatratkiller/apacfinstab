#!/usr/bin/env python3
"""
Twitter posting script for @APACFinStab
Usage: python3 post_tweet.py "Your tweet text here"
"""

import sys
import json
import tweepy

# Load config
with open('/Users/kyle/clawd/apacfinstab/twitter-config.json') as f:
    config = json.load(f)

api = config['api']

client = tweepy.Client(
    consumer_key=api['api_key'],
    consumer_secret=api['api_secret'],
    access_token=api['access_token'],
    access_token_secret=api['access_token_secret']
)

def post_tweet(text):
    """Post a tweet and return the response"""
    if len(text) > 25000:
        print(f"Warning: Tweet is {len(text)} chars, truncating to 25000")
        text = text[:24997] + "..."
    
    try:
        response = client.create_tweet(text=text)
        tweet_id = response.data['id']
        print(f"✅ Posted successfully!")
        print(f"   Tweet ID: {tweet_id}")
        print(f"   URL: https://twitter.com/APACFinStab/status/{tweet_id}")
        return tweet_id
    except Exception as e:
        print(f"❌ Error posting tweet: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 post_tweet.py \"Your tweet text\"")
        sys.exit(1)
    
    tweet_text = sys.argv[1]
    post_tweet(tweet_text)
