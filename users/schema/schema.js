const graphql = require('graphql');
const axios = require('axios');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
} = graphql;
//GraphQLSchema is a helper that takes in a RootQuery and returns a GraphQL instance
//graphiql is the client and the graphql-express is its server at 5000
//GraphQL server(at 5000) makes queries to outside 3rd party server(3000) that has its own database to grad data from it - Sct3.14)
//json-server is used here to mock that 3rd party server. it needs infomration in db.json file base on which it mocks that server
//json-server is a completely separate process from the express-graphql server running
//json-server is run on 3000 by default (https://www.npmjs.com/package/json-server#alternative-port)
//to make json-server run on an alternative port use --port flag ($ json-server --watch db.json --port 3004)
//so both servers need to be running

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  //To circumvent circular reference between UserType and CompanyType, use callback for fields value instead so they get executed after the references are successfully made between the userType and companyType
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    product: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType), //I cannot just do 'type: UserType' because there could be many users for a company. So, this should be a list. Use 'GraphQLList' provided by graphQl. Don't forget to import it at top of file from graphql librarys
      async resolve(parentValue, args) {
        //the needed data is nested as a value to the key 'data' in axios response. difference with fetch api. this is just how axios was designed
        const { data } = await axios.get(
          `http://localhost:3004/companies/${parentValue.id}/users`
          //request from graphQl server at 5000 over to remote json-server at 3004
          //parentValue is the particular instance of the company that I am currently working with
        );
        return data;
      },
    },
  }),
});
//the parentValue here is the instance of the company that has been fetched here and I am working with

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      async resolve(parentValue, args) {
        //For these console.log statments to run, make the query that includes this field 'company' in graphiql
        console.log(parentValue); //{ id: '23', firstName: 'Bill', age: 50, companyId: '1' } OR { id: '49', firstName: 'Alec', age: 55, companyId: '2' }, depending on what user is queried
        console.log(args); //{}
        const { data } = await axios.get(
          `http://localhost:3004/companies/${parentValue.companyId}`
        );
        return data;
      },
    },
  }),
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
          `http://localhost:3004/users/${args.id}`
        );
        //args is short for arguments. signifies arguments required for the RootQuery for a given user. So whenever someone wants to query for a user, graphQL expects him to provide it with an id argument as a string as stipultated here.
        //restructuring data was done because axios returns (when promise resolves) something that looks like '{data: {...}, status: 200, headers: {...} ...}'
        return data;
        //Root query is used to allow graphQL to enter into the application's data graph
        //If my query expects to be provided with the id of the user it is fetching, that id will be present in the args object that has been used as the second parameter here in resolve function
      },
    },
    //if RootQuery doesn't contain the below, I cannot make queries that enters the data graph through company. I can only do queries that start with user
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, args) {
        const { data } = await axios.get(
          `http://localhost:3004/companies/${args.id}`
        );
        return data;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
