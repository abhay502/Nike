var productHelper = require('../helpers/producthelpers')
var otpconfig = require('../config/optconfig')
const { response } = require('express')
var express = require('express');

let session = require('express-session')
const userhelper = require('../helpers/userhelper')
const addresshelper = require('../helpers/addresshelper')
const nocache = require('nocache');
const { Client } = require('twilio/lib/twiml/VoiceResponse');

const { Db } = require('mongodb');
require('dotenv').config()



let YOUR_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
let YOUR_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
let YOUR_SERVICE_ID = process.env.TWILIO_SERVICE_ID
const client = require("twilio")(YOUR_ACCOUNT_SID, YOUR_AUTH_TOKEN);


const homePage = async (req, res) => {
  let user = req.session.user
  let cartCount = null

  if (user) {
    cartCount = await userhelper.getCartCount(user._id)
  }



  productHelper.getAllProducts().then((product) => {


    res.render('user/index', { cartCount, userheader: true, product, user: req.session.user, usernamewhenotp: req.session.username })
  })
}

const getProductpage = (req, res) => {

  productHelper.getAllProducts().then((product) => {
    res.render('user/product', { product, user: req.session.user, userheader: true })
  })


}
const searchItem = async (req, res) => {
  let payload = req.body.payload.trim()

  let result = await productHelper.findSearch(payload)


  res.send({ payload: result })
}


let getCart = async (req, res) => {

  let user = req.session.user
  let cartCount = null

  if (user) {
    cartCount = await userhelper.getCartCount(user._id)
  }



  if (cartCount != 0) {

    let totalPrice = await userhelper.getTotalAmount(user._id)
    let products = await userhelper.getCartProducts(user)


    res.render('user/cart', { totalPrice, cartEmpty: req.session.cartEmpty, cartCount, products, user: req.session.user, userheader: true })
  } else {
    res.render('user/cart', { cartEmpty: req.session.cartEmpty, cartCount, user: req.session.user, userheader: true })
  }



}
const Getwishlist = async (req, res) => {
  let user = req.session.user
  if (user) {
    cartCount = await userhelper.getCartCount(user._id)
  }

  let products = await userhelper.getWishproducts(user._id)

  res.render('user/wishlist', { products, user: req.session.user, cartCount, userheader: true })



}

const removeWish = (req, res) => {

  let itemId = req.params.id
  let user = req.session.user
  userhelper.removeWishItem(itemId, user._id).then(() => {
    res.json({ status: true })
  })
}

const getAbout = (req, res) => {
  res.render('user/about', { user: req.session.user, userheader: true })
}
const myAccount = async (req, res) => {
  let user = req.session.user
  if (user) {
    cartCount = await userhelper.getCartCount(user._id)
  }
  res.render('user/myaccount', { cartCount, user: req.session.user, userheader: true })
}
const getCategory = async (req, res) => {

  let user = req.session.user
  let cartCount = null

  if (user) {
    cartCount = await userhelper.getCartCount(user._id)
  }



  productHelper.getAllProducts().then((product) => {
  
    res.render('user/allproductspage', { cartCount, product, user: req.session.user, userheader: true })
  })

}

const userLoginpage = (req, res) => {
  if (req.session.userLoggedin) {
    res.redirect('/')
  } else {
    res.render('user/userLogin', { userBlocked: req.session.userBlocked, userLoginerror: req.session.userLoginerror, userEmailexist: req.session.userEmailexist })
    req.session.userEmailexist = false
    req.session.userLoginerror = false
    req.session.userBlocked = false
  }
}

const checkOut = async (req, res) => {
  user = req.session.user
  if (user) {
    cartCount = await userhelper.getCartCount(user._id)
    totalPrice = await userhelper.getTotalAmount(user._id)
    subtotal = totalPrice[0].subtotal
    finalAmount = totalPrice[0].subtotal

    let cart = await userhelper.checkCoupon(user._id)

    let coupon = await userhelper.checkCouponExist(cart.coupon)



    if (cart.coupon) {
      let discount = finalAmount / 100 * parseInt(coupon.discount)
      finalAmount = parseInt(finalAmount - discount)

    }
    discountedPrice = subtotal - finalAmount
    couponname = cart.coupon

  }
  let address = await addresshelper.getUserAddress(user._id)

  let products = await userhelper.getCartProducts(user)
  res.render('user/checkout', { couponname, address, user: req.session.user, finalAmount, subtotal, discountedPrice, cartCount, products, userheader: true, })

}

