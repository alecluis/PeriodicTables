const router = require("express").Router(); // Import Express router
const controller = require("./tables.controller"); // Import controller functions
const methodNotAllowed = require("../errors/methodNotAllowed"); // Import methodNotAllowed error handler

// Route for seating or finishing a table by its ID
router
  .route("/:table_id/seat")
  .put(controller.seatTable) // Seat the table with a reservation
  .delete(controller.finishTable) // Finish the table and clear its reservation
  .all(methodNotAllowed); // Handle all other HTTP methods with methodNotAllowed handler

// Route for creating a new table or listing all tables
router
  .route("/")
  .post(controller.create) // Create a new table
  .get(controller.list) // List all tables
  .all(methodNotAllowed); // Handle all other HTTP methods with methodNotAllowed handler

module.exports = router; // Export the router
