// adapted from https://gist.github.com/eyston/7ec48ceb30213e7fbb36
// http://hueypetersen.com/posts/2015/11/06/instrumenting-graphql-js/
// https://github.com/graphql/graphql-js/issues/109

import { GraphQLObjectType, GraphQLScalarType } from 'graphql/type/definition';

function defaultResolveFn(source, args, { fieldName }) {
  var property = source[fieldName];
  return typeof property === 'function' ? property.call(source) : property;
};

const wrapPromise = (next) => {
  return (obj, args, info) => {
    try {
      return Promise.resolve(next(obj, args, info));
    } catch (e) {
      return Promise.reject(e);
    }
  }
};

const withTiming = (next) => {
  return (obj, args, info) => {
    const start = new Date().getTime();
    return Promise.resolve(next(obj, args, info)).then(res => {
      info.rootValue.response.timing.fields.push({
        type: info.parentType.name,
        field: info.fieldName,
        args,
        duration: (new Date().getTime() - start) / 1000
      });
      return res;
    });
  }
}

const schemaFieldsForEach = (schema, fn) => {
  Object.keys(schema.getTypeMap())
    .filter(typeName => typeName.indexOf('__') !== 0) // remove schema fields...
    .map(typeName => schema.getType(typeName))
    .filter(type => type instanceof GraphQLObjectType) // make sure its an object
    .forEach(type => {
      let fields = type.getFields();
      Object.keys(fields).forEach(fieldName => {
        let field = fields[fieldName]
        fn(field, type);
      });
    });
};

export default function graphQLInstrumentation(schema, loggingCallback, { addToResponse } = {}) {
  schemaFieldsForEach(schema, (field, type) => {
    field.resolve = withTiming(wrapPromise(field.resolve || defaultResolveFn));
  });
  return (req, res, next) => {
    const start = new Date().getTime();
    let _send = res.send;
    res.send = function() {
      const end = new Date().getTime();
      const duration = (end - start) / 1000;
      req.rootValue.response.timing.duration = duration;
      res.send = _send;
      process.nextTick(() => {
        loggingCallback(req.rootValue.response.timing);
      });
      if (addToResponse) {
        // NOTE this is tied to what express-graphql does; changes in future version
        if (res.get('Content-Type') === 'text/json; charset=utf-8') {
          let jsonString = arguments[0];
          let obj = JSON.parse(jsonString);
          obj.response = req.rootValue.response;
          process.nextTick()
          return _send.apply(res, [JSON.stringify(obj)]);
        }
      }
      return _send.apply(res, arguments);
    };
    // NOTE server.js explicitly uses `req.rootValue`
    req.rootValue = {
      response : {
        timing : {
          duration : undefined,
          fields   : []
        }
      }
    };
    next();
  };
};
