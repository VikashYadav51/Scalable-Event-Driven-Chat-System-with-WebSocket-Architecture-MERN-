import mongoose from 'mongoose';

const connectDb = async() =>{ 
    try {
        const url = process.env.MONGODB_URL 
        const databaseName = process.env.DATABASE_CONSTANT_NAME
        const connectionInstance = await mongoose.connect(`${url}/${databaseName}`)
        // console.log(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        return connectionInstance; 
    }

    catch(error){
        console.log("Error while connecting to database", error);
        process.exit(1);
    }
}

export default connectDb;
