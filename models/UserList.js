import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userListSchema = new Schema({
    userListId: {type: Number, required: true},
    userLists: {type: Array, required: true},
});

export const UserList = mongoose.model('UserList', userListSchema);
