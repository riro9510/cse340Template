const accountModel = require("../models/account-model")

const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}

  validate.registationRules = () => {
    return [
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), 
  
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."),
  
      
      body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required.")
    .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        //console.log("Checking if email exists:", emailExists) // Debug log
        if (emailExists){
        throw new Error("Email exists. Please log in or use different email")
        }
    }),        
      
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

validate.loginRules = () => {
    return [
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required."),
  
      body("account_password")
        .trim()
        .notEmpty()
        .withMessage("Please provide a password."),
    ]
  }
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        // Check if email exists for other accounts (excluding current account)
        const emailExists = await accountModel.checkExistingEmail(account_email)
        //console.log("Checking email for update:", emailExists, "Current account:", req.body.account_id)
        if (emailExists && emailExists.account_id != req.body.account_id) {
          throw new Error("Email exists. Please use a different email")
        }
      })
  ]
}

validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements.")
  ]
}

validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData: {
        account_id: account_id,
        account_firstname: account_firstname,
        account_lastname: account_lastname,
        account_email: account_email
      },
      account_firstname: account_firstname,
      account_lastname: account_lastname,
      account_email: account_email
    })
    return
  }
  next()
}

validate.checkPasswordData = async (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(req.body.account_id)
    
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData: accountData
    })
    return
  }
  next()
}

module.exports = validate