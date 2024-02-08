const knex = require("../db/connection");

// Function to list reservations for a specific date
function list(date) {
  return knex("reservations")
    .where("reservation_date", date)
    .whereNotIn("status", ["finished", "cancelled"]) // Exclude finished and cancelled reservations
    .orderBy("reservation_time"); // Order the reservations by reservation time
}

// Function to read a reservation by its ID
function read(reservation_id) {
  return knex("reservations").select("*").where({ reservation_id }).first();
}

// Function to create a new reservation
function create(newReservation) {
  return knex("reservations")
    .insert(newReservation, "*") // Insert the new reservation into the database and return all fields of the created record
    .then((createdRecords) => createdRecords[0]); // Return the first created record
}

// Function to update an existing reservation
function update(updatedReservation) {
  return knex("reservations")
    .where({ reservation_id: updatedReservation.reservation_id }) // Find the reservation by its ID
    .whereNot({ status: "finished" }) // Ensure the reservation is not finished before updating
    .update(updatedReservation, "*") // Update the reservation with the new data and return all fields of the updated record
    .then((updatedRecord) => updatedRecord[0]); // Return the first updated record
}

// Function to search for reservations by mobile number
function search(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    ) // Search for reservations with a mobile number matching the provided pattern
    .orderBy("reservation_date"); // Order the reservations by reservation date
}

// Function to delete a reservation by its ID
function destroy(reservation_Id) {
  return knex("reservations").where({ reservation_Id }).del(); // Delete the reservation with the specified ID
}

// Export all functions to be used in other parts of the application
module.exports = {
  list,
  read,
  create,
  update,
  search,
  delete: destroy, // Renaming the delete function to avoid conflict with reserved keyword
};