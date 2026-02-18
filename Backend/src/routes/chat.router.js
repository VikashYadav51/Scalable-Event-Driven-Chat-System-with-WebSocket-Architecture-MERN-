import express from 'express'
import {
    accessChat,
    createGroupChat,
    removeFromGroup,
    addToToGroup,
    renameGroup,
    getAllChats,
} from '../controllers/chat.controllers.js';

const chatRouter = express.Router();

import verifyJWT from '../middlewares/user.middlewares';

chatRouter.post('/access-chat', verifyJWT, accessChat);
chatRouter.post('/create-group', verifyJWT, createGroupChat);
chatRouter.put('/rename-group', verifyJWT, renameGroup);
chatRouter.put('/add-to-group', verifyJWT, addToToGroup);
chatRouter.put('/remove-from-group', verifyJWT, removeFromGroup);
chatRouter.get('/get-all-chats', verifyJWT, getAllChats);

export default chatRouter;



