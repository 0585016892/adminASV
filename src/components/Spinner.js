// components/Spinner.js
import React from "react";
import { Spinner as RBSpinner } from "react-bootstrap";

const Spinner = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <RBSpinner animation="border" variant="primary" />
  </div>
);

export default Spinner;
