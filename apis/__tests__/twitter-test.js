import test from 'tape';
import * as Twitter from '../twitter';

test('Twitter API', (t) => {
  t.ok(Twitter.getUser, 'getUser should exist');
  t.ok(Twitter.getTweet, 'getTweet should exist');
  t.ok(Twitter.getTweets, 'getTweets should exist');
  t.ok(Twitter.getRetweets, 'getRetweets should exist');
  t.end();
});
