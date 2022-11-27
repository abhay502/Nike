var express = require('express');
var router = express.Router();
let admincontroller = require('../controller/adminController');
const { verifyAdmin } = require('../middleware/adminMiddleware');
const { upload } = require('../server/middleware/multer')
const { upload2 } = require('../server/middleware/multer')



//route section starts from here.. 
router.get('/', admincontroller.adminpanel)

router.post('/adminlogin', admincontroller.postLogin) 

router.get('/adminLogout', admincontroller.getLogout)

router.get('/usermanagement', verifyAdmin, admincontroller.getUsermanagementpage)

router.get('/productmanagement', verifyAdmin, admincontroller.productManagement)

router.get('/addproduct', verifyAdmin, admincontroller.getAddproduct)

router.get('/add-brand', verifyAdmin, admincontroller.getAddBrand)

router.post('/brandupload', upload2.array('image'), admincontroller.postUploadBrand)

router.post('/uploadproduct', upload.array('image'), admincontroller.postUploadproduct)

router.delete('/delete-product', admincontroller.deleteProduct)

router.delete('/delete-brand', admincontroller.deleteBrand)

router.patch('/block-user', admincontroller.blockUser)

router.patch('/unblock-user', admincontroller.unblockUser)

router.get('/editproduct/:id', verifyAdmin, admincontroller.getProductDetails)

router.get('/editbrand/:id', verifyAdmin, admincontroller.getBrandDetails)

router.patch('/update-stock', admincontroller.updateStock)

router.patch('/add-brand-offer', admincontroller.addBrandOffer)

router.get('/view-more/:id', verifyAdmin, admincontroller.getOrderDetails)

router.post('/edit-product/:id', upload.array('image'), admincontroller.postEditproduct)

router.post('/edit-brand/:id', upload2.array('image'), admincontroller.postEditBrand)

router.get('/ordermanagement', verifyAdmin, admincontroller.orderPage)

router.get('/couponmanagement', verifyAdmin, admincontroller.couponPage)

router.post('/addcoupon', verifyAdmin, admincontroller.postCoupon)

router.get('/allcoupons', verifyAdmin, admincontroller.allcoupons)

router.get('/delete-coupon/:id', verifyAdmin, admincontroller.deleteCoupon)

router.patch('/statuschange', verifyAdmin, admincontroller.statuschange)

router.get('/categorymanagement', verifyAdmin, admincontroller.categoryPage)

router.patch('/approveReturn', verifyAdmin, admincontroller.approveReturn)

router.get('/salesreport', verifyAdmin, admincontroller.salesreport)

module.exports = router;
