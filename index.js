import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { rateLimit } from 'express-rate-limit';
import NodeCache from 'node-cache';
import mongoose from 'mongoose';
import { rawRequest } from 'graphql-request';

import { userListRouter } from './routes/userList.js';
import { processGraphQLData } from './utils.js';
import { QUERIED_NODE, followersGraphqlQuery, followingsGraphqlQuery } from './consts/consts.js';
import pkg from 'body-parser';

const BASE_URL = 'https://api.github.com/graphql';
const PORT = 3001;
const QUERY_RECORD_LIMIT = 20;
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 50, // Limit each IP to 50 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
})

// Connect to MongoDB
mongoose.connect(`${process.env.MONGO_CNXN_STRING}`)
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
});

const { json, urlencoded } = pkg;
const app = express();
app.use(json())
app.use(urlencoded({ extended: false }));
app.use(limiter);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


const CACHE_TTL_IN_SECS = 60 * 60 * 2; // 2 hours
const followingsCache = new NodeCache({ stdTTL: CACHE_TTL_IN_SECS });
const followersCache = new NodeCache({ stdTTL: CACHE_TTL_IN_SECS });


async function queryGitHub(req, res, query, queriedNode, cache) {
    const cacheKey = req.query.login + '-' + req.query.afterPage;
    const cacheData = cache.get(cacheKey);

    // Cache hit
    if (cacheData !== undefined) {
        console.log(`Cache hit for ${cacheKey}`);
        res.send({ data: cacheData });
        return;
    }

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
        const processedData = processGraphQLData(data, queriedNode);
        cache.set(cacheKey, processedData);
        res.send({ data: processedData });
    } catch (error) {
        console.log(`User not found: ${req.query.login}`);
        res.status(404).send({ message: 'USER_NOT_FOUND' });
    }
}


// Health check end point
app.get('/', (req, res) => res.status(200).send({ message: 'Hello' }));

// Others
app.get('/followings', async (req, res, next) => {
    await queryGitHub(req, res, followingsGraphqlQuery, QUERIED_NODE.FOLLOWINGS, followingsCache);
});

app.get('/followers', async (req, res, next) => {
    await queryGitHub(req, res, followersGraphqlQuery, QUERIED_NODE.FOLLOWERS, followersCache);
});

app.use('/lists', userListRouter);

app.listen(PORT, () => console.log('server started'));
