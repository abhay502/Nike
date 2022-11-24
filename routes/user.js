var express = require('express');
var router = express.Router();
let userController = require('../controller/userController');
let verifyLogin = (req, res, next) => {
  if (req.session.userLoggedin) {
    next()
  } else {
    res.redirect('/login')
  }
}


router.get('/', userController.homePage);

router.get('/products', userController.getProductpage)

router.post('/getProducts', userController.searchItem)

router.get('/cart', verifyLogin, userController.getCart)

router.get('/about', userController.getAbout)

router.get('/myaccount', verifyLogin, userController.myAccount)

router.get('/wishlist', verifyLogin, userController.Getwishlist)

router.get('/allproducts', userController.getCategory)

router.get('/login', userController.userLoginpage)

router.get('/userLogout', userController.getUserLogout)

router.get('/otp-loginpage', userController.OTPloginPage)

router.post('/signup', userController.postSignup)
 
router.post('/login', userController.postLogin)

router.post('/otp', userController.postOTP)

router.post('/otpverify', userController.postOTPVerify)

router.get('/quickview/:id', userController.quickviewProduct)

router.get('/edit-profile/:id', verifyLogin, userController.editProfile)

router.post('/submit-profile-edit/:id', verifyLogin, userController.postProfileEdit)

router.get('/add-to-cart/:id', verifyLogin, userController.addToCart)

router.get('/add-to-wishlist/:id', verifyLogin, userController.addToWishList)

router.post('/change-product-quantity', userController.changeProductQuantity)

router.post('/delete-cart-product', userController.deleteCartItem)

router.post('/remove-wishlist/:id', userController.removeWish)

router.post('/addresssubmit', userController.addAddresss)

router.get('/checkout', verifyLogin, userController.checkOut)

router.get('/remove-coupon/:id', verifyLogin, userController.removeCoupon)

router.post('/place-order', verifyLogin, userController.placeOrder)  //orderPlacing        

router.post('/couponSubmit', verifyLogin, userController.postCouponSubmit)

router.get('/orderplaced', verifyLogin, userController.orderedItems)

router.get('/myorders', verifyLogin, userController.myorders)

router.get('/cancel-item/:id', userController.cancelOrderedItem)

router.post('/verify-payment', userController.verifyPayment)

router.patch('/returnOrder', userController.returnOrder)


module.exports = router;
