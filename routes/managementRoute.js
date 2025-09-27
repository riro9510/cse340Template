const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const managementController = require("../controllers/managementController")

router.get("/", utilities.handleErrors(managementController.buildManagement))
router.get("/add-classification", utilities.handleErrors(managementController.buildAddClassification))
router.post("/add-classification", utilities.handleErrors(managementController.addClassification))
router.get("/add-inventory", utilities.handleErrors(managementController.buildAddInventory))
router.post("/add-inventory", utilities.handleErrors(managementController.addInventory))


module.exports = router