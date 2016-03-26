// https://developers.facebook.com/tools/explorer

import {
  getId as getNode
} from './apis/facebook';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLBoolean,
  GraphQLList,
  GraphQLInterfaceType,
  GraphQLID
} from 'graphql';

import {
  nodeDefinitions,
  fromGlobalId,

  connectionDefinitions,
  connectionArgs,
  connectionFromArray,
} from 'graphql-relay';

const getTokenFromAST = (ast) => {
  return ast.variableValues.facebookToken;
};

const getTypeFromFBGraphType = (node) => {
  return {
    user: userType,
    page: pageType,
  }[node.metadata.type];
}

const {nodeInterface, nodeField} = nodeDefinitions(
  (globalId, ast) => {
    //const { id } = fromGlobalId(globalId);
    return getNode(globalId, getTokenFromAST(ast));
  },
  (obj) => {
    return getTypeFromFBGraphType(obj);
    //return obj.ships ? factionType : shipType;
  }
);

const profileFields = () => {
  return {
    id : {
      type : new GraphQLNonNull(GraphQLID),
    },
    metadataType : {
      type : new GraphQLNonNull(GraphQLString),
      resolve(profile) {
        return profile.metadata.type;
      }
    }
  };
};

const profileInterface = new GraphQLInterfaceType({
  name: 'FacebookProfile',
  resolveType: getTypeFromFBGraphType,
  fields: {
    ...profileFields()
  }
});

const pageType = new GraphQLObjectType({
  name: 'FacebookPage',
  interfaces: [nodeInterface, profileInterface],
  fields: () => {
    return {
      ...profileFields(),
      likes: {
        type : GraphQLInt
      }
    };
  }
});

const CURSOR_NOT_SUPPORTED = 'NOT SUPPORTED';

const userType = new GraphQLObjectType({
  name: 'FacebookUser',
  interfaces: [nodeInterface, profileInterface],
  fields: () => {
    return {
      ...profileFields(),
      name : {
        type : GraphQLString,
        resolve(user, args, ast) {
          return getNode(user.id, getTokenFromAST(ast)).then((res) => {
            return res.name;
          })
        }
      },
      likes : {
        type : likesConnectionDefinitions.connectionType,
        args : connectionArgs,
        resolve(user, args, ast) {
          return getNode(user.id + `/likes`, getTokenFromAST(ast)).then((response) => {

            const { data, paging, summary} = response;
            const pages = data;

            console.log(response)

            const edges = pages.map((page) => {
              return {
                cursor : CURSOR_NOT_SUPPORTED,
                node : page
              };
            });
            const pageInfo = {
              startCursor : paging.cursors.before,
              endCursor : paging.cursors.after,
              hasPreviousPage : (!!paging.previous),
              hasNextPage : (!!paging.next)
            };

            return {
              edges,
              pageInfo
            };
          });
        }
      }
    }
  }
});

const likesConnectionDefinitions = connectionDefinitions({ nodeType : pageType });


const fbType = new GraphQLObjectType({
  name : 'FacebookAPI',
  fields : {
    viewer : {
      type : userType,
      resolve(root, args, ast) {
        return getNode('me', getTokenFromAST(ast));
      }
    },
    node: nodeField
  }
})

export const QueryObjectType = fbType;

export const QueryArgsType = {
  token : {
    type : new GraphQLNonNull(GraphQLString)
  }
};
