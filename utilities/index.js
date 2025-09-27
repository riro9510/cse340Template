const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the vehicle detail view HTML
* ************************************ */
Util.buildVehicleDetailHTML = function(vehicle) {
  if (!vehicle) return '<p class="notice">Vehicle not found</p>'
  
  // Formatear precio y millaje
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(vehicle.inv_price)
  
  const formattedMiles = new Intl.NumberFormat('en-US').format(vehicle.inv_miles)
  
  return `
    <div class="vehicle-detail">
      <div class="vehicle-image-container">
        <img src="${vehicle.inv_image}" 
             alt="${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} - Full vehicle image" 
             class="vehicle-full-image">
      </div>
      
      <div class="vehicle-info">
        <h2 class="vehicle-title">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        
        <div class="price-mileage-section">
          <p class="price">${formattedPrice}</p>
          <p class="mileage">Mileage: ${formattedMiles} miles</p>
        </div>
        
        <div class="specifications">
          <div class="spec-item">
            <span class="spec-label">Year:</span>
            <span class="spec-value">${vehicle.inv_year}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Make:</span>
            <span class="spec-value">${vehicle.inv_make}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Model:</span>
            <span class="spec-value">${vehicle.inv_model}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Color:</span>
            <span class="spec-value">${vehicle.inv_color}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Classification:</span>
            <span class="spec-value">${vehicle.classification_name}</span>
          </div>
        </div>
        
        <div class="description-section">
          <h3 class="description-title">Vehicle Description</h3>
          <p class="description-text">${vehicle.inv_description}</p>
        </div>
      </div>
    </div>
  `
}

Util.buildClassificationList = async function(classification_id = null) {
    try {
      let data = await invModel.getClassifications()
      let classificationList = '<select name="classification_id" id="classificationList" class="form-input" required>'
      classificationList += "<option value=''>Choose a Classification</option>"
      
      data.rows.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"'
        if (classification_id != null && row.classification_id == classification_id) {
          classificationList += " selected "
        }
        classificationList += ">" + row.classification_name + "</option>"
      })
      classificationList += "</select>"
      return classificationList
    } catch (error) {
      console.error("Error building classification list: ", error)
      return '<select name="classification_id" id="classificationList" required><option value="">Error loading classifications</option></select>'
    }
  }

Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util