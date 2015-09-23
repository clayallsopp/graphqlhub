import fetch from 'node-fetch';

import Qs from 'qs';

let get = function(path, query) {
  if (query) {
    query = `?${Qs.stringify(query)}`
  }
  else {
    query = '';
  }
  return fetch(`https://reddit.com/${path}.json${query}`)
  .then((res) => {
    return res.json();
  });
};

let getUser = function(username) {
  return get(`user/${username}/about`);
};

let getSubreddit = function(name) {
  return get(`r/${name}/about`);
};

let getSubredditListings = function(subredditName, listingType, options = {}) {
  return get(`r/${subredditName}/${listingType}`, options);
};

let getComments = function(subredditName, linkId, options = {}) {
  return get(`r/${subredditName}/comments/${linkId}`, options);
}

export default {
  getUser,
  getSubreddit,
  getSubredditListings,
  getComments
};
