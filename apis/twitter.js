import Twit from 'Twit';
import getObjProperty from 'lodash.get';

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

export const getUser = (authKey, authValue) =>  __getPromise('users/show', { [authKey]: authValue });
export const getTweets = (user_id, count) =>    __getPromise('statuses/user_timeline', { user_id, count });
export const getTweet = (id) =>                 __getPromise('statuses/show', { id });
export const getRetweets = (id, count) =>       __getPromise('statuses/retweets', { id, count });
export const searchFor = (queryArgs) =>         __getPromise("search/tweets", queryArgs, 'statuses');

const __getPromise = (endpoint, args, resultPath = null) => {

    return new Promise((resolve, reject) => {

        Twitter.get(
            endpoint,
            args,
            (error, result) => {

                if (error) {
                    reject(error);
                }
                else {
                    resolve( resultPath !== null ? getObjProperty(result, resultPath) : result );
                }
            }
        )
    });
};