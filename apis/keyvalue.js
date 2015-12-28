// in-memory keyvalue store
let store = {};

export const get = (key) => {
  return store[key];
};


export const set = (key, value) => {
  store[key] = value;
};
