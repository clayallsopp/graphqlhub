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

export let getCommitsForRepo = (username, reponame) => {
  let repo = github.getRepo(username, reponame);
  return new Promise((resolve, reject) => {
    repo.getCommits({}, (err, commits) => {
      if (commits) {
        resolve(commits);
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
