// in-memory keyvalue store
let store = {
  initialKey : 'initialValue',
};

export const get = (key) => {
  return store[key];
};


export const set = (key, value) => {
  if (key === 'initialKey') {
    return;
  }
  store[key] = value;
};
