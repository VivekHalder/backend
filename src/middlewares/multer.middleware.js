import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //null indicates no error
        //and the next parameter informs the next middleware
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        //null indicates no error
        //and the next parameter informs the next middleware
        cb(null, file.originalname)
    }
})

//so basically upload is an instance of multer, which has storage configured as the customized storage.
export const upload = multer({
    storage: storage
})