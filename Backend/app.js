import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();


// CORS Settings
const coreOptions = {
    origin : process.env.CORS_ORIGIN,
    optionsSuccessStatus : 200,
    credentials : true,
}


// data middlewares 
app.use(cors(coreOptions));
app.use(express.json());
app.use(express.urlencoded({ extended : true, limit : '200kb'}));
app.use(express.static('public'));
app.use(cookieParser(process.env.COOKIE_SECREATE));


// Routes
import userRouter from './src/routes/user.router.js';
import chatRouter from './src/routes/chat.router.js';
import messageRouter from './src/routes/message.router.js'; 

// User Routes
app.use('/api/v1/users', userRouter);

// Chat Routes
app.use('/api/v1/chats', chatRouter);

// Message Routes
app.use('/api/v1/messages', messageRouter);


// Global Error Handler
app.use((err, req, res, next) =>{
    console.log("Golbal Error Handler ", err);
    res.status(500).json({
        success : false,
        message : err.message,
        stack : err.stack,
    });
})

export default app;

