import { v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import ApiError from './ApiErrror';

cloudinary.config({ 
  cloud_name: 'process.env.CLOUDINARY_CLOUD_NAME', 
  api_key: 'CLOUDINARY_API_KEY', 
  api_secret: 'CLOUDINARY_API_SECRET'
});


const uploadOnCloudinary = async(localFilePath) =>{
    try{
        if(!localFilePath){
            throw new ApiError(400, "File path is required ", localFilePath);
        }

        const upload = await cloudinary.v2.uploader.upload( localFilePath, {
            resource_type : "auto",
            overwrite : true,
        });

        console.log(upload);
        return upload;
    }

    catch(error){
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        console.log("error while uploading file on cloudinary", error);
        process.exit(1);
    }
} 

export default uploadOnCloudinary;