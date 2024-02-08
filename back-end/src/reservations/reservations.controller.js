// Import necessary modules
const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

// Middleware to check if a reservation exists
async function validateReservationExists(req, res, next) {
  // Extract reservation_id from request parameters or request body
  const { reservation_id } = req.params || req.body.data;
  // Attempt to read the reservation from the service
  const reservation = await service.read(reservation_id);
  // If reservation exists, attach it to res.locals and move to next middleware
  if (reservation) {
    res.locals.reservation = reservation;
    next();
  } else {
    // If reservation does not exist, return 404 error
    next({
      status: 404,
      message: `Reservation not found. ${reservation_id}`,
    });
  }
}

// Middleware to check if request body has required properties
const requiredProperties = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
);

// Define an array of valid fields for the request body
const validFields = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
  "reservation_id",
  "created_at",
  "updated_at"
];

// Middleware to check if request body contains valid fields
function validateFields(req, res, next) {
  const { data = {} } = req.body;
  // Filter out invalid fields from request body
  const invalidFields = Object.keys(data).filter(
    (field) => !validFields.includes(field)
  );
  // If there are invalid fields, return 400 error
  if (invalidFields.length)
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  // Move to the next middleware if all fields are valid
  next();
}

// Middleware to check if the number of people is valid
function validateNumber(req, res, next) {
  const { data = {} } = req.body;
  // Check if the number of people is not 0 and is an integer
  if (data["people"] === 0 || !Number.isInteger(data["people"])) {
    return next({ status: 400, message: `Invalid number of people` });
  }
  next();
}

// Middleware to check if the reservation date is valid
function validateDate(req, res, next) {
  const { data = {} } = req.body;
  const reservation_date = new Date(data["reservation_date"]);
  const day = reservation_date.getUTCDay();
  // Check if the reservation_date is a valid date and not a Tuesday
  if (isNaN(Date.parse(data["reservation_date"]))) {
    return next({ status: 400, message: `Invalid reservation_date` });
  }
  if (day === 2) {
    return next({ status: 400, message: `Restaurant is closed on Tuesdays` });
  }
  // Check if the reservation_date is in the future
  if (reservation_date < new Date()) {
    return next({
      status: 400,
      message: `Reservation must be set in the future`,
    });
  }
  next();
}

// Middleware to check if the reservation time is valid
function validateTime(req, res, next) {
  const { data = {} } = req.body;
  // Regular expressions to validate reservation_time format
  if (
    /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(data["reservation_time"]) ||
    /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(
      data["reservation_time"]
    )
  ) {
    // Check if reservation_time is within restaurant operating hours
    if (data["reservation_time"] < "10:30") {
      return next({
        status: 400,
        message: "restaurant does not open until 10:30AM",
      });
    }
    if (data["reservation_time"] > "21:30") {
      return next({
        status: 400,
        message: "a reservation cannot be scheduled after 9:30PM",
      });
    }
    // Move to the next middleware if reservation_time is valid
    return next();
  }
  // Return error if reservation_time format is invalid
  next({ status: 400, message: `Invalid reservation_time` });
}

// Middleware to check reservation status
function checkStatus(req, res, next) {
  const { data } = req.body;
  // Check if reservation status is 'seated' or 'finished'
  if (data["status"] === "seated") {
    return next({ status: 400, message: `reservation is seated` });
  }
  if (data["status"] === "finished") {
    return next({ status: 400, message: `finished` });
  }
  // Move to the next middleware if status is valid
  next();
}

// Define valid reservation statuses
const validStatus = ["booked", "finished", "seated", "cancelled"];

// Middleware to check if reservation status is valid
function validateStatus(req, res, next) {
  const { status } = req.body.data;
  // Check if status is included in the validStatus array
  if (!validStatus.includes(status)) {
    return next({
      status: 400,
      message: `unknown`,
    });
  }
  next();
}

// Controller function to create a new reservation
async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

// Controller function to read a reservation
function read(req, res) {
  res.status(200).json({ data: res.locals.reservation });
}

// Controller function to update a reservation
async function update(req, res, next) {
  const updatedReservation = {
    ...req.body.data,
    reservation_id: req.params.reservation_id,
    status: req.body.data.status,
  };
  // Check if reservation status is 'finished'
  if (res.locals.reservation.status === "finished") {
    return next({
      status: 400,
      message: `cannot update a finished reservation`,
    });
  }
  const data = await service.update(updatedReservation);
  res.status(200).json({ data });
}

// Controller function to update reservation status
async function updateStatus(req, res, next) {
  const updatedStatus = {
    ...req.body.data,
    reservation_id: req.params.reservation_id,
    status: req.body.data.status,
  };
  // Check if reservation status is 'finished'
  if (res.locals.reservation.status === "finished") {
    return next({
      status: 400,
      message: `a finished reservation cannot be updated`,
    });
  }
  const data = await service.update(updatedStatus);
  res.status(200).json({ data });
}

// Controller function to delete a reservation
async function destroy(req, res) {
  const { reservation } = res.locals;
  await service.delete(reservation.reservation_id);
  res.sendStatus(204);
}

// Controller function to list reservations
async function list(req, res) {
  const { date, mobile_number } = req.query;
  const reservation = await (mobile_number
    ? service.search(mobile_number)
    : service.list(date));
  res.json({ data: reservation });
}

// Export all middleware and controller functions
module.exports = {
  create: [
    requiredProperties,
    validateFields,
    validateTime,
    validateDate,
    validateNumber,
    checkStatus,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(validateReservationExists), read],
  validateReservationExists: [validateReservationExists],
  update: [
    validateReservationExists,
    requiredProperties,
    validateFields,
    validateTime,
    validateDate,
    validateNumber,
    validateStatus,
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    validateReservationExists,
    validateFields,
    validateStatus,
    asyncErrorBoundary(updateStatus)],
  delete: [asyncErrorBoundary(validateReservationExists), asyncErrorBoundary(destroy)],
  list: asyncErrorBoundary(list),
};

