const { response, request } = require('express');
var express = require('express');

var session = require('express-session')
var productHelper = require('../helpers/producthelpers');
const userhelper = require('../helpers/userhelper');
const charthelper = require('../helpers/charthelper')
var objectId = require('mongodb').ObjectId


const adminpanel = async (req, res, next) => {

  if (req.session.adminLoggedin) {

    let codTotalSale = await charthelper.totalSaleCod()
    let razorPayTotalSale = await charthelper.totalSaleRazorPay()
    let totalRevenue = razorPayTotalSale[0].razortotal + codTotalSale[0].codTotal

    let getTotalSalesGraph = await charthelper.getTotalSalesGraph()





    let totalCustomers = await charthelper.findTotalCustomers()

    res.render('admin/adminpanel', { getTotalSalesGraph, codTotalSale, razorPayTotalSale, totalRevenue, totalCustomers, admin: req.session.adminLoggedin })
  } else {

    res.render('admin/adminloginpage', { adminError: req.session.adminError, adminLogoutmsg: req.session.adminLogoutmsg })
    req.session.adminError = false
    req.session.adminLogoutmsg = false
  }

}

const postLogin = (req, res) => {                                                       //admin login section

  let admincredentials = { email: 'admin@gmail.com', password: 'admin123321' }

  if (admincredentials.email == req.body.email && admincredentials.password == req.body.password) {

    req.session.adminLoggedin = true;     
    req.session.admin = true;
    res.redirect('/admin')
  } else {
    req.session.adminError = true
    req.session.admin = false
    res.redirect('/admin')
  } 
} 

const getLogout = (req, res) => {
  req.session.adminLoggedin = ''
  req.session.adminError = ''
  req.session.adminLogoutmsg = true;
  req.session.admin = false
  res.redirect('/admin')
}

const getUsermanagementpage = (req, res) => {
  userhelper.getAllusers().then((user) => {
    res.render('admin/usermanagementpage', { admin: req.session.adminLoggedin, user, userBlocked: req.session.userBlocked })
  })
}

const orderPage = (req, res) => {
  userhelper.getAllOrders().then((orders) => {


    res.render('admin/orderpage', { orders, admin: req.session.admin })

  })


}
const couponPage = (req, res) => {
  res.render("admin/couponManagement", { admin: req.session.admin })
}
const postCoupon = (req, res) => {

  productHelper.addCoupon(req.body).then((insertedId) => {

    // console.log(insertedId);
    res.redirect('/admin/allcoupons')

  })
}
const allcoupons = (req, res) => {

  productHelper.getAllCoupons().then((coupons) => {

    res.render('admin/allcoupons', { admin: req.session.admin, coupons })
  })

}
const deleteCoupon = (req, res) => {

  productHelper.deleteCoupon(req.params.id)
  res.redirect('/admin/allcoupons')

}

const statuschange = async (req, res) => {

  userhelper.changeOrderStatus(req.body).then(() => {
    res.json({ status: true })
  })



}

const categoryPage = (req, res) => {
  productHelper.getAllBrands().then((brands) => {

    res.render('admin/categorypage', { admin: req.session.admin, brands })

  })


}
const salesreport = async (req, res) => {
  let DailySalesReport = await charthelper.getDailySalesReport()
  let MonthlySalesReport = await charthelper.getMonthlySales()
  let YearlySalesReport = await charthelper.getYearlySalesReport()
  let getDailySalesTotal = await charthelper.getDailySalesTotal()


  res.render('admin/salesreport', { DailySalesReport, MonthlySalesReport, YearlySalesReport, getDailySalesTotal, admin: req.session.admin })

}
const productManagement = (req, res) => {
  productHelper.getAllProducts().then((product) => {

    res.render('admin/product', { admin: req.session.admin, product })
  })
}

const getAddproduct = (req, res) => {

  productHelper.getAllBrands().then((brands) => {
    res.render('admin/form', { admin: req.session.admin, brands })
  })

}

