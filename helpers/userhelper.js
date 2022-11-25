var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')
const Razorpay = require('razorpay');
const { resolve } = require('path')

var instance = new Razorpay({
    key_id: 'rzp_test_EoZvNOJuFZ9rJl',
    key_secret: 'XV0o8yUbhQL7aMTx2ZKmCfsZ',
});


module.exports = {
    doSignup: (userData) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let userEmailexist = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (userEmailexist) {
                response.userExist = true
                resolve(response)
            } else {
                userData.password = await bcrypt.hash(userData.password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(data)
                }) 
            }  
        })
    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let userLoginstatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                if (user.userBlocked == true) {
                    console.log('Sorry user is blocked');
                    response.userBlocked = true

                    resolve(response)
                } else {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (status) {
                            console.log("login successfully");
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            console.log("Login failed password not exist");
                            resolve({ status: false })
                        }
                    })
                }

            } else {
                console.log("Email doesnt exist");
                resolve({ status: false })
            }
        })
    },
    getAllusers: () => {
        return new Promise((resolve, reject) => {
            let user = db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    },

    getAllOrders: () => {
        return new Promise((resolve, reject) => {
            let orders = db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $lookup: {
                        from: collection.USER_COLLECTION,
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userDetails'
                    },

                },
                {
                    $unwind: '$userDetails'

                },
                {
                    $unwind: '$totalAmount'
                },

            ]).toArray()
            resolve(orders)

        })
    },


    otpSend: (userData) => {

        return new Promise(async (resolve, reject) => {
            let response = {}
            let mobnumber = await db.get().collection(collection.USER_COLLECTION).findOne({ phonenumber: userData.phonenumber })

            if (mobnumber) {
                response.mobnumber = mobnumber
                response.user = mobnumber


            } else {
                response.usernumber = false
            }
            resolve(response)
        })
    },

    findUserByPhoneNumber:(userNumber)=>{
            return new Promise(async(resolve, reject) => {
                let userDetails=await db.get().collection(collection.USER_COLLECTION).findOne({phonenumber:userNumber})
                resolve(userDetails)

            })
           
    },

    blockUser: (userdata) => {
        return new Promise((resolve, reject) => {


            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userdata) },
                {
                    $set: {
                        userBlocked: true

                    }

                }).then((response) => {

                    resolve(response)
                })

        })
    },

    unblockUser: (userdata) => {
        return new Promise((resolve, reject) => {


            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userdata) },
                {
                    $set: {
                        userBlocked: false

                    }

                }).then((response) => {

                    resolve(response)
                })

        })
    },

    getUserDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
            resolve(user)

        })

    },

    updateUserDetails: (userId, updateUserDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOneAndUpdate({ _id: ObjectId(userId) }, {
                $set: {
                    username: updateUserDetails.username,
                    email: updateUserDetails.email,
                    phonenumber: updateUserDetails.phonenumber

                }
            }).then((response) => {
                resolve(AuthenticatorResponse)
            })

        })
    },

    addToCart: (proId, userDetails) => {

        let proObj = {
            item: ObjectId(proId),
            quantity: 1
        }

        return new Promise(async (resolve, reject) => {



            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userDetails._id) })

            if (userCart) {
                let prodExist = userCart.products.findIndex(product => product.item == proId)

                if (prodExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userDetails._id), 'products.item': ObjectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                }
                else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userDetails._id) },

                        {

                            $push: { products: proObj }

                        }

                    ).then((response) => {
                        resolve()
                    })
                }


            } else {
                let cartObj = {

                    user: ObjectId(userDetails._id),

                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve(response)
                })

            }





        })
    },

    addWishProduct: (proId, user) => {

        return new Promise(async (resolve, reject) => {

            let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectId(user._id) })

            if (userWishlist) {

                let prodExist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ products: ObjectId(proId) })

                if (prodExist) {
                    console.log('product already exist in wishList')

                    resolve({ itemExist: true })
                } else {


                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: ObjectId(user._id) },
                        {

                            $push: { products: ObjectId(proId) }

                        }).then((response) => {
                            resolve({ status: true })
                        })
                }

            } else {
                let wishListObj = {
                    user: ObjectId(user._id),
                    products: [ObjectId(proId)]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishListObj).then((response) => {
                    resolve({ status: true })
                })
            }
        })

    },

    getWishproducts: (userId) => {

        return new Promise(async (resolve, reject) => {
            let wishItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: { products: '$products' }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'products',
                        foreignField: '_id',
                        as: 'product'
                    }
                }

            ]).toArray()

            resolve(wishItems)
        })
    },

    getCartProducts: (userId) => {

        return new Promise(async (resolve, reject) => {

            let cartProducts = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId._id) }
                },
                {
                    $unwind: '$products'
                },
                
                {
                    $project: { item: '$products.item', quantity: '$products.quantity' }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },

                { 
                    $project: { 
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }

                    } 

                },
                {
                    $unwind: '$product'
                }, 
                {
                    $project: {
                        item: 1, quantity: 1, product: 1,
                       
                    }
                },
                {
                    $project: { title: 1, price: 1, img: 1, brand: 1, stock: 1 ,item: 1, quantity: 1, product: 1}
                },
                {
                    $set: { brand: { $toObjectId: "$product.brand" } }
                },
                {
                    $lookup: {
                        from: collection.BRAND_COLLECTION,
                        localField: ('brand'),
                        foreignField: '_id',
                        as: 'brand'
                    }
                },
                {
                    $unwind: '$brand'
                },
                {
                    $addFields: {
                        quantityTotal: { $multiply: ['$quantity', { $toInt: '$product.price' }] }
                    }
                },
                {
                    $addFields: {
                        offerPrice:
                        {
                            $round: {
                                $subtract: [{ $toInt: '$product.price' }, { $multiply: [{ $toInt: '$product.price' }, { $divide: [{ $toInt: '$brand.discount' }, 100] }] }]
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        quantityTotalAfterOffer: { $multiply: ['$quantity', { $toInt: '$offerPrice' }] }
                    }
                },





            ]).toArray()
            //  console.log('+++++++++++++');
            // console.log(cartProducts)
            // console.log('------------------------');
            resolve(cartProducts)

        })

    },

    getCartCount: (userId) => {

        return new Promise(async (resolve, reject) => {
            let productCount = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })

            if (cart) {
                productCount = cart.products.length
            }
            resolve(productCount)

        })
    },

    changeProductQuantity: (details) => {



        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        console.log(details.count);

        return new Promise(async (resolve, reject) => {

            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(details.product) })
            let productStock = product.stock



            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart) },
                    {
                        $pull: { products: { item: ObjectId(details.product) } }
                    }).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {

                if (details.count != -1) {
                    if (details.quantity != productStock) {


                        db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
                            {
                                $inc: { 'products.$.quantity': details.count }

                            }).then((response) => {
                                resolve({ status: true })
                            })

                    } else {
                        resolve({ status: false })
                    }





                } else {

                    db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }

                        }).then((response) => {
                            resolve({ status: true })
                        })


                }








            }




        })
    },

    deleteCartItem: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart) },
                {
                    $pull: { products: { item: ObjectId(details.product) } }
                }).then(() => {
                    resolve()
                })



        })
    },

    removeWishItem: (itemId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: ObjectId(userId) },
                {
                    $pull: { products: ObjectId(itemId) }
                }).then(() => {
                    resolve()
                })
        })
    },

    getTotalAmount: (userId) => {

        return new Promise(async (resolve, reject) => {

            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })

            if (cart) {



                let subtotal = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: ObjectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: { item: '$products.item', quantity: '$products.quantity' }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },

                    {
                        $project: { item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] } }
                    },
                    {
                        $set: { brand: { $toObjectId: "$product.brand" } }
                    },
                    {
                        $lookup: {
                            from: collection.BRAND_COLLECTION,
                            localField: ('brand'),
                            foreignField: '_id',
                            as: 'brand'
                        }
                    },
                    {
                        $unwind: '$brand'
                    },
                    {
                        $addFields: {
                            offerPrice:
                            {
                                $round: {
                                    $subtract: [{ $toInt: '$product.price' }, { $multiply: [{ $toInt: '$product.price' }, { $divide: [{ $toInt: '$brand.discount' }, 100] }] }]
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,

                            subtotal: { $sum: { $multiply: ['$quantity', { $toInt: '$offerPrice' }] } }

                        }
                    },
                    

                ]).toArray()

               
                resolve(subtotal)
            }
        })

    },

    checkCoupon: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            resolve(cart)

        })
    },

    checkCouponExist: (couponname) => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ coupon: couponname })
            resolve(coupon)
        })
    },

    removeCoupon: (userId, coupon) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).updateOne({ coupon: coupon }, {
                $pull: { user: ObjectId(userId) }
            }).then(() => {

                db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) }, {
                    $unset: { coupon: coupon }
                })

            })
        })
    },









    placeOrder: (order, products, totalPrice) => {

        return new Promise(async (resolve, reject) => {
            var today = new Date();
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

            let status = order['payment-method'] === 'cod' ? 'Order placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    mobile: order.phone,
                    address: order.address,
                    pincode: order.pin
                },
                userId: ObjectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: totalPrice,
                status: status,
                date: date



            }

            let orderedProducts = products

            console.log(orderedProducts);
            let quantity = orderedProducts[0].quantity
            let item = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(orderedProducts[0].item) })

            let stock = item.stock
            console.log(stock, quantity)
            let updatedStockCount = parseInt(stock) - parseInt(quantity)
            if (parseInt(stock) == 0) {
                updatedStockCount = undefined
            }
            console.log(updatedStockCount);
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {

                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(orderedProducts[0].item) }, {
                    $set: {
                        stock: updatedStockCount
                    }
                })
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(order.userId) })

                resolve(response.insertedId)
            })
        })


    },

    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })

            resolve(cart.products)
        })
    },



    cancelOrder: (reqbody) => {
        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.ORDER_COLLECTION).deleteOne({ _id: ObjectId(reqbody.orderId) }).then(() => {


                resolve()
            })
        })
    },

    changeOrderStatus: (orderDetails) => {
        return new Promise(async (resolve, reject) => {
            let status = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderDetails.orderId) }, {
                $set: {
                    status: orderDetails.status
                }

            })

            resolve(status)
        })
    },

    generateRazorpay: (orderId, totalPrice) => {

        return new Promise((resolve, reject) => {
            const amount = totalPrice

            instance.orders.create({
                amount: amount * 100,
                currency: "INR",
                receipt: '' + orderId,


            }, (err, order) => {

                if (err) {
                    console.log(err);
                } else {
                    console.log('new order:', order)
                    resolve(order)
                }
                resolve(order)

            })
        })
    },

    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'XV0o8yUbhQL7aMTx2ZKmCfsZ')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()

            } else {
                reject()
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) },
                {
                    $set: {
                        status: 'Order placed'
                        	

                    }
                }).then((result) => {
                    resolve()
                }).catch((err) => {

                });
        })
    },
    returnOrder:(returnedOrder)=>{
        console.log(returnedOrder)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(returnedOrder.orderId)},{
                $set:{
                    status:'Return requested',
                    returnReason:returnedOrder.reason
                }
               
            })
            resolve()
        })
    },
    approveReturn:(orderId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
                $set:{
                    status:'Return Approved '
                }
            })
            resolve()
        })
    }





}










