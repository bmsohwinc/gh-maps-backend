import { QUERIED_NODE } from "./consts/consts.js";

export function processNodes(nodes) {
    return nodes.map((node) => ({
        login: node.login,
        name: node.name,
        avatarUrl: node.avatarUrl,
        followers: node.followers.totalCount,
        followings: node.following.totalCount,
    }));
}

export function processGraphQLData(data, queriedNode) {
    const res = {
        login: data.user.login,
        avatarUrl: data.user.avatarUrl,
        name: data.user.name,
    };

    if (queriedNode === QUERIED_NODE.FOLLOWERS) {
        res.totalFollowers = data.user.followers.totalCount;
        res.followersData = processNodes(data.user.followers.nodes);
        res.followersPage = {
            afterPage: data.user.followers.pageInfo.endCursor,
            hasNextPage: data.user.followers.pageInfo.hasNextPage,
        }
    }

    if (queriedNode === QUERIED_NODE.FOLLOWINGS) {
        res.totalFollowings = data.user.following.totalCount;
        res.followingsData = processNodes(data.user.following.nodes);
        res.followingsPage = {
            afterPage: data.user.following.pageInfo.endCursor,
            hasNextPage: data.user.following.pageInfo.hasNextPage,
        }
    }

    return res;
}
