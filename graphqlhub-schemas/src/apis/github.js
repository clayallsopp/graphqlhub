import Github from 'github-api';

var github = new Github({
  token : process.env.GITHUB_TOKEN,
  auth: 'oauth',
});

export let getUser = (username) => {
  let user = github.getUser();
  return new Promise((resolve, reject) => {
    user.show(username, (err, user) => {
      if (user) {
        resolve(user);
      }
      else {
        reject(err);
      }
    });
  });
};

export let getReposForUser = (username) => {
  let user = github.getUser();
  return new Promise((resolve, reject) => {
    user.userRepos(username, (err, repos) => {
      if (repos) {
        resolve(repos);
      }
      else {
        reject(err);
      }
    });
  });
};

export let getCommitsForRepo = (username, reponame, options = {}) => {
  let repo = github.getRepo(username, reponame);
  let params = {};
  if (options.limit) params.perpage = options.limit;
  if (options.path) params.path = options.path;
  if (options.sha) params.sha = options.sha;

  return new Promise((resolve, reject) => {
    repo.getCommits(params, (err, commits) => {
      if (commits) {
        resolve(commits);
      }
      else {
        reject(err);
      }
    });
  });
};

let getBranchesLastCommits = (repo, branchNames) => {
  return branchNames.map((name) => new Promise((resolve, reject) => {
    repo.getRef('heads/' + name, (err, sha) => {
      if (sha) {
        resolve({ name, sha });
      }
      else {
        reject(err);
      }
    });
  }));
};

export let getBranchesForRepo = (username, reponame) => {
  let repo = github.getRepo(username, reponame);
  return new Promise((resolve, reject) => {
    repo.listBranches((err, branches) => {
      if (branches) {
        resolve(Promise.all(getBranchesLastCommits(repo, branches)));
      }
      else {
        reject(err);
      }
    });
  });
};

export let getRepoForUser = (username, reponame) => {
  let repo = github.getRepo(username, reponame);
  return new  Promise((resolve, reject) => {
    repo.show((err, repo) => {
      if (repo) {
        resolve(repo);
      }
      else {
        reject(err);
      }
    });
  });
}

export let getIssuesForRepo = (username, reponame) => {
  let issues = github.getIssues(username, reponame);
  return new Promise((resolve, reject) => {
    issues.list({}, (err, issues) => {
      if (issues) {
        resolve(issues);
      }
      else {
        reject(err);
      }
    });
  });
}

export let getCommentsForIssue = (username, reponame, issue) => {
  let issues = github.getIssues(username, reponame);
  return new Promise((resolve, reject) => {
    issues.getComments(issue, (err, comments) => {
      if (comments) {
        resolve(comments);
      }
      else {
        reject(err);
      }
    });
  });
}

export let getTreeForRepo = (username, reponame, tree) => {
  return new Promise((resolve, reject) => {
    github.getRepo(username, reponame)
    .getTree(tree, (err, result) => {
      if (result) {
        resolve(result);
      }
      else {
        reject(err);
      }
    });
  });
}

export let getStatusesForRepo = (username, reponame, sha) => {
  return new Promise((resolve, reject) => {
    github.getRepo(username, reponame)
    .getStatuses(sha, (err, result) => {
      if (result) {
        resolve(result);
      }
      else {
        reject(err);
      }
    });
  });
}
