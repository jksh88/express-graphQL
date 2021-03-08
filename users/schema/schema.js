const graphql = require('graphql');
const _ = require('lodash');

const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;
//GraphQLSchema is a helper that takes in a RootQuery and returns a GraphQL instance

const sampleUsers = [
  { id: '23', firstName: 'Bill', age: 50 },
  { id: '47', firstName: 'Sam', age: 51 },
];

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
  },
});

//RootQuery points to a very particular record in the graph of all the data I am dealing with
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return _.find(users, { id: args.id });
        //If my query expects to be provided with the id of the user it is fetching, that id will be present in the args object that has been used as the second parameter here in resolve function
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
