export const auth=(req,res,next)=>{
    if(!req.session.user){
        res.setHeader('Content-type', 'application/json');
        return res.status(401).json({
            error:`Failed to Login - Invalid credentials - no authenticated users were found.`,
        })
    }

    next()
}