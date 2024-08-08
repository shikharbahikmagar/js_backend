import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
    
 const uploadOnCloudinary = async (localFilePath) => {

    try {
        if(!localFilePath) return null;
        //upload file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",

        })

        //file has been uploaded successfully
        //console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the operation got failed
        
        return null;
    }
 }

 const deleteFromCloudinary = async(imagePubId) => {
    try {
        const response = await cloudinary.uploader.destroy(imagePubId, {
          resource_type: 'image'
        });
        //console.log('Delete result:', result);
        return response;
      } catch (error) {
        console.error('Error deleting old avatar:', error);
        return null;
      }
 }



 export {uploadOnCloudinary, deleteFromCloudinary}