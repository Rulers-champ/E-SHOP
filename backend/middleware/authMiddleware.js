import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'

const protect =asyncHandler(async (req,res,next) =>{
    let token

    //console.log(req.headers.authorization)

    //To check whether the toking is coming and start with header or not
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer') )
    {
        try{
            token=req.headers.authorization.split(' ')[1]

            const decoded=jwt.verify(token ,process.env.JWT_SECRET)
            console.log(decoded)

            req.user = await User.findById(decoded.id).select('-password')

            
        }catch(error){
            
            console.error(error)
            res.status(401)
            throw new Error('Not Authorized,token failed')

        }
    }

    if (!token){
        res.status(401)
        throw new Error('Not Authorized, No Token')
    }

    next()
})



//admin middleware that checks that the logged in user is admin or not

const admin =(req,res,next) => {
    if (req.user && req.user.admin){
        next()
    }
    else{
        res.status(401)
        throw new Error ('Not authorized as an admin')
    }
}

export {protect,admin}