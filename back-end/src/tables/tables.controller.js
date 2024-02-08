const service = require("./tables.service"); // Import the service functions for tables
const asyncErrorBoundary = require("../errors/asyncErrorBoundary"); // Import asyncErrorBoundary error handler
const hasProperties = require("../errors/hasProperties"); // Import hasProperties validation function
const reservationsService = require("../reservations/reservations.service"); // Import the service functions for reservations

// Middleware to check if a table exists by its ID
async function tableExists(req, res, next) {
  const table_id = req.params.table_id;
  const table = await service.read(table_id);
  if (table) {
    res.locals.table = table;
    next();
  } else {
    next({
      status: 404,
      message: `Table cannot be found. ${table_id}`,
    });
  }
}

// Middleware to check if a reservation ID exists
async function reservationIdExists(req, res, next) {
  const reservationId = req.body.data.reservation_id;
  const reservation = await reservationsService.read(reservationId);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  return next({
    status: 404,
    message: `${req.body.data.reservation_id} not found`,
  });
}

// Middleware to validate required properties for creating a table
const requiredProperties = hasProperties("table_name", "capacity");

// Array of valid properties for a table
const validProps = ["table_name", "capacity", "reservation_id"];

// Middleware to validate fields of a table
function validateFields(req, res, next) {
  const { data = {} } = req.body;
  const invalidFields = Object.keys(data).filter(
    (field) => !validProps.includes(field)
  );
  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

// Middleware to validate capacity as a number
function validateNumber(req, res, next) {
  const { data = {} } = req.body;
  if (data["capacity"] === 0 || !Number.isInteger(data["capacity"])) {
    return next({ status: 400, message: `Invalid number for capacity` });
  }
  next();
}

// Middleware to validate that table_name is at least two characters long
function validateSingleCharacter(req, res, next) {
  const { data = {} } = req.body;
  if (data["table_name"].length < 2) {
    return next({
      status: 400,
      message: `table_name needs to be more than one character`,
    });
  }
  next();
}

// Middleware to check if the table is already occupied
function occupiedTable(req, res, next) {
  const { people } = res.locals.reservation;
  const { reservation_id, capacity } = res.locals.table;
  if (reservation_id != null) {
    return next({
      status: 400,
      message: "Table is occupied",
    });
  }
  if (people > capacity) {
    return next({
      status: 400,
      message: "Reservation is greater than table capacity",
    });
  }
  next();
}

// Middleware to check if the table is already seated
function finishOccupiedTable(req, res, next) {
  const { reservation_id } = res.locals.table;
  if (reservation_id === null) {
    return next({
      status: 400,
      message: "Table is not occupied",
    });
  }
  next();
}

// Controller function to create a new table
async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

// Controller function to list all tables
async function list(req, res) {
  const data = await service.list();
  res.json({
    data,
  });
}

// Controller function to read a table by its ID
async function read(req, res) {
  res.status(200).json({ data: res.locals.table });
}

// Controller function to finish a table (clear its reservation)
async function finishTable(req, res, next) {
  const { table_id } = req.params;
  const { reservation_id } = res.locals.table;
  const data = await service.finishTable(table_id, reservation_id);
  res.status(200).json({ data });
}

// Middleware to check if the reservation is already seated
function isTableAlreadySeated(req, res, next) {
  const { status } = res.locals.reservation;
  if (status === "seated") {
    return next({
      status: 400,
      message: "Reservation is already seated.",
    });
  }
  next();
}

// Controller function to seat a table with a reservation
async function seatTable(req, res) {
  const { table_id } = req.params;
  const { reservation_id } = req.body.data;
  const data = await service.seatTable(reservation_id, table_id);
  res.status(200).json({ data });
}

// Export all middleware and controller functions
module.exports = {
  create: [
    requiredProperties,
    validateFields,
    validateNumber,
    validateSingleCharacter,
    asyncErrorBoundary(create),
  ],
  read: [tableExists, asyncErrorBoundary(read)],
  finishTable: [
    asyncErrorBoundary(tableExists),
    finishOccupiedTable,
    asyncErrorBoundary(finishTable),
  ],
  seatTable: [
    hasProperties("reservation_id"),
    asyncErrorBoundary(reservationIdExists),
    asyncErrorBoundary(tableExists),
    occupiedTable,
    isTableAlreadySeated,
    asyncErrorBoundary(seatTable),
  ],
  list: asyncErrorBoundary(list),
};
