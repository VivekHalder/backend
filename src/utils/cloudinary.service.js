import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            console.log("Couldnot find the file path.")
            return null;
        }
        //upload to cloudinary
       const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" //what type of data is being uploaded.
        });
        //console.log(response.url);
        //file has been uploaded successfully
        //console.log("File is uploaded to cloudinary.");
        fs.unlinkSync(localFilePath);
        console.log(response);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation got failed.
        return null;
    }
};

const deleteFromCloudinary = async ( imagePublicId ) => {
    try {
        if(!imagePublicId){
            console.log("Public ID of the image couldnot be found.");
            return null;
        }

        const response = await cloudinary.uploader.destroy( imagePublicId, ( error, result ) => {
            if( error ){
                console.error(" Error occured in deletiing the image. Error ", error?.message );
            } else {
                console.log(`Image deleted successfully.`);
            }
        } );

        return response;

    } catch (error) {
        console.error("Error occured while deleting image from cloudinary. Error ", error?.message );
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };