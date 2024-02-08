import React from "react";
import { finishTable } from "../utils/api"; // Import API function for finishing a table

function Tables({ table, loadDashboard }) {
  const { table_id, table_name, capacity, reservation_id } = table; // Destructure table object

  // Event handler to finish a table
  const handleFinish = () => {
    // Prompt user to confirm finishing the table
    const confirmBox = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );
    // If user confirms, finish the table
    if (confirmBox === true) {
      finishTable(table_id) // Call API function to finish the table
        .then(loadDashboard) // Reload the dashboard after finishing the table
        .catch((error) => console.log("error", error)); // Log any errors
    }
  };

  // JSX returned by the component
  return (
    <tr key={table_id}>
      {/* Display table details in table cells */}
      <th scope="row">{table_id}</th>
      <td>{table_name}</td>
      <td>{capacity}</td>
      {/* Display table status (Occupied/Free) based on reservation_id */}
      <td data-table-id-status={`${table_id}`}>
        {reservation_id ? "Occupied" : "Free"}
      </td>
      <td>
        {/* Display 'Finish' button if table is occupied */}
        {reservation_id ? (
          <button
            data-table-id-finish={table_id}
            className="delete button btn btn-warning"
            onClick={handleFinish} // Call handleFinish function on click
          >
            Finish
          </button>
        ) : null}
      </td>
    </tr>
  );
}

export default Tables; // Export the Tables component
