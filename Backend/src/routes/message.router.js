import express from 'express';

import {
    getAllMessage,
    sendMessage,
    deleteMessage,
    updateMessage,
} from '../controllers/message.controllers.js';

import verifyJWT from '../middlewares/user.middlewares.js';

const messageRouter = express.Router();
messageRouter.post('/send-message/:chatId', verifyJWT, sendMessage);
messageRouter.get('/get-all-messages/:chatId', verifyJWT, getAllMessage);
messageRouter.delete('/delete-message/:messageId', verifyJWT, deleteMessage);
messageRouter.put('/update-message/:messageId', verifyJWT, updateMessage);

export default messageRouter;