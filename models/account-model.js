const pool = require("../database/");

async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}
async function getAccountById(account_id) {
  try {
    const sql = "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1"
    const data = await pool.query(sql, [account_id])
    return data.rows[0]
  } catch (error) {
    console.error("Error getting account by ID:", error)
    return null
  }
}
async function updateAccountData(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("Error updating account data:", error)
    return false
  }
}

async function updateAccountPassword(account_id, account_password) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    const result = await pool.query(sql, [account_password, account_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("Error updating account password:", error)
    return false
  }
}

async function getAllEmployeesAndClients() {
  try {
    const sql = `SELECT account_id, account_firstname, account_lastname, 
                        account_email, account_type, is_staff 
                 FROM account 
                 WHERE account_type IN ('Employee', 'Client')
                 ORDER BY account_type, account_firstname`;
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    console.error("Error getting employees and clients:", error);
    return [];
  }
}

async function updateStaffStatus(account_id, is_staff) {
  try {
    const sql = `UPDATE account 
                 SET is_staff = $1 
                 WHERE account_id = $2`;
    const result = await pool.query(sql, [is_staff, account_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error updating staff status:", error);
    return false;
  }
}


async function updateAccountType(account_id, account_type) {
  try {
    const sql = `UPDATE account 
                 SET account_type = $1 
                 WHERE account_id = $2`;
    const result = await pool.query(sql, [account_type, account_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error updating account type:", error);
    return false;
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccountData, updateAccountPassword, getAllEmployeesAndClients, updateStaffStatus, updateAccountType }