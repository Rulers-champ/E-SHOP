import express from 'express'
import asyncHandler from 'express-async-handler'
const router = express.Router()
import Order from '../models/orderModel'
import {admin, protect} from '../middleware/authMiddleware.js' 


//Adding order details in database from the frontend
router.route('/').post(protect,asyncHandler(async(req,res)=>{
    const {
     orderItems,
     shippingAddress,
     paymentMethod,
     itemsPrice,
     taxPrice,
     shippingPrice,
     totalPrice,
    }=req.body

    if (orderItems && orderItems.length===0){
     res.status(400)
     throw new Error('No Order Items')
     return
    }
    else{
     const order=new Order({
       orderItems,
       user:req.user._id,
       shippingAddress,
       paymentMethod,
       itemsPrice,
       taxPrice,
       shippingPrice,
       totalPrice,
      })

      //saving the order in database
      const createdOrder= await order.save()

      res.status(201).json(createdOrder)
    }
}))


//Getting all orders from the database for the admin
router.route('/').get(protect,admin,asyncHandler(async(req,res)=>{
   
  //it will return the order from the database along with user info linked with it so we used populate.
  const orders =await Order.find({}).populate('user','id name')

  if (orders){
    res.json(orders)
  }

  
}))











//Getting all orders of logged in user

router.route('/myorders').get(protect,asyncHandler(async(req,res)=>{
   
  
  const orders =await Order.find({user:req.user._id})
  
  if (orders)
  res.json(orders)
  else
  {
    res.status(404)
    throw new Error ('Order Not found')
  }



}))




//Getting a specific order
router.route('/:id').get(protect,asyncHandler(async(req,res)=>{
   
  //it will return the order from the database along with user info linked with it so we used populate.
  const order =await Order.findById(req.params.id).populate('user','name email')

  if (order){
    res.json(order)
  }else{
    res.status(404)
    throw new Error('Order Not Found')
  }


  
}))










//updating the paid status of  order details
router.route('/:id/pay').put(protect,asyncHandler(async(req,res)=>{
   
  //it will return the order from the database along with user info linked with it so we used populate.
  const order =await Order.findById(req.params.id)

  if (order){
    order.isPaid=true
    order.paidAt=Date.now()
    order.paymentResult={
      
      id:req.body.id,
      status:req.body.status,
      update_time:req.body.update_time,
      email_address:req.body.payer.email_address      
    }

    const updatedOrder = await order.save()

    res.json(updatedOrder)
  }else{
    res.status(404)
    throw new Error('Order Not Found')
  }


  
}))



router.route('/:id/deliver').put(protect,admin,asyncHandler(async(req,res)=>{
   
  //it will return the order from the database along with user info linked with it so we used populate.
  const order =await Order.findById(req.params.id)

  if (order){
    order.isDelivered=true
    order.delivereddAt=Date.now()
    
    const updatedOrder = await order.save()

    res.json(updatedOrder)
  }else{
    res.status(404)
    throw new Error('Order Not Found')
  }


  
}))



export default router

//62ba14f1ceb04b3cb746c534