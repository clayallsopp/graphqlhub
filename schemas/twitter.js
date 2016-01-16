import _ from 'lodash';
import * as twitter from '../apis/twitter';

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLList,
} from 'graphql';

let UserType = new GraphQLObjectType({

  name: 'TwitterUser',
  description: 'Twitter user, or as we like to say in France: a \'tweetos\'',
  fields: () => ({
    created_at: { type: GraphQLString },
    description: { type: GraphQLString },
    id: { type: GraphQLID }, // GraphQLInt would return null
    screen_name: { type: GraphQLString },
    name: { type: GraphQLString },
    profile_image_url: { type: GraphQLString },
    url: { type: GraphQLString },
    tweets_count: {
      type: GraphQLInt,
      resolve: ({ statuses_count }) => statuses_count
    },
    followers_count: { type: GraphQLInt },
    tweets: {
      type: new GraphQLList(TweetType),
      description: 'Get a list of tweets for current user',
      args: {
        limit: { type: GraphQLInt }
      },
      //             user            args
      resolve: ({ id: user_id }, { limit = 10 }) => twitter.getTweets(user_id, limit)
    }
  })

});

let TweetType = new GraphQLObjectType({

  name: 'Tweet',
  description: 'A tweet object',
  fields: () => ({
    id: { type: GraphQLID },
    created_at: { type: GraphQLString },
    text: { type: GraphQLString },
    retweet_count: { type: GraphQLInt },
    user: {
      type: UserType
    },
    retweets: {
      type: new GraphQLList(RetweetType),
      description: 'Get a list of retweets',
      args: {
        limit: { type: GraphQLInt }
      },
      //        passing integer 'id' here doesn't work surprisingly, had to use 'id_str'
      resolve: ({ id_str: tweetId }, { limit = 5 }) => twitter.getRetweets(tweetId, limit)
    }
  })
});

let RetweetType = new GraphQLObjectType({

  name: 'Retweet',
  description: 'Retweet of a tweet',
  fields: () => ({
    id: { type: GraphQLID },
    created_at: { type: GraphQLString },
    in_reply_to_tweet_id: {
      type: GraphQLString,
      resolve: ({ in_reply_to_status_id }) => in_reply_to_status_id
    },
    in_reply_to_user_id: { type: GraphQLInt },
    in_reply_to_screen_name: { type: GraphQLString },
    retweeted_status: {
      type: TweetType
    },
    user: {
      type: UserType
    }
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

          if (_.isNumber(user_id)) {
            return getUser('user_id', user_id);
          }
          else {
            return getUser('screen_name', screen_name);
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
    },
    search: {
      type: new GraphQLList(TweetType),
      description: "Returns a collection of relevant Tweets matching a specified query.",
      args: {
        q: {
          type: new GraphQLNonNull(GraphQLString),
          description: "A UTF-8, URL-encoded search query of 500 characters maximum, including operators. Queries may additionally be limited by complexity."
        },
        count: {
          type: GraphQLInt,
          description: "The number of tweets to return per page, up to a maximum of 100. Defaults to 15. This was formerly the “rpp” parameter in the old Search API."
        },
        result_type: {
          type: GraphQLString,
          description: `Specifies what type of search results you would prefer to receive. The current default is “mixed.” Valid values include:
          * mixed: Include both popular and real time results in the response.
          * recent: return only the most recent results in the response
          * popular: return only the most popular results in the response.`
        }
      },
      resolve: (_, searchArgs) => twitter.searchFor(searchArgs)
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
