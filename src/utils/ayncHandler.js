const asyncHandler = (requestHandler) => {
    (error, res, req, next) => {
        Promise
        .resolve(requestHandler(error, res, req, next))
        .catch( (err) => {
            next(err);
        } )
    }
};

export { asyncHandler };


//second method using try-catch
// const asyncHandler = ( requestHandler ) => { async () => {
//     try {
//         await requestHandler( error, res, req, next );
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }};