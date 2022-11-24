var  db=require('../config/connection')
var collection=require('../config/collection')
const { ObjectId } = require('mongodb')
const { response } = require('express')
module.exports={

    addAddresss:(address,userId)=>{
        return new Promise(async(resolve, reject) => {
            address.userId=ObjectId(userId)
         

            

               db.get().collection(collection.ADDRESS_COLLECTION).insertOne(address).then(()=>{
                resolve()
               }) 

           
        })
    },

    getUserAddress:(userId)=>{
      
    return new Promise((resolve, reject) => {
        let address=db.get().collection(collection.ADDRESS_COLLECTION).find({userId:ObjectId(userId)}).toArray()
            resolve(address)
     
       
    })



}
}