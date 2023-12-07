const express = require('express')
const orderItemsRouter = express.Router()
const { getAllOrders } = require ('../db/orders')
const { getOrderItemsById, updateOrderItem, destroyOrderItems } = require ('../db/order_items')
const { requireAdmin, requireUser, requiredNotSent } = require ('./utils')
const { UNSAFE_NavigationContext } = require('react-router-dom')

orderItemsRouter.patch ('/:orderItemsId', requireUser, requiredNotSent({requiredParams: ['quantity'], atLeastOne: true}), async (req, res, next) => {
  try{
    console.log ('start patching orderItems ...')
    const {quantity} = req.body;
    const {orderItemsId} = req.params;
    const orderItemsToUpdate = await getOrderItemsById(orderItemsId)
    const orderToUpdateId = orderItemsToUpdate.order_id

    if (!orderItemsToUpdate) {
      next({
        name: 'NotFound',
        message: `No order_items found by id ${orderItemsId}`
      })
    } else {
      if(orderToUpdateId !== req.user.id) {
        res.status(403)
        console.log ('THIS IS ORDER TO UPDATE ID', orderToUpdateId)
        console.log ('THIS IS REQ USER ID ', req.user.id)
        next({
          name: "Unauthorized",
          message: "You are not the user of this order_items!"
        })
      }
      else {
        const updatedOrderItems = await updateOrderItem({id: orderItemsId, quantity})
        res.send(updatedOrderItems)
      }
    }
  }
  catch (error){
    console.error ("error in patching orderItems");
    next(error)
  }
})

orderItemsRouter.delete('/:orderItemsId', requireUser, async (req, res, next)=> {
  try {
    console.log ('deleting order...')
    const {orderItemsId} = req.params;
    console.log('THIS IS ORDER ID ', orderItemsId)
    const orderItemsToUpdate = await getOrderItemsById(orderItemsId);
    console.log ('THIS IS ORDER ITEMS TO UDPATE', orderItemsToUpdate)
    const orderToUpdateId = orderItemsToUpdate.order_id
    console.log ('THIS IS ORDER ITEMS TO UPDATE: ', orderItemsToUpdate)
    if (!orderItemsToUpdate) {
      next({
        name: 'NotFound',
        message: `No order by ID ${orderItemsId}`
      })
    }
    else if (orderToUpdateId !== req.user.id) {
      res.status(403);
      console.log ('THIS IS ORDER TO UPDATE ID', orderToUpdateId)
      console.log ('THIS IS REQ USER ID ', req.user.id)
      next({
        name: 'WrongUserError',
        message: 'You must be the same user who created this order to perform this action'
      });
    }
    else {
      
      const deletedOrderItems = await destroyOrderItems(orderItemsId)
      res.send ({deletedOrderItems})
      console.log ('order deleted ...')

    }
  }
  catch (error) {
    next(error)
  }
})

module.exports = orderItemsRouter