const getAddBrand = (req, res) => {

  res.render('admin/addbrandform', { admin: req.session.admin })

}






const postUploadproduct = (req, res) => {


  if (req.session.adminLoggedin) {


    const files = req.files
    const file = files.map((file) => {
      return file
    })
    const fileName = file.map((file) => {
      return file.filename
    })
    const product = req.body
    product.img = fileName


    productHelper.addProduct(product).then((data) => {


      res.redirect('/admin/productmanagement')




    })
  } else {
    res.redirect('/admin')
  }
}

const postUploadBrand = (req, res) => {



  if (req.session.adminLoggedin) {

    const files = req.files
    const file = files.map((file) => {
      return file
    })
    const fileName = file.map((file) => {
      return file.filename
    })
    const product = req.body
    product.img = fileName

    productHelper.addBrand(product).then((data) => {


      res.redirect('/admin/categorymanagement')
    })


  } else {
    res.redirect('/admin')
  }
}


const deleteProduct = (req, res) => {
  let proId = req.query.productId
  productHelper.deleteProduct(proId).then((data) => {

    res.json({ status: true })
  })

}

const deleteBrand = (req, res) => {
  let braId = req.query.brandId
  productHelper.deleteBrand(braId).then(() => {
    res.json({ status: true })
  })
}

const blockUser = (req, res) => {
  let userId = req.query.userId
  userhelper.blockUser(userId).then((data) => {


    res.json({ status: true })

  })
}

const unblockUser = (req, res) => {
  let userId = req.query.userId
  userhelper.unblockUser(userId).then((data) => {



    res.json({ status: true })

  })
}

const getProductDetails = async (req, res) => {
  let productDetails = await productHelper.getProductDetails(req.params.id)
  productHelper.getAllBrands().then((brands) => {
    res.render('admin/edit-productpage', { admin: req.session.admin, productDetails, brands })
  })

}

const getBrandDetails = async (req, res) => {
  let brandDetails = await productHelper.getBrandDetails(req.params.id)


  res.render('admin/edit-brand', { admin: req.session.admin, brandDetails })
}
const updateStock = (req, res) => {

  let proId = req.body.proID
  let stock = req.body.stock
  productHelper.updateStock(proId, stock).then(() => {
    res.json({ status: true })

  })
}
const addBrandOffer = (req, res) => {
  productHelper.addBrandOffer(req.body).then(() => {
    res.json({ status: true })
  })


}



const getOrderDetails = async (req, res) => {

  let orderDetails = await productHelper.viewMore(req.params.id)

  res.render('admin/viewmoreorderdetails', { orderDetails, admin: req.session.admin })
}

const postEditproduct = (req, res) => {
  let id = req.params.id


  const files = req.files
  const file = files.map((file) => {
    return file
  })
  const fileName = file.map((file) => {
    return file.filename
  })
  const product = req.body
  product.img = fileName

  productHelper.updateProduct(id, product).then(() => {

    res.redirect('/admin/productmanagement')

  })
}
const postEditBrand = (req, res) => {
  let brandId = req.params.id

  const files = req.files
  const file = files.map((file) => {
    return file
  })
  const fileName = file.map((file) => {
    return file.filename
  })
  const brand = req.body
  brand.img = fileName

  productHelper.updateBrand(brandId, brand).then(() => {
    res.redirect('/admin/categorymanagement')
  })


}

const approveReturn = (req, res) => {

  userhelper.approveReturn(req.body.orderId)
  res.json({ status: true })

}



module.exports = {

  adminpanel, postLogin, getLogout, getUsermanagementpage,
  productManagement, getAddproduct, postUploadproduct, deleteProduct, blockUser, unblockUser,
  getProductDetails, postEditproduct, orderPage, getOrderDetails, categoryPage, getAddBrand, postUploadBrand, getBrandDetails, postEditBrand,
  deleteBrand, statuschange, updateStock, couponPage, postCoupon, allcoupons, approveReturn, salesreport, addBrandOffer, deleteCoupon


}