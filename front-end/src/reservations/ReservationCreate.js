import React, { useState } from "react";
import ReservationForm from "./ReservationForm"; // Importing ReservationForm component
import { createReservation } from "../utils/api"; // Importing API function for creating a reservation
import { useHistory } from "react-router-dom"; // Importing useHistory hook for navigation
import ErrorAlert from "../layout/ErrorAlert"; // Importing ErrorAlert component for displaying errors

function ReservationCreate() {
  const history = useHistory(); // Initializing useHistory hook for navigation

  // Initial state for reservation form fields
  const initialState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
  };

  // State variables for reservation data and error handling
  const [reservation, setReservation] = useState(initialState);
  const [error, setError] = useState(null);

  // Function to handle form submission
  function submitHandler(event) {
    event.preventDefault(); // Prevent default form submission behavior
    createReservation(reservation) // Call API function to create a reservation
      .then((createdReservation) => {
        // After successful reservation creation, extract reservation date and navigate to the dashboard page for that date
        const res_date = createdReservation.reservation_date.match(/\d{4}-\d{2}-\d{2}/)[0];
        history.push(`/dashboard?date=` + res_date);
      })
      .catch(setError); // Set error state if reservation creation fails
  }

  // JSX returned by the component
  return (
    <main>
      <ErrorAlert error={error} /> {/* Display ErrorAlert component if there is an error */}
      <h1>Create a Reservation</h1>
      {/* Render ReservationForm component and pass down props */}
      <ReservationForm
        reservation={reservation}
        setReservation={setReservation}
        submitHandler={submitHandler}
      />
    </main>
  );
}

export default ReservationCreate; // Export the ReservationCreate component
