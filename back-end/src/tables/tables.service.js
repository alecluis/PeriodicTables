const knex = require("../db/connection"); 

// Function to list all tables
async function list() {
  return knex("tables").select("*").orderBy("table_name"); // Select all columns from the "tables" table and order them by table_name
}

// Function to read a table by its ID
function read(table_id) {
  return knex("tables").select("*").where({ table_id }).first(); // Select the table with the specified table_id
}

// Function to create a new table
function create(newTable) {
  return knex("tables")
    .insert(newTable, "*") // Insert the new table into the database and return all fields of the created record
    .then((createdRecords) => createdRecords[0]); // Return the first created record
}

// Function to seat a table with a reservation
function seatTable(reservation_id, table_id) {
  // Use a transaction to ensure atomicity of database operations
  return knex.transaction(function (trx) {
    return knex("tables")
      .where({ table_id: table_id })
      .update({ reservation_id }) // Update the table with the reservation ID
      .returning("*") // Return all fields of the updated table
      .then((updatedTable) => updatedTable[0]) // Extract the first updated table
      .then(() => {
        return trx("reservations")
          .where({ reservation_id })
          .update({ status: "seated" }); // Update the reservation status to "seated"
      });
  });
}

// Function to mark a table as finished and clear its reservation
function finishTable(table_id, reservation_id) {
  // Use a transaction to ensure atomicity of database operations
  return knex.transaction(function (trx) {
    return trx("tables")
      .where({ table_id: table_id })
      .update({ reservation_id: null }) // Clear the reservation from the table
      .then(() => {
        return trx("reservations")
          .where({ reservation_id })
          .update({ status: "finished" }); // Update the reservation status to "finished"
      });
  });
}

// Export all functions to be used in other parts of the application
module.exports = {
  list,
  read,
  create,
  finishTable,
  seatTable,
};
