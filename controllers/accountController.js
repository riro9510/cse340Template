const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcryptjs")
const utilities = require("../utilities/");
const accountModel = require("../models/account-model");

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  //console.log("📝 Starting registration for:", account_email)
  //console.log("🔑 Raw password received:", account_password ? 'exists' : 'missing')

  let hashedPassword
  try {
    //console.log("🔑 Starting password hash...")
    hashedPassword = await bcrypt.hash(account_password, 10)
    //console.log("✅ Password hashed successfully")
  } catch(error) {
    console.error("❌ Password hashing failed:", error)
    req.flash("notice", "Sorry, there was an error processing the registration.")
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
    return
  }

  //console.log("💾 Saving to database...")
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  //console.log("💾 Database result:", regResult ? 'success' : 'failure')

  if (regResult) {
    //console.log("✅ Registration successful!")
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    //console.log("❌ Registration failed")
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}
async function accountLogin(req, res) {
  //console.log("🔐 Login attempt for:", req.body.account_email)
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  
  //console.log("📧 Account found:", !!accountData)
  
  if (!accountData) {
    //console.log("❌ No account found")
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }

  // DEBUG: Verificar qué hay en account_password
  //console.log("🔍 Input password:", account_password.substring(0, 3) + '...')
  
  if (!accountData.account_password) {
    //console.log("❌ No password stored in database")
    req.flash("notice", "Account configuration error. Please contact support.")
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  
  try {
    //console.log("🔑 Starting password comparison...")
    const isPasswordValid = await bcrypt.compare(account_password, accountData.account_password)
    //console.log("🔑 Password comparison result:", isPasswordValid)
    
    if (isPasswordValid) {
      //console.log("✅ Login successful!")
      // Crear objeto sin la contraseña para el token
      const accountDataForToken = {
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_type: accountData.account_type
      }
      
      const accessToken = jwt.sign(accountDataForToken, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      //console.log("✅ JWT token created, redirecting to /account/")
      
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      
      return res.redirect("/account/")
    } else {
      //console.log("❌ Password comparison failed - incorrect password")
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("💥 Password comparison error:", error)
    console.error("💥 Error details:", {
      storedPwd: accountData.account_password ? 'exists' : 'missing',
      storedPwdType: typeof accountData.account_password,
      inputPwdType: typeof account_password
    })
    req.flash("notice", "Authentication error. Please try again or contact support.")
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
}
async function buildManagement(req, res, next) {
  try {
    let nav = await utilities.getNav()
    if (!res.locals.loggedin) {
      req.flash("notice", "Please log in to access your account.")
      return res.redirect("/account/login")
    }
    
    res.render("account/management", {
      title: "Account Management",
      nav,
      messages: req.flash(),
      accountData: res.locals.accountData
    })
  } catch (error) {
    console.error("Error rendering account management view:", error)
    req.flash('error', 'Unable to load account management page')
    let nav = await utilities.getNav()
    res.status(500).render("account/login", {
      title: "Login",
      nav,
    })
  }
}
async function logout(req, res) {
  try {
    res.clearCookie("jwt")
    
    let nav = await utilities.getNav()
    
    req.flash("notice", "You have been successfully logged out.")
    
    res.redirect("/")
  } catch (error) {
    console.error("Error during logout:", error)
    let nav = await utilities.getNav()
    req.flash("error", "There was an error during logout.")
    res.redirect("/")
  }
}


async function buildUpdateView(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const account_id = req.params.account_id
    
    if (res.locals.accountData.account_id != account_id) {
      req.flash("error", "You can only update your own account.")
      return res.redirect("/account/")
    }
    
    const accountData = await accountModel.getAccountById(account_id)
    
    if (!accountData) {
      req.flash("error", "Account not found.")
      return res.redirect("/account/")
    }
    
    res.render("account/update", {
      title: "Update Account",
      nav,
      messages: req.flash(),
      accountData: accountData
    })
  } catch (error) {
    console.error("Error rendering update view:", error)
    req.flash('error', 'Unable to load update page')
    res.redirect("/account/")
  }
}

async function updateAccount(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    
    if (res.locals.accountData.account_id != account_id) {
      req.flash("error", "You can only update your own account.")
      return res.redirect("/account/")
    }
    
    const updateResult = await accountModel.updateAccountData(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )
    
    if (updateResult) {
      const updatedAccount = await accountModel.getAccountById(account_id)
      req.flash("success", "Account updated successfully!")
      res.render("account/management", {
        title: "Account Management",
        nav,
        messages: req.flash(),
        accountData: updatedAccount
      })
    } else {
      req.flash("error", "Failed to update account. Please try again.")
      res.redirect("/account/update/" + account_id)
    }
  } catch (error) {
    console.error("Error updating account:", error)
    req.flash("error", "An error occurred while updating your account.")
    res.redirect("/account/update/" + req.body.account_id)
  }
}

async function updatePassword(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { account_id, account_password } = req.body

    if (res.locals.accountData.account_id != account_id) {
      req.flash("error", "You can only change your own password.")
      return res.redirect("/account/")
    }
    
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
      console.error("Password hashing error:", error)
      req.flash("error", "Error processing password.")
      return res.redirect("/account/update/" + account_id)
    }
    
    const updateResult = await accountModel.updateAccountPassword(
      account_id,
      hashedPassword
    )
    
    if (updateResult) {
      const updatedAccount = await accountModel.getAccountById(account_id)
      req.flash("success", "Password updated successfully!")
      res.render("account/management", {
        title: "Account Management",
        nav,
        messages: req.flash(),
        accountData: updatedAccount
      })
    } else {
      req.flash("error", "Failed to update password. Please try again.")
      res.redirect("/account/update/" + account_id)
    }
  } catch (error) {
    console.error("Error updating password:", error)
    req.flash("error", "An error occurred while updating your password.")
    res.redirect("/account/update/" + req.body.account_id)
  }
}
async function personnelManagement (req, res, next) {
    try {
        if (res.locals.accountData.account_type !== 'Admin') {
            req.flash('error', 'Unauthorized access');
            return res.redirect('/account');
        }

        const employees = await accountModel.getAllEmployeesAndClients();
        
        res.render('account/personnel', {
            title: 'Employee Management',
            employees: employees,
            nav: res.locals.nav,
            messages: req.flash()
        });
    } catch (error) {
        console.error('Error in personnelManagement:', error);
        next(error);
    }
}

