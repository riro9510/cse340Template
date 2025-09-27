const invModel = require("../models/inventory-model")

const validate = {
  checkClassificationData: async function(classificationData) {
    const { classification_name } = classificationData
    const errors = []

    if (!classification_name || classification_name.trim() === '') {
      errors.push('Classification name is required')
    }

    if (classification_name && classification_name.length < 2) {
      errors.push('Classification name must be at least 2 characters long')
    }

    const regex = /^[a-zA-Z0-9]+$/
    if (classification_name && !regex.test(classification_name)) {
      errors.push('Classification name cannot contain spaces or special characters')
    }

    if (classification_name) {
      const exists = await invModel.checkClassificationExists(classification_name)
      if (exists) {
        errors.push('Classification name already exists')
      }
    }

    return errors
  },

  checkInventoryData: function(inventoryData) {
    const errors = []
    const {
      inv_make, inv_model, inv_year, inv_description,
      inv_price, inv_miles, inv_color, classification_id
    } = inventoryData

    if (!inv_make || inv_make.trim() === '') errors.push('Make is required')
    if (!inv_model || inv_model.trim() === '') errors.push('Model is required')
    if (!inv_year || inv_year.trim() === '') errors.push('Year is required')
    if (!inv_description || inv_description.trim() === '') errors.push('Description is required')
    if (!inv_price || inv_price <= 0) errors.push('Valid price is required')
    if (!inv_miles || inv_miles < 0) errors.push('Valid mileage is required')
    if (!inv_color || inv_color.trim() === '') errors.push('Color is required')
    if (!classification_id) errors.push('Classification is required')

    if (inv_make && inv_make.length < 2) errors.push('Make must be at least 2 characters long')
    if (inv_model && inv_model.length < 2) errors.push('Model must be at least 2 characters long')
    

    const currentYear = new Date().getFullYear()
    if (inv_year && (inv_year.length !== 4 || inv_year < 1900 || inv_year > currentYear + 1)) {
      errors.push('Please enter a valid year')
    }

    return errors
  }
}

module.exports = validate