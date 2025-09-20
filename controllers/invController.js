const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)

    if (!data || data.length === 0) {
      throw new Error("No vehicles found for this classification")
    }
    
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (error) {
    console.error("Error in buildByClassificationId: ", error)
    next(error) // Pasa el error al middleware de manejo de errores
  }
}
invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const vehicle = await invModel.getInventoryById(inv_id)
    
    if (!vehicle) {
      let nav = await utilities.getNav()
      return res.status(404).render("./inventory/vehicle-detail", {
        title: "Vehicle Not Found",
        nav,
        vehicleHTML: '<p class="notice">Sorry, the requested vehicle could not be found.</p>'
      })
    }
    
    const vehicleHTML = utilities.buildVehicleDetailHTML(vehicle)
    let nav = await utilities.getNav()
    
    res.render("./inventory/vehicle-detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHTML: vehicleHTML
    })
  } catch (error) {
    console.error("Error in buildVehicleDetail: ", error)
    next(error)
  }
}

module.exports = invCont