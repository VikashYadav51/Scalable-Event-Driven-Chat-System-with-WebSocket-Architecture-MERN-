import dotenv from 'dotenv';
import app from './app.js';
import connectDb from './src/database/database.js';

dotenv.config({});

connectDb()
.then(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
    console.log("Database connected successfully");
})
.catch(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
    console.log("Database connection failed");
})
