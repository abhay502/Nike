var db = require('../config/connection')
var collection = require('../config/collection')
const { ObjectId } = require('mongodb')
const { response } = require('express')
module.exports = {


    totalSaleCod: () => {
        return new Promise(async (resolve, reject) => {
            let codTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { paymentMethod: 'cod' }
                },
                {
                    $project: { totalAmount: 1 }
                },
                {
                    $group: {
                        _id: null,
                        codTotal: { $sum: '$totalAmount' }
                    }
                },




            ]).toArray()
            // console.log(codTotal)
            resolve(codTotal)
        })
    },

    totalSaleRazorPay: () => {
        return new Promise(async (resolve, reject) => {
            let razorTotalSale = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { paymentMethod: 'razorpay' }
                },
                {
                    $project: { totalAmount: 1 }
                },
                {
                    $group: {
                        _id: null,
                        razortotal: { $sum: '$totalAmount' }
                    }
                },

            ]).toArray()
          
            resolve(razorTotalSale)
        })
    },

    findTotalCustomers: () => {
        return new Promise(async (resolve, reject) => {
            let totalCustomers = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $count: 'username'
                },

            ]).toArray()
           
            resolve(totalCustomers)
        })
    },
    getDailySalesReport:()=>{
        return new Promise (async(resolve,reject)=>{
            let dailySales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        'status':{$nin:['order-cancelled','pending','Return Approved','Return requested']}
                    }
                },
                {
                    $group:{
                        _id:'$date',
                        totalAmount:{$sum:'$totalAmount'} ,
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                },
                {
                    $limit:7
                },

            ]).toArray()
            console.log('Daily Sales');
            console.log(dailySales)
            resolve(dailySales)
    
        })
    },
    getMonthlySales:()=>{
        return new Promise(async(resolve, reject) => {
            let monthlySales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
               
                {
                    $match:{
                        'status':{$nin:['order-cancelled','pending','Return Approved','Return requested']}
                    }
                },
               
                
                {
                    $project:{
                        isoDate:{$dateFromString:{dateString:"$date"}},
                        totalAmount:1
                    }
                },
                {
                    $group: {
                        _id:{ $dateToString: { format: "%Y-%m", date: "$isoDate"} },
                        totalAmount: { $sum: "$totalAmount" },
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{_id:-1}
                }
               
            ]).toArray()
           
            resolve(monthlySales)
        })
    },
    getYearlySalesReport:()=>{
        return new Promise(async(resolve, reject) => {
            let yearlySales =await db.get().collection(collection.ORDER_COLLECTION).aggregate([
               
                {
                    $match:{
                        'status':{$nin:['order-cancelled','pending','Return Approved','Return requested']}
                    }
                },
                {
                    $project:{
                        isoDate:{$dateFromString:{dateString:"$date"}},
                        totalAmount:1
                    }
                },
                {
                    $group: {
                        _id:{ $dateToString: { format: "%Y", date: "$isoDate"} },
                        totalAmount: { $sum: "$totalAmount" },
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{_id:1}
                }
               
            ]).toArray()
           
            resolve(yearlySales)
        })
    },
    getDailySalesTotal:()=>{
        return new Promise (async(resolve,reject)=>{
            let dailySalesTotal=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        'status':{$nin:['order-cancelled','pending','Return Approved','Return requested']}
                    }
                },
                {
                    $group:{
                        _id:'$date',
                        totalAmount:{$sum:'$totalAmount'} ,
                        count:{$sum:1} 
                        
                    }
                },
                {
                    $sort:{
                        _id:1
                    }
                },
                {
                    $limit:7
                },
                {
                    $project:{
                        totalAmount:1,
                    }
                },{
                    $group:{
                        _id:null,
                        total:{$sum:'$totalAmount'}
                    }
                }
               
    
            ]).toArray()
          
            resolve(dailySalesTotal[0].total)
    
        })
    },

    getTotalSalesGraph:()=>{
        return new Promise (async(resolve,reject)=>{
            let dailySales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        'status':{$nin:['order-cancelled','pending','Return Approved','Return requested']}
                    }
                },
                {
                    $group:{
                        _id:'$date',
                        totalAmount:{$sum:'$totalAmount'} ,
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                },
                {
                    $limit:7
                },

            ]).toArray()


            let monthlySales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
               
                {
                    $match:{
                        'status':{$nin:['order-cancelled','pending','Return Approved','Return requested']}
                    }
                },
               
                
                {
                    $project:{
                        isoDate:{$dateFromString:{dateString:"$date"}},
                        totalAmount:1
                    }
                },
                {
                    $group: {
                        _id:{ $dateToString: { format: "%Y-%m", date: "$isoDate"} },
                        totalAmount: { $sum: "$totalAmount" },
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{_id:-1}
                }
               
            ]).toArray()

            let yearlySales =await db.get().collection(collection.ORDER_COLLECTION).aggregate([
               
                {
                    $match:{
                        'status':{$nin:['order-cancelled','pending','Return Approved','Return requested']}
                    }
                },
                {
                    $project:{
                        isoDate:{$dateFromString:{dateString:"$date"}},
                        totalAmount:1
                    }
                },
                {
                    $group: {
                        _id:{ $dateToString: { format: "%Y", date: "$isoDate"} },
                        totalAmount: { $sum: "$totalAmount" },
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{_id:1}
                }
               
            ]).toArray()
            resolve({dailySales,monthlySales,yearlySales})


            
            })
    },
    




}    