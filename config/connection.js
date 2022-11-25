const mongoClient=require('mongodb').MongoClient
const state={db:null}

module.exports.connect=(done)=>{
    const url='mongodb+srv://abhay:a7YEibMRAtXY3xmR@cluster0.ne3vr55.mongodb.net/test'
    const dbname='shoppingcart'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
    
}
module.exports.get=function(){
    return state.db
}