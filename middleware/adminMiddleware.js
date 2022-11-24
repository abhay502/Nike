module.exports={
  verifyAdmin:(req,res,next)=>{
        if (req.session.adminLoggedin) {
            return next()
        }else{
            res.redirect('/admin')   
        }

     }  
}