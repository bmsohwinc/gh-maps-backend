import express from 'express';
import {rateLimit} from 'express-rate-limit';
import 'dotenv/config';

import { gql } from 'graphql-request';
import graphQLClient from './graphql-client.js';

import pkg from 'body-parser';
const { json, urlencoded } = pkg;


const PORT = 3000;
const QUERY_RECORD_LIMIT = 20;
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 50, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})

const app = express();
app.use(json())
app.use(urlencoded({ extended: false }));
app.use(limiter);


const graphqlQuery = gql`
    query($limit:Int!, $login:String!, $afterPage: String) {
        user (login: $login) {
            login
            company
            location
            following (first: $limit after: $afterPage) {
                totalCount
                nodes {
                    login
                    company
                    location
                    following {
                        totalCount
                    }
                    followers {
                        totalCount
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
        }
    } 
`


app.get('/', async (req, res, next) => {
    const variables = {
        limit: QUERY_RECORD_LIMIT,
        login: req.query.login,
        afterPage: req.query.afterPage === 'null' ? null : req.query.afterPage,
    }
    const data = await graphQLClient.request(graphqlQuery, variables);
    console.log(data);
    res.send(data);
});


app.listen(PORT, () => console.log('server started'));

