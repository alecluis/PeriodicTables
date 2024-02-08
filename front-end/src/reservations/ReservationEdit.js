import React, { useState, useEffect } from "react";
import ReservationForm from "./ReservationForm"; // Importing ReservationForm component
import { updateReservation, readReservation } from "../utils/api"; // Importing API functions for updating and reading reservation data
import { useParams, useHistory } from "react-router-dom"; // Importing useParams and useHistory hooks for accessing URL parameters and navigation
import ErrorAlert from "../layout/ErrorAlert"; // Importing ErrorAlert component for displaying errors

function ReservationEdit() {
  const history = useHistory(); // Initializing useHistory hook for navigation
  const { reservation_id } = useParams(); // Extracting reservation_id parameter from URL
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
  const [reservationsError, setReservationsError] = useState(null);
  const [error, setError] = useState(null);

  // Load reservation data when component mounts or reservation_id changes
  useEffect(() => {
    const abortController = new AbortController();
    setReservationsError(null);
    readReservation(reservation_id, abortController.signal)
      .then(setReservation)
      .catch(setReservationsError);
    return () => abortController.abort();
  }, [reservation_id]);

  // Function to handle form submission
  async function submitHandler(event) {
    event.preventDefault(); // Prevent default form submission behavior
    try {
      const abortController = new AbortController();
      await updateReservation(reservation_id, reservation, abortController.signal); // Call API function to update reservation data
      setReservation(initialState); // Reset reservation state after successful update
      const res_date = reservation.reservation_date.match(/\d{4}-\d{2}-\d{2}/)[0]; // Extract reservation date
      history.push(`/dashboard?date=${res_date}`); // Navigate to the dashboard page for the updated reservation date
    } catch (error) {
      setError(error); // Set error state if update fails
    }
  }

  // JSX returned by the component
  return (
    <main>
      <ErrorAlert error={error} /> {/* Display ErrorAlert component if there is an error */}
      <h1>Edit a Reservation</h1>
      {/* Render ReservationForm component and pass down props */}
      <ReservationForm
        reservation={reservation}
        setReservation={setReservation}
        submitHandler={submitHandler}
      />
    </main>
  );
}

export default ReservationEdit; // Export the ReservationEdit component
