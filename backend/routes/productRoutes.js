import express from 'express'
import asyncHandler from 'express-async-handler'
const router = express.Router()
import Product from '../models/productModel.js'
import {protect,admin} from '../middleware/authMiddleware'
 
//get all products from  the database
router.get('/',asyncHandler (async (req,res)=>{
    
  const keyword =req.query.keyword?{
    name:{
      $regex:req.query.keyword,
      $options:'i'
    }
  }:{}
    
    const products=await Product.find({...keyword})

    res.send(products)
}))


//  Create a product through admin with sample name
router.route("/").post(protect,admin,asyncHandler(async (req,res)=>{
  const product= new Product ({
   name:'Sample name',
   price:0,
   user:req.user._id,
   image:'/images/sample.jpg',
   brand:'Sample Brand',
   category:'Sample Category',
   countInStock:0,
   numReviews:0,
   description:'Sample description'

  })

  const createdProduct= await product.save()
  res.status(201).json(createdProduct)
}))



//Creating review of a user
router.route("/:id/reviews").post(protect,asyncHandler(async (req,res)=>{
  
  const {rating,comment}=req.body

  const product= await Product.findById(req.params.id)

  if (product)
  {
   
    const alreadyReviewed=product.reviews.find(r=>r.user.toString()===req.user._id.toString())
    
    if (alreadyReviewed){
      res.status(400)
      throw new Error('Product Already Reviewed')
    }

    const review={
      name:req.user.name,
      rating:Number(rating),
      comment,
      user:req.user._id
    }

    product.reviews.push(review)
    product.numReviews=product.reviews.length
    product.rating= product.reviews.reduce((acc,item)=>item.rating+acc,0)/product.reviews.length

    await product.save()
    res.status(201).json({message:'Review Added'})

  }
  else{
    res.status(404)
    throw new Error('Product Not Found')
  }


  const createdProduct= await product.save()
  res.status(201).json(product)
}))



//get single product by their id
router.get("/:id" ,asyncHandler(async (req,res)=>{
    const product= await Product.findById(req.params.id)

    if (product)
      res.json(product)
    else
      res.send(404).json({message: 'Product Not Found'})  
}))


//Delete Product by their id
router.route("/:id").delete(protect,admin ,asyncHandler(async (req,res)=>{
  const product= await Product.findById(req.params.id)

  if (product)
  {
    await product.remove()
    res.json({message:'Product Removed'})
  }
  else
    res.send(404).json({message: 'Product Not Found'})  
}))








//Update a product from admin
router.route("/:id").put(protect,admin,asyncHandler(async (req,res)=>{
  
  const {name,price,description,image,brand,category,countInStock}=req.body

  const product= await Product.findById(req.params.id)

  if (product)
  {
    product.name=name
    product.price=price
    product.description=description
    product.image=image
    product.brand=brand
    product.category=category
    product.countInStock=countInStock

    const updatedProduct= await product.save()
    res.json(updatedProduct)
  }
  else{
    res.status(404)
    throw new Error('Product Not Found')
  }


  const createdProduct= await product.save()
  res.status(201).json(product)
}))








export default router