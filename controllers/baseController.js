const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("index", {
      title: "Home", 
      nav,
      errors: null,
    })
  } catch (error) {
    console.error("Error in buildHome: ", error)
    next(error) 
  }
}

module.exports = baseController