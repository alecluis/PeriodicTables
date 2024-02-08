import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { listReservations, listTables } from "../utils/api"; // Import API functions for fetching reservations and tables
import { next, previous, today } from "../utils/date-time"; // Import utility functions for manipulating dates
import ErrorAlert from "../layout/ErrorAlert"; // Import ErrorAlert component
import Reservations from "./Reservations"; // Import Reservations component
import Tables from "./Tables"; // Import Tables component

/**
 * Defines the dashboard page.
 * @param date the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const history = useHistory(); // Get access to the history object to navigate programmatically
  const [reservations, setReservations] = useState([]); // State to store reservations
  const [reservationsError, setReservationsError] = useState(null); // State to handle errors related to reservations
  const [tables, setTables] = useState([]); // State to store tables
  const [tablesError, setTablesError] = useState(null); // State to handle errors related to tables

  // Load dashboard data when component mounts or when the date changes
  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController(); // Create an AbortController to handle cleanup
    setReservationsError(null); // Clear any previous reservation errors
    // Fetch reservations for the specified date
    listReservations({ date }, abortController.signal)
      .then(setReservations) // Update reservations state with the fetched data
      .catch(setReservationsError); // Handle errors related to fetching reservations
    // Fetch all tables
    listTables(abortController.signal)
      .then(setTables) // Update tables state with the fetched data
      .catch(setTablesError); // Handle errors related to fetching tables
    // Cleanup function to abort fetch requests if the component unmounts
    return () => abortController.abort();
  }

  // Map tables to Table components
  const tableList = tables.map((table) => (
    <Tables loadDashboard={loadDashboard} key={table.table_id} table={table} />
  ));

  // Map reservations to Reservation components
  const reservationList = reservations.map((reservation) => (
    <Reservations
      loadDashboard={loadDashboard}
      key={reservation.reservation_id}
      reservation={reservation}
    />
  ));

  // Event handler to navigate to the previous date
  const handlePrevious = (event) => {
    event.preventDefault();
    history.push(`/dashboard?date=${previous(date)}`);
  };

  // Event handler to navigate to the next date
  const handleNext = (event) => {
    event.preventDefault();
    history.push(`/dashboard?date=${next(date)}`);
  };

  // Event handler to navigate to today's date
  const handleToday = (event) => {
    event.preventDefault();
    history.push(`/dashboard?date=${today()}`);
  };

  // JSX returned by the component
  return (
    <main>
      <h1>Dashboard</h1>
      {/* Display reservations for the specified date */}
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      {/* Display any errors related to reservations */}
      <ErrorAlert error={reservationsError} />
      {/* Display any errors related to tables */}
      <ErrorAlert error={tablesError} />
      {/* Table to display reservations */}
      <table className="table">
        <thead className="thead-dark">
          <tr>
            <th scope="col">#</th>
            <th scope="col">NAME</th>
            <th scope="col">PHONE</th>
            <th scope="col">DATE</th>
            <th scope="col">TIME</th>
            <th scope="col">PEOPLE</th>
            <th scope="col">STATUS</th>
            <th scope="col">CHANGE THE STATUS</th>
          </tr>
        </thead>
        <tbody>{reservationList}</tbody>
      </table>

      {/* Display tables */}
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Tables</h4>
      </div>
      {/* Table to display tables */}
      <main>
        <table className="table">
          <thead className="thead-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Table Name</th>
              <th scope="col">Capacity</th>
              <th scope="col">Is Occupied?</th>
              <th scope="col">Finished</th>
            </tr>
          </thead>
          <tbody>{tableList}</tbody>
        </table>
      </main>

      {/* Navigation buttons */}
      <div className="row">
        <div className="btn-group col d-md-flex mb-3" role="group" aria-label="Basic example">
          {/* Button to navigate to the previous date */}
          <button
            type="button"
            className="btn btn-info"
            onClick={handlePrevious}
          >
            <span className="oi oi-chevron-left"></span>
            &nbsp;Previous
          </button>
          {/* Button to navigate to today's date */}
          <button type="button" className="btn btn-info" onClick={handleToday}>
            Today
          </button>
          {/* Button to navigate to the next date */}
          <button type="button" className="btn btn-info" onClick={handleNext}>
            Next&nbsp;
            <span className="oi oi-chevron-right"></span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default Dashboard; // Export the Dashboard component
