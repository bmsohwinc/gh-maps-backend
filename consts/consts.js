import { gql } from "graphql-request"

export const QUERIED_NODE = {
    FOLLOWERS: 'followers',
    FOLLOWINGS: 'following',
}


export const followingsGraphqlQuery = gql`
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

export const followersGraphqlQuery = gql`
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

