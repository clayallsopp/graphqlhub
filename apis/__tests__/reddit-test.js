import test from 'tape';

import * as REDDIT from '../reddit';

test('REDDIT API', (t) => {
  t.ok(REDDIT.getUser, 'getUser should exist');
  t.end();
});
