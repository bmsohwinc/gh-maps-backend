# Github Connections Visualizer

## Rate limiting warnings for Devs
1. Check GitHub's GraphQL Rate limiting rules
    - Current query fetches 84 nodes with a cost of 1 point (Normalized as: 81 connections / 100)
    - Rate limits are: 
        - 500,000 nodes per query
        - 5000 points per hour
2. Use the `x-ratelimit-remaining` header returned by the query to check remaining points


## Planning and Execution
<details>
- [ ] Backend
    - [ ] Simple backend end point
    - [ ] Simple rate-limiting
    - [ ] Caching of username + page
    - [ ] Raw response to get remaining points metric from header
    - [ ] Refactoring
- [ ] Frontend
    - [ ] Simple Nodes and edges
    - [ ] Fetch data
    - [ ] Double-click to fetch next page
    - [ ] GMaps / Space-like navigation
</details>
