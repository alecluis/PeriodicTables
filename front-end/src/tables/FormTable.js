import React from "react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api"; // Importing API function for creating a table
import ErrorAlert from "../layout/ErrorAlert"; // Importing ErrorAlert component

function FormTable() {
  const history = useHistory(); // Initializing useHistory hook for navigation
  const [error, setError] = useState(null); // State variable for error
  const initialState = {
    table_name: "",
    capacity: 0,
  };
  const [table, setTable] = useState(initialState); // State variable for table form data

  // Event handler for input change (text)
  function changeHandler({ target: { name, value } }) {
    setTable((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  // Event handler for input change (number)
  function changeHandlerNum({ target: { name, value } }) {
    setTable((prevState) => ({
      ...prevState,
      [name]: Number(value),
    }));
  }

  // Event handler for form submission
  function submitHandler(event) {
    event.preventDefault(); // Preventing default form submission behavior
    createTable(table) // Creating a new table using API
      .then(() => {
        history.push("/"); // Redirecting to the home page after successful submission
      })
      .catch(setError); // Handling errors
  }

  // JSX returned by the component
  return (
    <main>
      <ErrorAlert error={error} /> {/* Display ErrorAlert component if there is an error */}
      <p>Your table</p>
      <form onSubmit={submitHandler}>
        <div>
          <div>
            {/* Input field for table name */}
            <label className="form-label" htmlFor="table_name">
              Table Name
            </label>
            <input
              className="form-control"
              id="table_name"
              name="table_name"
              type="text"
              min="2"
              value={table.table_name}
              onChange={changeHandler}
              required={true}
            />
            <small className="form-text text-muted">
              Table Name must have at least two characters.
            </small>
          </div>

          <div>
            {/* Input field for table capacity */}
            <label className="form-label" htmlFor="capacity">
              Capacity
            </label>
            <input
              className="form-control"
              id="capacity"
              name="capacity"
              type="number"
              value={table.capacity}
              onChange={changeHandlerNum}
              required={true}
            />
            <small className="form-text text-muted">
              Table must have a capacity of at least one person.
            </small>
          </div>
        </div>
        <div>
          {/* Cancel button */}
          <button
            type="button"
            className="btn btn-secondary mr-2"
            onClick={history.goBack}
          >
            Cancel
          </button>
          {/* Submit button */}
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    </main>
  );
}

export default FormTable; // Exporting the FormTable component
