import Twit from 'Twit';

const {
    TWITTER_ACCESS_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET
} = process.env;

const Twitter = new Twit({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token: TWITTER_ACCESS_TOKEN,
    access_token_secret: TWITTER_ACCESS_SECRET
});

export const getUser = (authKey, authValue) => {

    return new Promise((resolve, reject) => {

        Twitter.get(
            'users/show',
            {
                [authKey]: authValue
            },
            (error, user) => {

                if (error) {
                    reject(error);
                }
                else {
                    resolve(user);
                }
            }
        )
    });
};

export const getTweets = (userId, limit) => {

    return new Promise((resolve, reject) => {

        Twitter.get(
            'statuses/user_timeline',
            {
                user_id: userId,
                count: limit
            },
            (error, tweets) => {

                if (error) {
                    reject(error);
                }
                else {
                    resolve(tweets);
                }
            }
        )
    });
};

export const getTweet = (tweetId) => {

    return new Promise((resolve, reject) => {

        Twitter.get(
            'statuses/show',
            {
                id: tweetId
            },
            (error, tweet) => {

                if (error) {
                    reject(error);
                }
                else {
                    resolve(tweet);
                }
            }
        )
    });
};

export const getRetweets = (tweetId, limit) => {

    return new Promise((resolve, reject) => {

        Twitter.get(
            'statuses/retweets',
            {
                id: tweetId,
                count: limit
            },
            (error, retweets) => {

                if (error) {
                    reject(error);
                }
                else {
                    resolve(retweets);
                }
            }
        )
    });
};


//function generateAPIPromise(url, )