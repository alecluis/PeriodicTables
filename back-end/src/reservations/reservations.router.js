const router = require("express").Router(); // Import Express router
const methodNotAllowed = require("../errors/methodNotAllowed"); // Import methodNotAllowed error handler
const controller = require("./reservations.controller"); // Import controller functions

// Route for editing a specific reservation by ID
router
  .route("/:reservation_id/edit")
  .get(controller.read) // Read the reservation details
  .put(controller.update) // Update the reservation
  .all(methodNotAllowed); // Handle all other HTTP methods with methodNotAllowed handler

// Route for updating the status of a specific reservation by ID
router
  .route("/:reservation_id/status")
  .get(controller.read) // Read the reservation details
  .put(controller.updateStatus) // Update the reservation status
  .all(methodNotAllowed); // Handle all other HTTP methods with methodNotAllowed handler

// Route for getting or updating a specific reservation by ID
router
  .route("/:reservation_id")
  .get(controller.read) // Read the reservation details
  .put(controller.update) // Update the reservation
  .all(methodNotAllowed); // Handle all other HTTP methods with methodNotAllowed handler

// Route for creating a new reservation or listing all reservations
router
  .route("/")
  .post(controller.create) // Create a new reservation
  .get(controller.list) // List all reservations
  .all(methodNotAllowed); // Handle all other HTTP methods with methodNotAllowed handler

module.exports = router; // Export the router