const removeCoupon = (req, res) => {

  let coupon = req.params.id
  let userId = req.session.user._id



  userhelper.removeCoupon(userId, coupon)
  res.redirect('/checkout')


}

const postSignup = (req, res) => {
  userhelper.doSignup(req.body).then((response) => {
    if (response.userExist) {
      req.session.userEmailexist = true;
      res.redirect('/login')
    } else {

      res.redirect('/login')
    }
  })
}

const postCouponSubmit = (req, res) => {

  let user = req.session.user

  productHelper.findCoupon(req.body.coupon, user).then(async (response) => {
    if (response.a) {

      let totalPrice = await userhelper.getTotalAmount(user._id)

      let discount = totalPrice[0].subtotal * parseInt(response.a.discount) / 100


      let amount = totalPrice[0].subtotal - discount



      response.couponname = response.a.coupon

      response.discountedprice = totalPrice[0].subtotal - amount
      response.finalAmount = amount
      res.json(response)

    } else {
      res.json(response)
    }



  })
}


const postLogin = (req, res) => {
  userhelper.doLogin(req.body).then((response) => {

    if (response.userBlocked) {

      req.session.userBlocked = true
      res.redirect('/login')
    }

    else if (response.status) {
      req.session.userLoggedin = true
      req.session.user = response.user
      req.session.userDetails = response.user


      res.redirect('/')
    } else {
      req.session.userLoginerror = true
      res.redirect('/login')
    }
  })
}

const getUserLogout = (req, res) => {
  req.session.userLoggedin = null
  req.session.user = null
  req.session.usernamewhenotp = null
  res.redirect('/')
}

const OTPloginPage = (req, res) => {
  if (req.session.userLoggedin) {
    res.redirect('/')
  }

  else if (req.session.usernumberproved) {



    client.verify.services(YOUR_SERVICE_ID)
      .verifications.create({

        to: `+91${req.session.number}`,
        channel: "sms"
      })

    res.render('user/otp-verifypage', { number: req.session.number, otpinvalid: req.session.invalidotp })
    req.session.invalidotp = false
  } else {

    res.render('user/otp-loginpage', { mobnumbernotexist: req.session.mobnumbernotexist })
    req.session.mobnumbernotexist = false
  }

}

const postOTP = (req, res) => {
  userhelper.otpSend(req.body).then((response) => {
    if (response.mobnumber) {

      req.session.number = response.mobnumber.phonenumber
      req.session.usernumberproved = true


      req.session.user = response.mobnumber.username


      res.redirect('/otp-loginpage')
    } else {

      req.session.mobnumbernotexist = true
      res.redirect('/otp-loginpage')
    }
  })
}

const postOTPVerify = async (req, res) => {
  let otp = req.body.otpnumber

  let userDetails = await userhelper.findUserByPhoneNumber(req.session.number)


  client.verify.services(YOUR_SERVICE_ID)
    .verificationChecks.create({
      to: `+91${req.session.number}`,
      code: otp

    }).then((response) => {

      if (response.valid) {

        req.session.user = userDetails

        req.session.userLoggedin = true

        res.redirect('/')
      } else {
        req.session.invalidotp = true
        res.redirect('/otp-loginpage')
      }
    })
}

const quickviewProduct = async (req, res) => {
  let user = req.session.user
  let cartCount = null

  if (user) {
    cartCount = await userhelper.getCartCount(user._id)
  }

  productHelper.quickViewProducts(req.params.id).then((product) => {

    productHelper.getAllProducts().then((products) => {

      res.render('user/quickView', { cartCount, product, products, user: req.session.user, userheader: true })
    })
  })
}

const editProfile = async (req, res) => {
  let userId = req.params.id

  let user = req.session.user
  if (user) {
    cartCount = await userhelper.getCartCount(user._id)
  }

  let userEditDetails = await userhelper.getUserDetails(userId)




  res.render('user/editprofile', { userEditDetails, cartCount, user, userheader: true })





}

