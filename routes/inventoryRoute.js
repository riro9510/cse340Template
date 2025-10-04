const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

router.get("/detail/:inv_id", utilities.handleErrors(invController.buildVehicleDetail));

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

router.get("/edit/:inventory_id", utilities.handleErrors(invController.editInventoryItem));

router.post("/update/", utilities.handleErrors(invController.updateInventory))

router.get("/delete/:inv_id", utilities.handleErrors(invController.deleteInventoryView));

router.post("/delete/", utilities.handleErrors(invController.deleteInventory))
module.exports = router;
