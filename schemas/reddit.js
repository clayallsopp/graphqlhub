import {
  getUser,
  getSubreddit,
  getSubredditListings,
  getComments
} from '../apis/reddit';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLBoolean,
  GraphQLList,
  GraphQLFloat
} from 'graphql';

/*
  Listing
  Article
  Comment
  User
*/

let itemTypeEnum = new GraphQLEnumType({
  name: 'ItemType',
  description: 'The type of object',
  values: {
    comment: {
      value: 't1'
    },
    account: {
      value: 't2'
    },
    link: {
      value: 't3'
    },
    message: {
      value: 't4'
    },
    subreddit: {
      value: 't5'
    },
    award: {
      value: 't6'
    },
    promoCampaign: {
      value: 't8'
    }
  }
});

let timeIntervalType = new GraphQLEnumType({
  name : 'TimeInterval',
  description : 'Time interval by which listings are queried',
  values: {
    hour : {
      value : 'hour'
    },
    day : {
      value : 'day'
    },
    week : {
      value : 'week'
    },
    month : {
      value : 'month'
    },
    year : {
      value : 'year'
    },
    all : {
      value : 'All'
    }
  }
});

let userType = new GraphQLObjectType({
  name : 'RedditUser',
  description : 'Information about a Reddit user',
  fields : {
    fullnameId : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'The Reddit API fullname of the user',
      resolve : (user) => {
        return `${user.kind}_${user.data.id}`;
      }
    },
    username : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'The user\'s unique username.',
      resolve: (user) => {
        return user.data.name;
      }
    },
    created : {
      type : new GraphQLNonNull(GraphQLFloat),
      description : 'Creation date of the user, in Unix Time (UTC)',
      resolve: (user) => user.data.created_utc
    },
    createdISO : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'Creation date of the user, in ISO8601',
      resolve: (user) => {
        let date = new Date(user.data.created_utc * 1000);
        return date.toISOString();
      }
    },
    linkKarma : {
      type : new GraphQLNonNull(GraphQLInt),
      description : 'Karma by links of the user',
      resolve: (user) => {
        return user.data.link_karma;
      }
    },
    commentKarma : {
      type : new GraphQLNonNull(GraphQLInt),
      description : 'Karma by comments of the user',
      resolve: (user) => {
        return user.data.comment_karma;
      }
    }
  }
});

let createListingField = function(description, listingType, { hasTimeInterval = false } = {}) {
  let args = {
    after : {
      description : 'FullnameId of an item in the listing to use as the anchor point of the slice.',
      type: GraphQLString,
    },
    before : {
      description : 'FullnameId of an item in the listing to use as the anchor point of the slice.',
      type: GraphQLString,
    },
    count : {
      description : 'The number of items already seen in this listing',
      type: GraphQLInt
    },
    limit : {
      description : 'The maximum number of items to return in this slice of the listing.',
      type : GraphQLInt
    }
  };
  if (hasTimeInterval) {
    args.timeInterval = {
      description : 'Time interval to retrieve listings',
      type : timeIntervalType
    }
  }
  return {
    description,
    args,
    type : new GraphQLNonNull(new GraphQLList(linkType)),
    resolve : (subreddit, args) => {
      let requestOptions = args;
      requestOptions.t = args.timeInterval;
      delete requestOptions.timeInterval;
      return getSubredditListings(subreddit.data.display_name, listingType, requestOptions).then((data) => {
        return data.data.children;
      });
    }
  }
};

let commentType = new GraphQLObjectType({
  name : 'RedditComment',
  description : 'A comment on a link',
  fields : () => ({
    author : {
      description : 'Author of the comment',
      type : new GraphQLNonNull(userType),
      resolve : (comment) => getUser(comment.data.author)
    },
    body : {
      description : 'Body of the comment',
      type : new GraphQLNonNull(GraphQLString),
      resolve : (comment) => comment.data.body
    },
    replies : {
      description : 'Replies to the comment',
      type : new GraphQLNonNull(new GraphQLList(commentType)),
      args : {
        depth : {
          type : GraphQLInt,
          description : 'Maximum depth of subtrees in the thread'
        },
        limit : {
          type : GraphQLInt,
          description : 'Maximum number of comments to return'
        }
      },
      resolve : (comment, args) => {
        let linkId = comment.data.link_id.split('_')[1];
        args.comment = comment.data.id;
        return getComments(comment.data.subreddit, linkId, args).then((data) => {
          return data[1].data.children;
        });
      }
    }
  })
});

