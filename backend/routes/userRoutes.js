import express from 'express'
import asyncHandler from 'express-async-handler'
const router = express.Router()
import User from '../models/userModel.js'
import generateToken from '../utils/generateToken'
import {protect,admin} from '../middleware/authMiddleware.js' 


//Getting and cheking login info
router.post('/login',asyncHandler(async (req,res)=>{
    const {email,password}=req.body

    const user =await User.findOne({email})


    if (user && (await user.matchPassword(password))){
       res.json({
        _id:user._id,
        name:user.name,
        email:user.email,
        admin:user.admin,
        token:generateToken(user._id), //checking whether entered email is admin or not
       })
    }else{
        res.status(401)
        throw new Error('Invalid username or Password')
    }

}))



router.post('/',asyncHandler(async (req,res)=>{
    const {name,email,password}=req.body

    const userExists =await User.findOne({email})
    
    if (userExists){
        res.status(400)
        throw new Error ('User ALready registered')
    }

    const user = await User.create({
        name,
        email,
        password
    })
    

    if (user){
      
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            isAdmin:user.isAdmin,
            token:generateToken(user._id), 
        })

    }else{
        res.status(401)
        throw new Error ('Invaalid Data')
    }

}))


//Get all users for admins only
//Passing two middle ware admin check whether it is admin or not
router.route('/').get(protect,admin,asyncHandler(async(req,res)=>{
    
    const users=await User.find({})
    
    res.json(users)
    
}))




//calling protect function (check tokens) from authMiddleware file    ******Authorization*******
router.route('/profile').get(protect,asyncHandler(async(req,res)=>{
    
    const user=await User.findById(req.user._id)

    if (user){
        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            isAdmin:user.isAdmin,
        })
    }
    else{
        res.status(404)
        throw new Error ('User Not Found')
    }

}))


//Update user data
router.route('/profile').put(protect,asyncHandler(async(req,res)=>{
    
    const user=await User.findById(req.user._id)

    if (user){
       user.name=req.body.name||user.name
       user.email=req.body.email||user.email

       if (req.body.password)
       {
        user.password=req.body.password
       }

       const updatedUser =await user.save()
       
       res.json({
        _id:updatedUser._id,
        name:updatedUser.name,
        email:updatedUser.email,
        isAdmin:updatedUser.isAdmin,
        token:generateToken(updatedUser._id), 
       })

    }
    else{
        res.status(404)
        throw new Error ('User Not Found')
    }

}))



//Delete User
router.route('/:id').delete(protect,admin,asyncHandler(async(req,res)=>{
  
    const user =await User.findById(req.params.id)

    if (user){
        await user.remove()
        res.json({message:'User Removed'})
    }
    else{
        res.status(404)
        throw new Error("User Not found") 
    }
  
}))



//Get User By Id
router.route('/:id').get(protect,admin,asyncHandler(async(req,res)=>{
    
    const user=await User.findById(req.params.id).select('-password')
    
    if (user)
    res.json(user)
    else
    {
        res.status(404)
        throw new Error("User Not found") 
    }
    
}))


//Update user data by admin
router.route('/:id').put(protect,asyncHandler(async(req,res)=>{
    
    const user=await User.findById(req.params.id)

    if (user){
       user.name=req.body.name||user.name
       user.email=req.body.email||user.email
       user.admin=req.body.admin
       

       const updatedUser =await user.save()
       
       res.json({
        _id:updatedUser._id,
        name:updatedUser.name,
        email:updatedUser.email,
        admin:updatedUser.admin,
        token:generateToken(updatedUser._id), 
       })

    }
    else{
        res.status(404)
        throw new Error ('User Not Found')
    }

}))





export default router





