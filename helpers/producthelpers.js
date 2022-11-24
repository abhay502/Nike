var db = require('../config/connection')
var collection = require('../config/collection')
const { ObjectId } = require('mongodb')
const { response } = require('express')
module.exports = {

    addProduct: (product) => {

        return new Promise((resolve, reject) => {

            db.get().collection('product').insertOne(product).then((data) => {

                resolve(data.insertedId);


            })

        })


    },

    findSearch: (payload) => {
        return new Promise(async (resolve, reject) => {
            let search = await db.get().collection(collection.PRODUCT_COLLECTION).find({ title: { $regex: new RegExp('^' + payload + '.*', 'i') } }).toArray()

            resolve(search)
        })

    },

    addBrand: (brandDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection('brand').insertOne(brandDetails).then((data) => {
                resolve(data.insertedId);
            })
        })
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([

                {
                    $project: { title: 1, price: 1, img: 1, brand: 1, stock: 1 }
                },
                {
                    $set: { brand: { $toObjectId: "$brand" } }
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
                                $subtract: [{ $toInt: '$price' }, { $multiply: [{ $toInt: '$price' }, { $divide: [{ $toInt: '$brand.discount' }, 100] }] }]
                            }
                        }
                    }
                }




            ]).toArray()
            // console.log(products)
            resolve(products)

        })
    },

    getAllBrands: () => {
        return new Promise(async (resolve, reject) => {
            let brands = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
            resolve(brands)
        })
    },

    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId(proId) }).then((data) => {
                resolve(data)
            })
        })
    },

    deleteBrand: (braId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).deleteOne({ _id: ObjectId(braId) }).then((data) => {
                resolve(data)
            })
        })
    },

    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(proId) }).then((product) => {
               
                resolve(product)
            })
        })
    },

    getBrandDetails: (brandId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).findOne({ _id: ObjectId(brandId) }).then((brand) => {
                resolve(brand)
            })
        })
    },

    viewMore: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let viewmore = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(orderId) }
                },
                {
                    $lookup: {
                        from: collection.USER_COLLECTION,
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userdetails'
                    }
                },
                {
                    $unwind: '$userdetails'
                },
                {
                    $lookup: {
                        from: collection.ADDRESS_COLLECTION,
                        localField: 'userId',
                        foreignField: 'userId',
                        as: 'Address'
                    }
                },
                {
                    $unwind: '$Address'
                },
                {

                    $unwind: '$products'
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'orderedProducts'
                    }
                },
                {
                    $unwind: '$orderedProducts'
                },
                {
                    $unwind: '$totalAmount'
                },
                {
                    $sort: { _id: -1 }
                }



            ]).toArray()
            resolve(viewmore)


        })
    },



    updateProduct: (proId, productDetails) => {
        return new Promise(async (resolve, reject) => {
            let image = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(proId) })
            if (productDetails.img.length == 0) {
                productDetails.img = image.img
            }
            db.get().collection(collection.PRODUCT_COLLECTION).findOneAndUpdate({ _id: ObjectId(proId) }, {
                $set: {
                    title: productDetails.title,
                    brand: productDetails.brand,
                    subcategory: productDetails.subcategory,
                    price: productDetails.price,
                    img: productDetails.img
                }
            }).then((response) => {
                resolve(response)
            })
        })

    },

    updateBrand: (brandId, brandDetails) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOneAndUpdate({ _id: ObjectId(brandId) },
                {
                    $set: {
                        brand: brandDetails.brand,
                        img: brandDetails.img
                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    },

    updateStock: (proId, stock) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(proId) }, {
                $set: {
                    stock: stock
                }

            }).then((response) => {
                resolve((response))
            })
        })

    },
    addBrandOffer: (brandDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).updateOne({ _id: ObjectId(brandDetails.brandId) }, {
                $set: {
                    discount: brandDetails.discount
                }
            })
            resolve()
        })

    },



    quickViewProducts: (proId) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match:{_id:ObjectId(proId)}
                },
                {
                    $project: { title: 1, price: 1, img: 1, brand: 1, stock: 1 }
                },
                {
                    $set: { brand: { $toObjectId: "$brand" } }
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
                                $subtract: [{ $toInt: '$price' }, { $multiply: [{ $toInt: '$price' }, { $divide: [{ $toInt: '$brand.discount' }, 100] }] }]
                            }
                        }
                    }
                }
            ]).toArray()
            // console.log(product) 
            resolve(product)
        })
    },

    getOrderDetails: (user) => {
        return new Promise(async (resolve, reject) => {

            let item = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { userId: ObjectId(user._id) }
                },


                {

                    $unwind: '$products'
                },

                {
                    $project: {
                        item: '$products.item', quantity: '$products.quantity',
                        paymentMethod: 1, status: 1, date: 1
                    }

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
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] },
                        paymentMethod: 1, status: 1, date: 1
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: 1,
                       
                        paymentMethod: 1, status: 1, date: 1
                    }
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
                    $addFields:{
                        quantityTotal: { $multiply: ['$quantity', { $toInt: '$product.price' }] },
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



                {
                    $sort:{_id:-1}
                }



            ]).toArray()

            console.log(item)
            resolve(item)

        })
    },

    cancelOrderedItem: (orderId, userId) => {
        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.ORDER_COLLECTION).update({ _id: ObjectId(orderId) },
                {
                    $set: { status: 'order-cancelled' }
                }).then(() => {
                    let productCancelled = db.get().collection(collection.ORDER_COLLECTION).aggregate([

                        {
                            $match: { _id: ObjectId(orderId) }
                        },


                        {

                            $unwind: '$products'
                        },

                        {
                            $project: {
                                item: '$products.item', quantity: '$products.quantity',
                                paymentMethod: 1, status: 1, date: 1
                            }

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
                                item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] },
                                paymentMethod: 1, status: 1, date: 1
                            }
                        },





                    ]).toArray()
                    resolve(productCancelled)
                })



        })
    },

    incrementStockAfterCancel: (proId, quantity) => {
        return new Promise((resolve, reject) => {
            console.log(proId, quantity);

            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(proId) }, {
                $inc: {
                    stock: quantity
                }
            })
        })
    },

    addCoupon: (couponDetails) => {
        return new Promise((resolve, reject) => {
            console.log(couponDetails)

            db.get().collection(collection.COUPON_COLLECTION).insertOne(couponDetails).then((data) => {

                resolve(data.insertedId);


            })
        })
    },

    getAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let coupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupons)
        })
    },
    deleteCoupon: (couponId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: ObjectId(couponId) })
            resolve()
        })
    },

    findCoupon: (coupon, user) => {
        return new Promise(async (resolve, reject) => {
            let couponExist = await db.get().collection(collection.COUPON_COLLECTION).findOne({ coupon: coupon })
            let response = {};
            if (couponExist) {
                let userCheck = await db.get().collection(collection.COUPON_COLLECTION).findOne({ coupon: coupon, user: { $in: [ObjectId(user._id)] } })
                if (userCheck) {
                    response.used = true;
                    resolve(response)
                } else {
                    date = new Date()
                    expdate = new Date(couponExist.date)

                    if (date <= expdate) {
                        console.log("%%%%%%%%%")
                        db.get().collection(collection.COUPON_COLLECTION).updateOne({ coupon: coupon },
                            {

                                $push: { user: ObjectId(user._id) }

                            }).then((response) => {
                                db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(user._id) },
                                    {
                                        $set: { coupon: coupon }
                                    })
                                response.a = couponExist
                                resolve(response)
                            })
                    } else {

                        response.dateExpired = true
                        resolve(response)
                    }
                }
            } else {
                console.log('Invalid coupon')
                response.invalid = true
                resolve(response)
            }
        })
    }





}