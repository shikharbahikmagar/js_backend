//promise method
const asyncHandler = (requestHandler) => {

    Promise.resolve(requestHandler(req, res, next))
    .catch((err) => {

        next(err);
    })
}


export {asyncHandler}

//async await method
// const asyncHandler2 = (fn) => async (req, res, next) => 
// {

//     try {
//             await fn(req, res, next);        
//     } catch (error) {
        
//         res.status(res.code || 500).json(
//             {
                
//                 success:false,
//                 message: error.message,
                
//             });
//     }
// }