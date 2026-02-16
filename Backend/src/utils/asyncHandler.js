const asyncHandler = (requestHandler) =>{
    return(err, req, res, next)=>{
        Promise.resolve( requestHandler(req, res, next)).catch(err => next(err));
    }
}

export default asyncHandler;