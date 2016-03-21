import giphy from './apis/giphy';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLList,
  GraphQLInt
} from 'graphql';

let GiphyRatingType = new GraphQLEnumType({
  name: 'GiphyRatingType',
  description: 'The rating of a GIF',
  values: {
    y: {
      value: 'y'
    },
    g: {
      value: 'g'
    },
    pg: {
      value: 'pg'
    },
    'pg13': {
      value: 'pg-13'
    },
    r: {
      value: 'r'
    }
  }
});

const makeImageType = (name, nonNullFields) => {
  const fields = {};
  nonNullFields.forEach((fieldName) => {
    fields[fieldName] = {
      type : new GraphQLNonNull(GraphQLString)
    };
  });
  return {
    type : new GraphQLObjectType({
      name : `GiphyGIFImageData${name}`,
      fields : fields
    })
  };
}

let imageDataTypes = {
  fixed_height : makeImageType('FixedHeight', ['url', 'width', 'height', 'size', 'mp4', 'mp4_size', 'webp', 'webp_size']),
  fixed_height_still: makeImageType('FixedHeightStill', ['url', 'width', 'height']),
  fixed_height_downsampled: makeImageType('FixedHeightDownsample', ['url', 'width', 'height', 'size', 'webp', 'webp_size']),
  fixed_width: makeImageType('FixedWidth', ['url', 'width', 'height', 'size', 'mp4', 'mp4_size', 'webp', 'webp_size']),
  fixed_width_still: makeImageType('FixedWidthStill', ['url', 'width', 'height']),
  fixed_width_downsampled: makeImageType('FixedWidthDownsample', ['url', 'width', 'height', 'size', 'webp', 'webp_size']),
  fixed_height_small : makeImageType('FixedHeightSmall', ['url', 'width', 'height', 'size', 'webp', 'webp_size']),
  fixed_height_small_still: makeImageType('FixedHeightSmallStill', ['url', 'width', 'height']),
  fixed_width_small : makeImageType('FixedWidthSmall', ['url', 'width', 'height', 'size', 'webp', 'webp_size']),
  fixed_width_small_still: makeImageType('FixedWidthSmallStill', ['url', 'width', 'height']),
  downsized: makeImageType('Downsized', ['url', 'width', 'height', 'small']),
  downsized_still: makeImageType('DownsizedStill', ['url', 'width', 'height']),
  downsized_large: makeImageType('DownsizedLarge', ['url', 'width', 'height', 'size']),
  original : makeImageType('Original', ['url', 'width', 'height', 'size', 'mp4', 'mp4_size', 'webp', 'webp_size', 'frames']),
  original_still: makeImageType('OriginalStill', ['url', 'width', 'height']),
  looping: makeImageType('Looping', ['mp4']),
};

let gifImagesType = new GraphQLObjectType({
  name : 'GiphyGIFImages',
  fields : imageDataTypes
})

let gifDataType = new GraphQLObjectType({
  name : 'GiphyGIFData',
  fields: {
    id : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'The item\'s unique id.'
    },
    url : {
      type : new GraphQLNonNull(GraphQLString)
    },
    images : {
      type : new GraphQLNonNull(gifImagesType)
    }
  },
});

let takeKeysWithPrefix = (prefix, data) => {
  let keys = Object.keys(data).filter((key) => {
    return (key.indexOf(prefix) === 0);
  });
  let newData = {};
  keys.forEach((key) => {
    let truncatedKey = key.split(prefix)[1];
    newData[truncatedKey] = data[key];
  });
  return newData;
};

// for some reason, Random has a different format than search
let transformRandom = (randomData) => {
  if (!randomData) {
    return undefined;
  }

  let imageData = {
    original : takeKeysWithPrefix('image_', randomData),
    fixed_height_downsampled: takeKeysWithPrefix('fixed_height_downsampled_', randomData),
    fixed_width_downsampled: takeKeysWithPrefix('fixed_width_downsampled_', randomData),
    fixed_height_small: takeKeysWithPrefix('fixed_height_small_', randomData),
    fixed_width_small: takeKeysWithPrefix('fixed_width_small_', randomData),
  };

  let gifData = Object.assign({}, randomData, { images : imageData });
  return gifData;
};

let giphyType = new GraphQLObjectType({
  name : 'GiphyAPI',
  fields : {
    gif : {
      type : gifDataType,
      args : {
        id : {
          description : 'id of the item',
          type: new GraphQLNonNull(GraphQLString),
        }
      },
      resolve: function(root, { id }) {
        return giphy.id(id).then((res) => {
          return res.data[0];
        });
      }
    },
    search: {
      type : new GraphQLList(gifDataType),
      args : {
        query : {
          description : 'Search query or phrase',
          type : new GraphQLNonNull(GraphQLString)
        },
        limit : {
          type : GraphQLInt
        },
        offset : {
          type : GraphQLInt
        },
        rating : {
          type : GiphyRatingType
        },
      },
      resolve: function(root, { query, limit, offset, rating }) {
        let apiOptions = {
          q : query,
          limit,
          offset,
          rating
        };
        return giphy.search(apiOptions).then((res) => {
          return res.data;
        });
      }
    },
    random : {
      type : gifDataType,
      args : {
        tag : {
          description : 'the GIF tag to limit randomness by',
          type : GraphQLString
        },
        rating : {
          type : GiphyRatingType
        },
      },
      resolve: function(root, { tag, rating }) {
        let apiOptions = {
          tag,
          rating
        };
        return giphy.random(apiOptions).then((res) => {
          return transformRandom(res.data);
        });
      }
    }
  }
});

export const QueryObjectType = giphyType;
