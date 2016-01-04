import {
  getUser,
  getReposForUser,
  getCommitsForRepo,
  getRepoForUser,
} from '../apis/github';

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

import { isObject, isString } from 'lodash';

let CommitAuthorType = new GraphQLObjectType({
  name : 'GithubCommitAuthor',
  description : 'Commit author that is not associated with a Github acount',
  fields: {
    email : { type : GraphQLString },
    name  : { type : GraphQLString },
  }
});

let UserType = new GraphQLObjectType({
  name : 'GithubUser',
  fields() {
    return {
      login : { type : GraphQLString },
      id : { type : GraphQLInt },
      company : { type : GraphQLString },
      avatar_url : { type : GraphQLString },
      repos : {
        type : new GraphQLList(RepoType),
        resolve(user) {
          return getReposForUser(user.login);
        }
      },
    };
  }
});

let UserOrCommitAuthorType = new GraphQLUnionType({
  name: 'UserOrStringType',
  resolveType: (author) => {
    if (isObject(author) && author.login) {
      return UserType;
    }
    return CommitAuthorType;
  },
  types: [ CommitAuthorType, UserType ]
});

let CommitType = new GraphQLObjectType({
  name : 'GithubCommit',
  fields() {
    return {
      sha : { type : GraphQLString },
      author : {
        type : UserOrCommitAuthorType,
      },
      message : {
        type : GraphQLString,
        resolve(commit) {
          return commit.commit && commit.commit.message;
        }
      }
    };
  }
});

let RepoType = new GraphQLObjectType({
  name : 'GithubRepo',
  fields : {
    id : { type : GraphQLInt },
    name : { type : GraphQLString },
    commits : {
      type : new GraphQLList(CommitType),
      resolve(repo) {
        return getCommitsForRepo(repo.owner.login, repo.name);
      }
    }
  }
});

let githubType = new GraphQLObjectType({
  name : 'GithubAPI',
  description : 'The Github API',
  fields : {
    user : {
      type: UserType,
      args : {
        username : {
          description : 'Username of the user',
          type: new GraphQLNonNull(GraphQLString),
        }
      },
      resolve: function(root, { username }) {
        return getUser(username);
      }
    },
    repo : {
      type : RepoType,
      args : {
        name : {
          description : 'Name of the repo',
          type: new GraphQLNonNull(GraphQLString),
        },
        ownerUsername : {
          description : 'Username of the owner',
          type: new GraphQLNonNull(GraphQLString),
        }
      },
      resolve: function(root, { ownerUsername, name }) {
        return getRepoForUser(ownerUsername,name);
      }
    }
  }
});

export const Schema = {
  query : {
    type    : githubType,
    resolve() {
      return {};
    }
  },
};
