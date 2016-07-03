import test from 'tape';
import * as GitHub from '../github';

test('GitHub API', (t) => {
  for (let f of [
    'getUser',
    'getReposForUser',
    'getCommitsForRepo',
    'getRepoForUser',
    'getIssuesForRepo',
    'getCommentsForIssue',
    'getTreeForRepo',
    'getStatusesForRepo',
    'getBranchesForRepo'
  ]) {
    t.ok(GitHub[f], f + ' should exist');
  }

  let statusesForRepo = GitHub.getStatusesForRepo('lowsky', 'dashboard', '484ece8');
  statusesForRepo.then(statuses => t.ok(statuses.length > 0, ' should have some statuses'));

  t.end();
});
