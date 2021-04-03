const express = require('express');
//glue layer(compatibility layer) between express and graphQL
const expressGraphQL = require('express-graphql');
const schema = require('./schema/schema');
const app = express();
const port = 5000;

//Antyime a request comes in with this endpoint, have graphQL library handle it
//expressGraphQL is used here as a middleware hence app.use
app.use('/graphql', expressGraphQL.graphqlHTTP({ schema, graphiql: true }));

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
