const utilities = require("../utilities")
const invModel = require("../models/inventory-model")
const validate = require("../utilities/classification-validation")

const managementController = {

  buildManagement: async function(req, res, next) {
  try {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList() 

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
      messages: req.flash()
    })
  } catch (error) {
    next(error)
  }
},



  buildAddClassification: async function(req, res, next) {
    try {
      let nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
        classification_name: '',
        messages: req.flash()
      })
    } catch (error) {
      next(error)
    }
  },

  addClassification: async function(req, res, next) {
    try {
      const { classification_name } = req.body
      let nav = await utilities.getNav()
      
      const errors = await validate.checkClassificationData(req.body)
      
      if (errors.length > 0) {
        req.flash('error', errors)
        return res.render("inventory/add-classification", {
          title: "Add New Classification",
          nav,
          errors,
          classification_name,
          messages: req.flash()
        })
      }
      
      const result = await invModel.addClassification(classification_name)
      
      if (result) {
        req.flash('success', 'Classification added successfully!')
        res.redirect("/inv/management")
      } else {
        throw new Error('Failed to add classification to database')
      }
    } catch (error) {
      next(error)
    }
  },

  buildAddInventory: async function(req, res, next) {
    try {
      let nav = await utilities.getNav()
      let classificationList = await utilities.buildClassificationList()
      
      res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: null,
        inv_make: '',
        inv_model: '',
        inv_year: '',
        inv_description: '',
        inv_image: '/images/vehicles/no-image.jpg',
        inv_thumbnail: '/images/vehicles/no-image-tn.jpg',
        inv_price: '',
        inv_miles: '',
        inv_color: '',
        messages: req.flash()
      })
    } catch (error) {
      next(error)
    }
  },

  addInventory: async function(req, res, next) {
    try {
      const inventoryData = req.body
      let nav = await utilities.getNav()
      let classificationList = await utilities.buildClassificationList(inventoryData.classification_id)
      
      const errors = validate.checkInventoryData(inventoryData)
      
      if (errors.length > 0) {
        req.flash('error', errors)
        return res.render("inventory/add-inventory", {
          title: "Add New Vehicle",
          nav,
          classificationList,
          errors,
          ...inventoryData,
          messages: req.flash()
        })
      }
      

      if (!inventoryData.inv_image) inventoryData.inv_image = '/images/vehicles/no-image.jpg'
      if (!inventoryData.inv_thumbnail) inventoryData.inv_thumbnail = '/images/vehicles/no-image-tn.jpg'
      
      const result = await invModel.addInventory(inventoryData)
      
      if (result) {
        req.flash('success', 'Vehicle added successfully!')
        res.redirect("/inv/management")
      } else {
        throw new Error('Failed to add vehicle to database')
      }
    } catch (error) {
      next(error)
    }
  }
}

module.exports = managementController