import React, { useState } from "react";
import Reservations from "./Reservations"; // Import Reservations component
import { listReservations } from "../utils/api"; // Import API function for listing reservations
import ErrorAlert from "../layout/ErrorAlert"; // Import ErrorAlert component

function Search() {
  const mobileNumber = { mobile_number: "" }; // Initial state for phone number input
  const [phoneNumber, setPhoneNumber] = useState({ ...mobileNumber }); // State for phone number input
  const [reservations, setReservations] = useState([]); // State for reservations
  const [reservationsError, setReservationsError] = useState(null); // State for reservations error

  // Function to load reservations based on phone number
  function loadSearch(event) {
    event.preventDefault(); // Prevent default form submission behavior
    const abortController = new AbortController(); // Create an AbortController for cancelling requests
    setReservationsError(null); // Clear previous errors
    // Call API function to list reservations based on phone number
    listReservations(phoneNumber, abortController.signal)
      .then(setReservations) // Set reservations state with the received data
      .catch(setReservationsError); // Set reservations error state if an error occurs
    return () => abortController.abort(); // Cleanup function to abort requests
  }

  // Function to handle changes in the phone number input
  const changeHandler = (event) => {
    setPhoneNumber({ ...phoneNumber, [event.target.name]: event.target.value }); // Update phone number state
  };

  // Map reservations array to Reservation components
  const reservationList = reservations.map((reservation) => (
    <Reservations key={reservation.reservation_id} reservation={reservation} />
  ));

  // Display errors if reservationsError is truthy
  const showErrors = reservationsError && <ErrorAlert error={reservationsError} />;

  return (
    <div>
      {showErrors}
      <h1>Search for a reservation</h1>
      {/* Form for searching reservations */}
      <form onSubmit={loadSearch}>
        <div>
          <input
            placeholder="Search by Phone number"
            onChange={changeHandler}
            value={phoneNumber.mobile_number}
            required
            name="mobile_number"
          />
        </div>
        <button type="submit" className="btn btn-info">
          Search
        </button>
      </form>
      {/* Table to display search results */}
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
          </tr>
        </thead>
        <tbody>
          {/* Render reservationList if reservations exist, otherwise show "No reservations found" */}
          {reservations.length > 0 ? (
            reservationList
          ) : (
            <tr>
              <td>No reservations found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Search; // Export the Search component
