import fetch from 'node-fetch';

let get = function(path) {
  return fetch(`https://hacker-news.firebaseio.com/v0/${path}.json`)
  .then((res) => {
    return res.json();
  });
}

let getItem = function(id) {
  return get(`item/${id}`);
};

let getUser = function(id) {
  return get(`user/${id}`);
};

let getTopStoryIds = function() {
  return get('topstories');
};

let getNewStoryIds = function() {
  return get('newstories');
};

let getAskStoryIds = function() {
  return get('askstories');
};

let getShowStoryIds = function() {
  return get('showstories');
};

let getJobStoryIds = function() {
  return get('jobstories');
};

export default {
  getItem,
  getUser,
  getTopStoryIds,
  getNewStoryIds,
  getAskStoryIds,
  getShowStoryIds,
  getJobStoryIds
};
