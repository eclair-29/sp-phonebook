/* eslint-disable no-console */

// Here is where I do my queries to the database.
// factory function, that holds an open connection to the db,
// and exposes some functions for accessing the data.
const mysql = require("promise-mysql");
const oracledb = require("oracledb");
const db = require("./db");

// oracledb test cmd
const oracleTest = async h => {
  // Establish connection
  const conn = await oracledb.getConnection(db);

  // Set response
  const res = await conn.execute(
    "SELECT * FROM employees WHERE employee_id = 100"
  );
  return h.response(res.rows);
};

// ------------------------------------------------------------------------------------------
//                                       Old processes
// ------------------------------------------------------------------------------------------

const createUser = async (request, h) => {
  try {
    const { fname, lname, username } = request.payload;

    // Check all required fields
    if (!fname || !lname || !username)
      return h.response({ msg: "Please enter all required fields." }).code(400);

    // Establish connection
    const conn = await mysql.createConnection(db);

    // Check for exsiting user
    const exist = await conn.query(
      `SELECT * FROM users WHERE username = "${username}"`
    );

    if (exist.length) {
      return h.response({ msg: `${username} is already taken.` }).code(400);
    }

    // Insert new user
    const user = await conn.query(`
      INSERT INTO users 
      SET fname = "${fname}", lname = "${lname}", username = "${username}"
    `);

    // Fetch the new inserted user
    const res = await conn.query(
      `SELECT * FROM users WHERE id = ${user.insertId}`
    );

    return h.response(res);
  } catch (error) {
    return console.log(`${error}`);
  }
};

const addPhoneNumbers = async (request, h) => {
  try {
    // Establish connection
    const conn = await mysql.createConnection(db);

    // Check if the user to add a phone number already exists
    const { id } = request.params;
    const user = await conn.query(`SELECT * FROM users WHERE id = "${id}"`);

    if (!user.length) {
      return h
        .response({ msg: `User with id ${id} does not exists.` })
        .code(400);
    }

    // Validate required fields
    const { number, typeId } = request.payload;

    if (!number || !typeId)
      return h.response({ msg: "Please enter all required fields." }).code(400);

    // Check if the user exceeds the maximum limit
    // for phone number insertion
    const phoneLimit = await conn.query(
      `SELECT * FROM phone_numbers WHERE user_id = ${id}`
    );

    if (phoneLimit.length > 2)
      return h
        .response({ msg: "You can't enter more than 3 phone numbers" })
        .code(400);

    // Add user phone number(s)
    const phone = await conn.query(`
      INSERT INTO phone_numbers
      SET number = "${number}", user_id = ${id}, type_id = ${typeId}
    `);

    // Fetch the new inserted number
    const res = await conn.query(
      `SELECT * FROM phone_numbers WHERE id = ${phone.insertId}`
    );

    // Update the user modification date
    await conn.query(`
      UPDATE users 
      SET date_modified = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `);

    return h.response(res);
  } catch (error) {
    return console.log(`${error}`);
  }
};

const searchPhonebook = async (request, h) => {
  try {
    const { q } = request.query;

    // Establish connection
    const conn = await mysql.createConnection(db);

    // Build response
    const sql = `
      SELECT 
        phone_numbers.id,
        phone_numbers.number as "phone_numbers",
        phone_types.type as "label",
        users.username as "username",
        CONCAT(users.fname, " ", users.lname) as "name"
      FROM phone_numbers
        INNER JOIN phone_types ON phone_numbers.type_id = phone_types.id
        INNER JOIN users ON phone_numbers.user_id = users.id
      WHERE 
        username LIKE "%${q}%" 
        OR fname LIKE "%${q}%"
        OR lname LIKE "%${q}%"
      ORDER BY phone_numbers.number
    `;

    // Check if a search query match a username
    const keyword = await conn.query(sql);

    if (!keyword.length)
      return h.response({ msg: `No found results for: '${q}'` }).code(400);

    return h.response(keyword);
  } catch (error) {
    return console.log(`${error}`);
  }
};

