import cors from 'cors';
import express from 'express';
import {rateLimit} from 'express-rate-limit';
import 'dotenv/config';

import { ClientError, gql, rawRequest } from 'graphql-request';
import graphQLClient from './graphql-client.js';

import pkg from 'body-parser';
import { processGraphQLData } from './utils.js';
import { QUERIED_NODE } from './consts.js';
const { json, urlencoded } = pkg;

const BASE_URL = 'https://api.github.com/graphql';
const PORT = 3001;
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
app.use(cors());


const followingsGraphqlQuery = gql`
    query($limit:Int!, $login:String!, $afterPage: String) {
        user (login: $login) {
            avatarUrl
            login
            name
            following (first: $limit after: $afterPage) {
                totalCount
                nodes {
                    login
                    name
                    avatarUrl
                    followers {
                        totalCount
                    }
                    following {
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

const followersGraphqlQuery = gql`
    query($limit:Int!, $login:String!, $afterPage: String) {
        user (login: $login) {
            avatarUrl
            login
            name
            followers (first: $limit after: $afterPage) {
                totalCount
                nodes {
                    login
                    name
                    avatarUrl
                    followers {
                        totalCount
                    }
                    following {
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

async function queryGitHub(req, res, queriedNode) {

    const query = queriedNode === QUERIED_NODE.FOLLOWERS ? followersGraphqlQuery : followingsGraphqlQuery;
    try {
        const variables = {
            limit: QUERY_RECORD_LIMIT,
            login: req.query.login,
            afterPage: req.query.afterPage === 'null' ? null : req.query.afterPage,
        }
        const { data, errors, extensions, headers, status } = await rawRequest(
            BASE_URL, 
            query, 
            variables,
            {
                authorization: `Bearer ${process.env.GH_API_KEY}`,
            }
        );
        const requestsRemaining = headers.get('x-ratelimit-remaining');
        res.send({ data: processGraphQLData(data, queriedNode) });
    } catch (error) {
        console.log(`User not found: ${req.query.login}`);
        res.status(404).send({message: 'USER_NOT_FOUND'});
    }
}


app.get('/followings', async (req, res, next) => {
    await queryGitHub(req, res, QUERIED_NODE.FOLLOWINGS);
});

app.get('/followers', async (req, res, next) => {
    await queryGitHub(req, res, QUERIED_NODE.FOLLOWERS);
});


app.listen(PORT, () => console.log('server started'));
