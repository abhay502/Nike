

module.exports={

   verifyLogin:(req,res,next)=>{
        if (req.session.userLoggedin) {
          next()
        }else{
          res.redirect('/login')
        }
      }
    
}