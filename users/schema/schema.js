const graphql = require('graphql');
const axios = require('axios');

const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;
//GraphQLSchema is a helper that takes in a RootQuery and returns a GraphQL instance

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    product: { type: GraphQLString },
  },
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      async resolve(parentValue, args) {
        const { data } = await axios.get(
          `http://localhost:3000/companies/${parentValue.companyId}`
        );
        return data;
      },
    },
  },
});

//RootQuery points to a very particular record in the graph of all the data I am dealing with
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, args) {
        const { data } = await axios.get(
          `http://localhost:3000/users/${args.id}`
        );
        //restructuring data was done because axios returns (when promise resolves) something that looks like '{data: {...}, status: 200, headers: {...} ...}'
        return data;
        //If my query expects to be provided with the id of the user it is fetching, that id will be present in the args object that has been used as the second parameter here in resolve function
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
