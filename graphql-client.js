import { gql, GraphQLClient } from 'graphql-request';

const BASE_URL = 'https://api.github.com/graphql';

const graphQLClient = new GraphQLClient(BASE_URL, {
    headers: {
        authorization: `Bearer ${process.env.GH_API_KEY}`,
    },
});

export default graphQLClient;
