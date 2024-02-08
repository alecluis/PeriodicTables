import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router";
import ErrorAlert from "../layout/ErrorAlert"; // Importing ErrorAlert component
import { listTables, seatTable } from "../utils/api"; // Importing API functions for fetching tables and seating reservations

function SeatTable() {
  const history = useHistory(); // Initializing useHistory hook for navigation
  const { reservation_id } = useParams(); // Extracting reservation_id parameter from URL
  const resId = Number(reservation_id); // Converting reservation_id to number
  const [tableId, setTableId] = useState(""); // State variable for selected table ID
  const [updateTableError, setUpdateTableError] = useState(null); // State variable for update table error
  const [tables, setTables] = useState([]); // State variable for tables

  // Load tables when component mounts or reservation_id changes
  useEffect(() => {
    const abortController = new AbortController(); // Creating an abort controller for cancelling fetch requests
    setUpdateTableError(null); // Resetting update table error
    listTables(abortController.signal) // Fetching tables from the API
      .then(setTables) // Setting tables state
      .catch(setUpdateTableError); // Handling errors
    return () => abortController.abort(); // Cleanup function to cancel fetch requests
  }, [resId]);

  // Map tables to option elements for dropdown
  const rows = tables.map((table) => {
    return (
      <option key={table.table_id} value={table.table_id}>
        {table.table_name} - {table.capacity}
      </option>
    );
  });

  // Event handler for changing selected table
  const changeHandler = ({ target }) => {
    setTableId(Number(target.value)); // Converting selected table ID to number
  };

  // Event handler for form submission
  const submitHandler = (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    const abortController = new AbortController(); // Creating an abort controller for cancelling fetch requests

    setUpdateTableError(null); // Resetting update table error
    seatTable(reservation_id, tableId, abortController.signal) // Seating reservation using API
      .then(() => {
        history.push("/dashboard"); // Redirecting to the dashboard after successful seating
      })
      .catch(setUpdateTableError); // Handling errors
    return () => abortController.abort(); // Cleanup function to cancel fetch requests
  };

  // JSX returned by the component
  return (
    <div>
      <div>Seat Reservation</div>
      <ErrorAlert error={updateTableError} /> {/* Display ErrorAlert component if there is an error */}
      <form onSubmit={submitHandler}>
        <div className="form-row align-items-center">
          <div className="col-auto my-1">
            {/* Dropdown for selecting a table */}
            <select
              className="custom-select mr-sm-2"
              required
              name="table_id"
              onChange={changeHandler}
            >
              <option defaultValue={0}>Choose...</option>
              {rows}
            </select>
          </div>
          <div className="col-auto my-1">
            {/* Submit button for seating reservation */}
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            {/* Button for cancelling the operation and going back */}
            <button
              type="button"
              className="btn btn-danger"
              onClick={history.goBack}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SeatTable; // Exporting the SeatTable component
