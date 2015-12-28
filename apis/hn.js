import fetch from 'node-fetch';

let get = function(path) {
  return fetch(`https://hacker-news.firebaseio.com/v0/${path}.json`)
  .then((res) => {
    return res.json();
  });
}

export const getItem = function(id) {
  return get(`item/${id}`);
};

export const getUser = function(id) {
  return get(`user/${id}`);
};

export const getTopStoryIds = function() {
  return get('topstories');
};

export const getNewStoryIds = function() {
  return get('newstories');
};

export const getAskStoryIds = function() {
  return get('askstories');
};

export const getShowStoryIds = function() {
  return get('showstories');
};

export const getJobStoryIds = function() {
  return get('jobstories');
};
