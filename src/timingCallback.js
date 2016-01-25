import keen from './keen';

export default (timings) => {
  keen.addEvent('totalDurations', { duration : timings.duration });
  timings.fields.forEach(({ type, field, args, duration }) => {
    // filter out really fast things (probably just obj.property calls)
    if (duration > 0.005) {
      keen.addEvent('fieldDurations', { type, field, duration });
    }
  });
}