const postProfileEdit = (req, res) => {

  let userId = req.params.id
  let updatedDetails = req.body


  userhelper.updateUserDetails(userId, updatedDetails).then(() => {
    res.redirect('/userLogout')

  })

}

const addToCart = (req, res) => {


  let proId = req.params.id
  let user = req.session.user

  if (user) {
    userhelper.addToCart(proId, user).then((response) => {

      userhelper.removeWishItem(proId, user._id).then((response) => {

        res.json({ status: true })
      })





    })

  } else {
    res.json({ status: false })
  }

}


const addToWishList = (req, res) => {
  let proId = req.params.id
  let user = req.session.user


  userhelper.addWishProduct(proId, user).then((response) => {

    res.json(response)




  })
}





const changeProductQuantity = (req, res, next) => {
  userhelper.changeProductQuantity(req.body).then(async (response) => {

    response.totalPrice = await userhelper.getTotalAmount(req.body.user)
    response.products = await userhelper.getCartProducts(req.body.user)


    res.json(response)
  })
}

const deleteCartItem = (req, res) => {
  userhelper.deleteCartItem(req.body).then(() => {
    res.json({ status: true })
  })
}

const addAddresss = async (req, res) => {

  let AddressDetails = req.body
  let user = req.session.user


  await addresshelper.addAddresss(AddressDetails, user._id).then(() => {
    res.redirect('/')
  })
}





const placeOrder = async (req, res) => {


  let products = await userhelper.getCartProductList(req.body.userId)
  let totalPrice = await userhelper.getTotalAmount(req.body.userId)



  let finalAmount = totalPrice[0].subtotal

  let cart = await userhelper.checkCoupon(req.body.userId)

  let coupon = await userhelper.checkCouponExist(cart.coupon)



  if (cart.coupon) {
    let discount = finalAmount / 100 * parseInt(coupon.discount)
    finalAmount = parseInt(finalAmount - discount)
  }





  userhelper.placeOrder(req.body, products, finalAmount).then((orderId) => {
    if (req.body['payment-method'] === 'cod') {
      res.json({ codSuccess: true })
    } else {

      userhelper.generateRazorpay(orderId, finalAmount).then((response) => {
        res.json(response)

      })
    }

  })


}

const orderedItems = (req, res) => {

  let user = req.session.user


  res.render('user/orderplaced', { user, cartCount, userheader: true })
}

const myorders = async (req, res) => {
  let user = req.session.user
  let cartCount = null

  if (user) {
    cartCount = await userhelper.getCartCount(user._id)
  }

  let ordereDetails = await productHelper.getOrderDetails(user)



  res.render('user/myorders', { ordereDetails, user: req.session.user, cartCount, userheader: true })
}



const cancelOrderedItem = (req, res) => {

  let orderId = req.params.id
  let user = req.session.user


  productHelper.cancelOrderedItem(orderId, user._id).then((productCancelled) => {


    productHelper.incrementStockAfterCancel(productCancelled[0].item, productCancelled[0].quantity)

    res.redirect('/myorders')
  })
}
const verifyPayment = (req, res) => {

  userhelper.verifyPayment(req.body).then(() => {
    userhelper.changePaymentStatus(req.body['order[receipt]']).then(() => {

      res.json({ status: true })
    })
  }).catch((err) => {

    res.json({ status: false })
  })
}

const returnOrder = (req, res) => {

  userhelper.returnOrder(req.body).then(() => {
    res.json({ status: true })
  })


}



module.exports = {
  homePage, getProductpage, getCart, getAbout, myAccount, userLoginpage, getCategory, checkOut, postSignup, postLogin, getUserLogout, OTPloginPage,
  postOTP, postOTPVerify, quickviewProduct, Getwishlist, addToCart, addToWishList, removeWish, addAddresss, changeProductQuantity, deleteCartItem, orderedItems, myorders, placeOrder, cancelOrderedItem,
  postCouponSubmit, editProfile, postProfileEdit, removeCoupon, searchItem, verifyPayment, returnOrder

}