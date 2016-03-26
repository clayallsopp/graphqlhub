import {Facebook, FacebookApiException} from 'fb';

const createClient = () => {
  const client = new Facebook();
  client.apiAsync = (...args) => {
    let promise = new Promise((resolve, reject) => {
      return client.api(...args, (res) => {
        if(!res || res.error) {
          reject(res && res.error);
          return;
        }
        resolve(res);
      });
    });
    return promise;
  };
  return client;
}

export const getId = (id, token) => {
  const client = createClient();
  client.setAccessToken(token);
  return client.apiAsync(id, { metadata: '1' });
};