let linkType = new GraphQLObjectType({
  name : 'RedditLink',
  description : 'A link posted to a subreddit',
  fields : {
    title : {
      description : 'Title of the link',
      type : new GraphQLNonNull(GraphQLString),
      resolve : (link) => link.data.title
    },
    fullnameId : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'The Reddit API fullname of the link',
      resolve : (link) => {
        return `${link.kind}_${link.data.id}`;
      }
    },
    score : {
      type : new GraphQLNonNull(GraphQLInt),
      description : 'Score of the link',
      resolve : (link) => link.data.score
    },
    numComments : {
      type : new GraphQLNonNull(GraphQLInt),
      description : 'Number of comments',
      resolve : (link) => link.data.num_comments
    },
    url : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'URL of the link',
      resolve : (link) => link.data.url
    },
    author : {
      type : new GraphQLNonNull(userType),
      description : 'Author of the link',
      resolve : (link) => getUser(link.data.author)
    },
    comments : {
      type : new GraphQLNonNull(new GraphQLList(commentType)),
      description : 'Comments on the link',
      args : {
        depth : {
          type : GraphQLInt,
          description : 'Maximum depth of subtrees in the thread'
        },
        limit : {
          type : GraphQLInt,
          description : 'Maximum number of comments to return'
        }
      },
      resolve : (link, args) => {
        return getComments(link.data.subreddit, link.data.id, args).then((data) => {
          return data[1].data.children;
        });
      }
    }
  }
});

let subredditType = new GraphQLObjectType({
  name : 'RedditSubreddit',
  description : 'Information about and listings in a subreddit',
  fields : {
    name : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'Name of the subreddit',
      resolve : (subreddit) => subreddit.data.display_name
    },
    fullnameId : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'The Reddit API fullname of the subreddit',
      resolve : (subreddit) => {
        return `${subreddit.kind}_${subreddit.data.id}`;
      }
    },
    title : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'Title of the subreddit',
      resolve : (subreddit) => subreddit.data.title
    },
    publicDescription : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'Description of the subreddit',
      resolve : (subreddit) => subreddit.data.public_description
    },
    accountsActive : {
      type : new GraphQLNonNull(GraphQLInt),
      description : 'Accounts active right now on the subreddit',
      resolve : (subreddit) => subreddit.data.accounts_active
    },
    subscribers : {
      type : new GraphQLNonNull(GraphQLInt),
      description : 'Number of subscribers to the subreddit',
      resolve : (subreddit) => subreddit.data.subscribers
    },
    created : {
      type : new GraphQLNonNull(GraphQLFloat),
      description : 'Creation date of the subreddit, in Unix Time (UTC)',
      resolve: (subreddit) => subreddit.data.created_utc
    },
    createdISO : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'Creation date of the subreddit, in ISO8601',
      resolve: (subreddit) => {
        let date = new Date(subreddit.data.created_utc * 1000);
        return date.toISOString();
      }
    },
    hotListings           : createListingField('Hot/"Front Page" listings of the subreddit', 'hot'),
    newListings           : createListingField('Newest listings of the subreddit', 'new'),
    risingListings        : createListingField('Rising listings of the subreddit', 'rising'),
    controversialListings : createListingField('Controversial listings of the subreddit', 'controversial', { hasTimeInterval : true }),
    topListings           : createListingField('Top listings of the subreddit', 'controversial', { hasTimeInterval : true }),
  }
});

let redditType = new GraphQLObjectType({
  name : 'RedditAPI',
  description : 'The Reddit API',
  fields : {
    subreddit : {
      type: subredditType,
      args : {
        name : {
          description : 'Name of the subreddit',
          type: new GraphQLNonNull(GraphQLString),
        }
      },
      resolve: function(root, { name }) {
        return getSubreddit(name);
      }
    },
    user : {
      type: userType,
      args : {
        username : {
          description : 'Username of the user',
          type: new GraphQLNonNull(GraphQLString),
        }
      },
      resolve: function(root, { username }) {
        return getUser(username);
      }
    }
  }
});

let SCHEMA = {
  type : redditType,
  resolve() {
    return {};
  }
};

module.exports = SCHEMA;
