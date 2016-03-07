import giphyFactory from 'giphy-api';

const giphy = giphyFactory({
  apiKey : process.env.GIPHY_API_KEY
});

export giphy as default;
