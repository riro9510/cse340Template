const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get("/logout", utilities.handleErrors(accountController.logout))
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateView))

router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)
router.get("/management", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

router.post("/update", utilities.checkLogin, utilities.handleErrors(accountController.updateAccount))
router.post("/update-password", utilities.checkLogin, utilities.handleErrors(accountController.updatePassword))
module.exports = router;
