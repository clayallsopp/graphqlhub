import test from 'tape';

import * as HN from '../hn';

test('HN API', (t) => {
  t.ok(HN.getItem, 'getItem should exist');
  t.end();
});
