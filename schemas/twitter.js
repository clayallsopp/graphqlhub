import * as twitter from '../apis/twitter';

import {
    graphql,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLEnumType,
    GraphQLInt,
    GraphQLList,
    GraphQLUnionType,
} from 'graphql';

let UserType = new GraphQLObjectType({

    name: 'TwitterUser',
    description: 'Twitter user, or as we like to say in France: a \'tweetos\'',
    fields: () => ({
        created_at: { type: GraphQLString },
        description: { type: GraphQLString },
        id: { type: GraphQLInt },
        screen_name: { type: GraphQLString },
        name: { type: GraphQLString },
        profile_image_url: { type: GraphQLString },
        url: { type: GraphQLString },
        tweets_count: { 
            type: GraphQLInt,
            resolve: ({ statuses_count: tweets_count }) => tweets_count
        },
        followers_count: { type: GraphQLInt },
        tweets: {
            type: new GraphQLList(TweetType),
            description: 'Get a list of tweets for current user',
            args: {
                limit: { type: GraphQLInt }
            },

            //             user            args
            resolve: ({ id: userId }, { limit = 10 }) => twitter.getTweets(userId, limit)
        }
    })

});

let TweetType = new GraphQLObjectType({

    name: 'Tweet',
    description: 'A tweet object',
    fields: () => ({
        id: { type: GraphQLString },
        id_str: { type: GraphQLString },
        created_at: { type: GraphQLString },
        user_screen_name: {
            type: GraphQLString,
            resolve: ({ user: { screen_name: user_screen_name } }) => user_screen_name
        },
        user_id: {
            type: GraphQLInt,
            resolve: ({ user: { id: user_id } }) => user_id
        },
        text: { type: GraphQLString },
        retweet_count: { type: GraphQLInt },
        retweets: {
            type: new GraphQLList(RetweetType),
            description: 'Get a list of retweets',
            args: {
                limit: { type: GraphQLInt }
            },
            resolve: ({ id_str: tweetId }, { limit = 5 }) => twitter.getRetweets(tweetId, limit)
        }
    })
});

let RetweetType = new GraphQLObjectType({

    name: 'Retweet',
    description: 'Retweet of a tweet',
    fields: () => ({
        id: { type: GraphQLString },
        created_at: { type: GraphQLString },
        in_reply_to_tweet_id: {
            type: GraphQLString,
            resolve: ({ in_reply_to_status_id: in_reply_to_tweet_id }) => in_reply_to_tweet_id
        },
        in_reply_to_user_id: { type: GraphQLInt },
        in_reply_to_screen_name: { type: GraphQLString }
    })
});

let twitterType = new GraphQLObjectType({

    name: 'TwitterAPI',
    description: 'The Twitter API',
    fields: {
        user: {
            type: UserType,
            args: {
                user_id: {
                    description: 'ID of user account',
                    type: GraphQLInt
                },
                screen_name: {
                    description: 'Screenname of the user',
                    type: GraphQLString
                }
            },
            resolve: (_, { user_id, screen_name }) => {

                const { getUser } = twitter;

                if (!user_id && !screen_name) {
                    return getUser('user_id', 9533042);
                }
                else {

                    if (isNaN(parseInt(user_id))) {
                        return getUser('screen_name', screen_name);
                    }
                    else {
                        return getUser('user_id', user_id);
                    }
                }
            }
        },
        tweet: {
            type: TweetType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString),
                    description: 'Unique ID of tweet'
                }
            },
            resolve: (_, { id: tweetId }) => twitter.getTweet(tweetId)
        }
    }
});

export const Schema = {
    query: {
        type: twitterType,
        resolve() {
            return {};
        }
    }
};