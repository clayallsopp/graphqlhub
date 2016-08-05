import {
  getUser,
  getReposForUser,
  getCommitsForRepo,
  getRepoForUser,
  getIssuesForRepo,
  getCommentsForIssue,
  getTreeForRepo,
  getStatusesForRepo,
  getBranchesForRepo,
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

let StatusType = new GraphQLObjectType({
  name : 'GithubStatus',
  description : 'Status of a commit',
  fields: {
    state : { type : GraphQLString },
    description : { type : GraphQLString },
    target_url: { type : GraphQLString },
    context: { type : GraphQLString },
    updated_at: { type : GraphQLString }
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
  name: 'UserOrCommitAuthor',
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
          const { username, reponame } = grabUsernameAndReponameFromURL(data.url);
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
        resolve(obj) {
          return obj.author || (obj.commit && obj.commit.author);
        }        
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
      status : {
        type : new GraphQLList(StatusType),
        resolve(commit) {
          const { username, reponame } = grabUsernameAndReponameFromURL(commit.url);
          const { sha } = commit;
          return getStatusesForRepo(username, reponame, sha);
        }
      },
      tree: {
        type: TreeType,
        resolve(commit) {
          if (!commit.commit) return null;

          const { tree } = commit.commit;
          const { username, reponame } = grabUsernameAndReponameFromURL(tree.url);
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
  name : 'GithubIssueLabelType',
  fields: {
    url : { type : GraphQLString },
    name : { type : GraphQLString },
    color: { type : GraphQLString }
  }
});

let grabUsernameAndReponameFromURL = (url) => {
  let array = url.split('https://api.github.com/repos/')[1].split('/');
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
        let { username, reponame } = grabUsernameAndReponameFromURL(issue.url);
        return getCommentsForIssue(username, reponame, issue);
      }
    }
  }
});


let BranchType = new GraphQLObjectType({
  name : 'GithubBranch',
  fields : {
    name : { type : GraphQLString },
    lastCommit: {
      type: CommitType,
      resolve: (branch) => {
        const { ownerUsername, reponame } = branch; // info has been added while loading
        return getCommitsForRepo(ownerUsername, reponame, { sha: branch.sha })
            .then(list => list[0]); // just the commit object
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
    },
    branches : {
      type : new GraphQLList(BranchType),
      args : {
        limit : { type : GraphQLInt }
      },
      resolve(repo, { limit }) {
        const ownerUsername = repo.owner.login;
        const reponame = repo.name;
        return getBranchesForRepo(ownerUsername, reponame).then((branches) => {
          // add repo referenceData
          return branches.map( (b) => ({reponame, ownerUsername, ...b}) );
        }).then((branches) => {
          if (limit) {
            // Later: optimise query...
            return branches.slice(0, limit);
          }
          return branches;
        });
      }
    },
    owner: {
      type: UserType
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
