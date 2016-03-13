import {
  getUser,
  getReposForUser,
  getCommitsForRepo,
  getRepoForUser,
  getIssuesForRepo,
  getCommentsForIssue,
  getTreeForRepo,
} from './apis/github';

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

let TreeEntryType = new GraphQLObjectType({
  name: 'GithubTreeEntry',
  fields() {
    return {
      path: {
        type: GraphQLString
      },
      last_commit: {
        type: CommitType,
        resolve(data) {
          const path = data.path;
          const { username, reponame } = grabUsernameAndReponameFromURL(data.url, 'git');
          return getCommitsForRepo(username, reponame, { path, limit: 1 })
          .then(list => list[0]); // just the commit object
        }
      }
    };
  }
})

let TreeType = new GraphQLObjectType({
  name: 'GithubTree',
  fields() {
    return {
      entries: {
        type: new GraphQLList(TreeEntryType),
        resolve(data) {
          return data;
        }
      }
    };
  }
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
      },
      date : {
        type : GraphQLString,
        resolve(commit) {
          return commit.commit && commit.commit.committer.date;
        }
      },
      tree: {
        type: TreeType,
        resolve(commit) {
          if (!commit.commit) return null;

          const { tree } = commit.commit;
          const { username, reponame } = grabUsernameAndReponameFromURL(tree.url, 'git');
          return commit.commit && getTreeForRepo(username, reponame, tree.sha);
        }
      }
    };
  }
});

let IssueCommentType = new GraphQLObjectType({
  name : 'GithubIssueCommentType',
  fields : {
    id : { type : GraphQLInt },
    body : { type : GraphQLString },
    user : {
      type : UserType,
      resolve(issueComment) {
        return issueComment.user;
      }
    }
  },
});

let IssueLabelType = new GraphQLObjectType({
  name : 'GithuIssueLabelType',
  fields: {
    url : { type : GraphQLString },
    name : { type : GraphQLString },
    color: { type : GraphQLString }
  }
});

let grabUsernameAndReponameFromURL = (url, resource) => {
  let array = url.split('/repos/')[1].split('/' + resource)[0].split('/');
  return {
    username : array[0],
    reponame : array[1],
  };
}

let IssueType = new GraphQLObjectType({
  name : 'GithubIssue',
  fields : {
    id : { type : GraphQLInt },
    state: { type : GraphQLString },
    title : { type : GraphQLString },
    body : { type : GraphQLString },
    user : { type : UserType },
    assignee : { type : UserType },
    closed_by : { type : UserType },
    labels : { type : new GraphQLList(IssueLabelType) },
    commentCount : {
      type : GraphQLInt,
      resolve(issue) {
        return issue.comments;
      }
    },
    comments : {
      type : new GraphQLList(IssueCommentType),
      resolve(issue) {
        let { username, reponame } = grabUsernameAndReponameFromURL(issue.url, 'issues');
        return getCommentsForIssue(username, reponame, issue);
      }
    }
  }
});


let RepoType = new GraphQLObjectType({
  name : 'GithubRepo',
  fields : {
    id : { type : GraphQLInt },
    name : { type : GraphQLString },
    commits : {
      type : new GraphQLList(CommitType),
      args : {
        limit: {
          type: GraphQLInt
        }
      },
      resolve(repo, args) {
        return getCommitsForRepo(repo.owner.login, repo.name, args);
      }
    },
    issues : {
      type : new GraphQLList(IssueType),
      args : {
        limit : { type : GraphQLInt }
      },
      resolve(repo, { limit }) {
        return getIssuesForRepo(repo.owner.login, repo.name).then((issues) => {
          if (limit) {
            return issues.slice(0, limit);
          }
          return issues;
        });
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

export const QueryObjectType = githubType;
