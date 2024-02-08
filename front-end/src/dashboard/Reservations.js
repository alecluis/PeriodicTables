import React from "react";
import { useHistory, Link } from "react-router-dom"; // Import Link from react-router-dom
import { cancelReservation } from "../utils/api";

function Reservations({ reservation, loadDashboard }) {
  const history = useHistory();
  const {
    reservation_id,
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
    status,
  } = reservation;

  const handleCancel = () => {
    const confirmBox = window.confirm(
      "Do you want to cancel this reservation? This cannot be undone."
    );
    if (confirmBox === true) {
      cancelReservation(reservation_id)
        .then(() => {
          history.go(); // Redirect after canceling reservation
        })
        .catch((error) => console.log("error", error));
    }
  };

  return (
    <>
      <tr key={reservation_id}>
        <td className="rowBorder">{reservation_id}</td>
        <td className="rowBorder">
          {last_name}, {first_name}
        </td>
        <td className="rowBorder">{mobile_number}</td>
        <td className="rowBorder">{reservation_date}</td>
        <td className="rowBorder">{reservation_time}</td>
        <td className="rowBorder">{people}</td>
        <td data-reservation-id-status={reservation_id} className="rowBorder">
          Currently: {status}
        </td>
        <td>
          {status === "booked" ? (
            <div>
              <Link
                to={`/reservations/${reservation_id}/seat`}
                className="btn btn-primary mx-2"
              >
                Seat
              </Link>
              <Link
                to={`/reservations/${reservation_id}/edit`}
                className="btn btn-secondary mx-2"
              >
                Edit
              </Link>
              <button
                type="button"
                className="btn btn-warning mx-2"
                data-reservation-id-cancel={reservation.reservation_id}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          ) : null}
        </td>
      </tr>
    </>
  );
}

export default Reservations;