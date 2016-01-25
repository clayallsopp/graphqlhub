import Keen from 'keen-js';

const client = new Keen({
  projectId : process.env.KEEN_PROJECT_ID,
  writeKey  : process.env.KEEN_WRITE_KEY,
});

export { client as default };
