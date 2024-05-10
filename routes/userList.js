import express from "express";

const router = express.Router();

import { UserList } from "../models/UserList.js";

router.route('/').get(async (req, res) => {
    const queryUserListId = req.query.userListId;

    UserList.find({userListId: queryUserListId})
        .then((data) => {
            if (data.length === 0) {
                res.status(404).json({message: 'List not found!'});
            } else {
                res.send({data: data[0].userLists});
            }
        })
        .catch((err) => {
            console.log(err);
            res.send({data: 'failed'});
        });
});

router.route('/').post(async (req, res) => {
    UserList.countDocuments()
        .then((recordCount) => {
            const newUserList = new UserList({
                userListId: recordCount,
                userLists: req.body.data
            });

            newUserList.save()
                .then((savedUserList) => res.json({userListId: savedUserList.userListId}))
                .catch((err) => res.status(400).json(err));
        })
        .catch((err) => res.status(400).json(err));
});

export { router as userListRouter };