const fetchUser = async (request, h) => {
  try {
    const { id } = request.params;

    // Establish connection
    const conn = await mysql.createConnection(db);

    // Check if the user exists
    const user = await conn.query(`SELECT * FROM users WHERE id = ${id}`);

    if (!user.length) {
      return h.response({ msg: "User not found." }).code(400);
    }

    // Fetch also the user phone number(s)
    const phones = await conn.query(
      `SELECT
        phone_numbers.id,
        phone_numbers.number,
        phone_types.type as "label"
      FROM phone_numbers
        INNER JOIN phone_types ON phone_numbers.type_id = phone_types.id
        INNER JOIN users ON phone_numbers.user_id = users.id
      WHERE user_id = ${id}`
    );

    return h.response({ user, phones });
  } catch (error) {
    return console.log(`${error}`);
  }
};

const fetchPhonebook = async (request, h) => {
  try {
    // Establish connection
    const conn = await mysql.createConnection(db);

    // Build response
    const sql = `
      SELECT 
        phone_numbers.id,
        phone_numbers.number as "phone_numbers",
        phone_types.type as "label",
        users.username as "username",
        CONCAT(users.fname, " ", users.lname) as "name"
      FROM phone_numbers
        INNER JOIN phone_types ON phone_numbers.type_id = phone_types.id
        INNER JOIN users ON phone_numbers.user_id = users.id
      ORDER BY phone_numbers.number
    `;

    const phonebook = await conn.query(sql);

    return h.response(phonebook);
  } catch (error) {
    return console.log(`${error}`);
  }
};

const updateUser = async (request, h) => {
  try {
    const { username } = request.payload;
    const { id } = request.params;

    // Validate required fields
    if (!username)
      return h.response({ msg: "Please enter a username." }).code(400);

    // Establish connection
    const conn = await mysql.createConnection(db);

    // Check for exsiting username
    const exist = await conn.query(
      `SELECT * FROM users WHERE username = "${username}"`
    );

    if (exist.length) {
      return h.response({ msg: `${username} is already taken.` }).code(400);
    }

    // Update user data

    await conn.query(`
      UPDATE users 
      SET username = "${username}", date_modified = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `);

    // Fetch the updated user
    const res = await conn.query(`SELECT * FROM users WHERE id = ${id}`);

    return h.response(res);
  } catch (error) {
    return console.log(`${error}`);
  }
};

const updatePhoneNum = async (request, h) => {
  try {
    const { number, typeId } = request.payload;
    const { id, phoneId } = request.params;

    // Validate required fields
    if (!number || !typeId)
      return h.response({ msg: "Please enter all required fields." }).code(400);

    // Establish connection
    const conn = await mysql.createConnection(db);

    // Update user phone number(s)
    await conn.query(`
      UPDATE phone_numbers
      SET number = "${number}", user_id = ${id}, type_id = ${typeId}
      WHERE id = ${phoneId}
    `);

    // Fetch the new inserted number
    const res = await conn.query(
      `SELECT * FROM phone_numbers WHERE id = ${phoneId}`
    );

    // Update the user modification date
    await conn.query(`
      UPDATE users 
      SET date_modified = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `);

    return h.response(res);
  } catch (error) {
    return console.log(`${error}`);
  }
};

const deleteUser = async (request, h) => {
  try {
    const { id } = request.params;

    // Establish connection
    const conn = await mysql.createConnection(db);

    // Delete first all the user phone numbers
    await conn.query(`DELETE FROM phone_numbers WHERE user_id = ${id}`);

    // Then delete the user
    await conn.query(`DELETE FROM users WHERE id = ${id}`);

    return h.response({
      msg: `You've successfully deleted a record with id: ${id}`
    });
  } catch (error) {
    return console.log(`${error}`);
  }
};

module.exports = {
  oracleTest,
  createUser,
  addPhoneNumbers,
  fetchPhonebook,
  updateUser,
  updatePhoneNum,
  searchPhonebook,
  fetchUser,
  deleteUser
};