async function toggleStaffStatus (req, res, next) {
    try {
        const { account_id, current_status } = req.body;
        
        if (res.locals.accountData.account_type !== 'Admin') {
            req.flash('error', 'Unauthorized action');
            return res.redirect('/account');
        }

        if (parseInt(account_id) === res.locals.accountData.account_id) {
            req.flash('error', 'Cannot modify your own staff status');
            return res.redirect('/account/personnel');
        }

        const newStatus = current_status === 'true' ? false : true;
        const success = await accountModel.updateStaffStatus(account_id, newStatus);
        
        if (success) {
            req.flash('success', 'Staff status updated successfully');
        } else {
            req.flash('error', 'Error updating staff status');
        }
        
        res.redirect('/account/personnel');
    } catch (error) {
        console.error('Error in toggleStaffStatus:', error);
        req.flash('error', 'Error updating staff status');
        res.redirect('/account/personnel');
    }
}

async function promoteToEmployee (req, res, next){
    try {
        const { account_id } = req.body;
        
        if (res.locals.accountData.account_type !== 'Admin') {
            req.flash('error', 'Unauthorized action');
            return res.redirect('/account');
        }

        const success = await accountModel.updateAccountType(account_id, 'Employee');
        
        if (success) {
            req.flash('success', 'Account promoted to Employee successfully');
        } else {
            req.flash('error', 'Error promoting account');
        }
        
        res.redirect('/account/personnel');
    } catch (error) {
        console.error('Error in promoteToEmployee:', error);
        req.flash('error', 'Error promoting account');
        res.redirect('/account/personnel');
    }
}

 async function promoteToClient (req, res, next){
    try {
        const { account_id } = req.body;
        
        if (res.locals.accountData.account_type !== 'Admin') {
            req.flash('error', 'Unauthorized action');
            return res.redirect('/account');
        }

        if (parseInt(account_id) === res.locals.accountData.account_id) {
            req.flash('error', 'Cannot modify your own account type');
            return res.redirect('/account/personnel');
        }

        const success = await accountModel.updateAccountType(account_id, 'Client');
        
        if (success) {
            req.flash('success', 'Account changed to Client successfully');
        } else {
            req.flash('error', 'Error changing account type');
        }
        
        res.redirect('/account/personnel');
    } catch (error) {
        console.error('Error in promoteToClient:', error);
        req.flash('error', 'Error changing account type');
        res.redirect('/account/personnel');
    }
}
module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, logout,buildUpdateView, updateAccount,updatePassword,personnelManagement,toggleStaffStatus,promoteToEmployee,promoteToClient }