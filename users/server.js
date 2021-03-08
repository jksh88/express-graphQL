const express = require('express');
const expressGraphQL = require('express-graphql');
const app = express();

//Antyime a request comes in with this endpoint, have graphQL library handle it
app.use(
  '/graphql',
  expressGraphQL.graphqlHTTP({
    graphiql: true,
  })
);

app.listen(4000, () => {
  console.log('Express server listening');
});