const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
        .resolve(requestHandler(req, res, next))
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