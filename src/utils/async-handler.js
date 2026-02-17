const asyncHandler = (requestHandler)=>{

    return (req,res,next)=>{  //  (req,res,next)--> wrapper around your async route
        Promise
        .resolve(requestHandler(req,res,next))
        .catch((err) => next(err))
    }
}

export {asyncHandler}