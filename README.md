# Backend of gh-navigator
View your and other's GitHub connections a little easily! [Try it out LIVE!](https://gh-maps-frontend.vercel.app/)

## Why gh-navigator?
Without a central page for user connections, searching users and their projects on GitHub is a little hard, requiring multiple clicks and page visits.\
With **gh-navigator**, you can access _any_ user's connections on a single page, with local history tracking, as well as create profile lists.

## Top features
1. **Single page** to view all connections of any user
2. Quick **user stats** for easier discovery
3. **Search history** for easier trace-back
4. Create **search lists** for future reference

## Tech stack
1. Language: JavaScript
2. Server: Express JS
3. GraphQL client: graphql-requests
4. Caching: node-cache
5. Rate-limiting: express-rate-limit

## Local setup
1. Backend (this repository)
```sh
node index.js
```
2. Companion Frontend repository [here](https://github.com/bmsohwinc/gh-maps-frontend/)

## Rate limiting warnings for Devs
1. Check GitHub's GraphQL Rate limiting rules
    - Current query fetches 84 nodes with a cost of 1 point (Normalized as: 81 connections / 100)
    - Rate limits are: 
        - 500,000 nodes per query
        - 5000 points per hour
2. Use the `x-ratelimit-remaining` header returned by the query to check remaining points


## Planning and Execution
<details>
    
- [x] Backend
    - [x] Simple backend end point
    - [x] Simple rate-limiting
    - [x] Caching of username + page
    - [x] Raw response to get remaining points metric from header
    - [x] Refactoring
- [x] Frontend
    - [ ] ~~Simple Nodes and edges~~
    - [x] Fetch data
    - [x] Lists to display Followers and Followings profiles and quick stats
    - [x] Search History
    - [ ] ~~Double-click to fetch next page~~
    - [ ] ~~GMaps / Space-like navigation~~

</details>

## References
1. [Raw request](https://github.com/jasonkuhrt/graphql-request/blob/main/examples/request-handle-raw-response.ts) in graphql-request library
2. [Rate limiting formula](https://docs.github.com/en/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api#primary-rate-limit) for GitHub GraphQL API
