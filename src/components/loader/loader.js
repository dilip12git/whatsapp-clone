import React from "react";
import "./loader.css";

import { BarLoader } from "react-spinners";
import logo from "../../assets/logo/GChat-logo1.png";

const Loader = () => (
  <div className="loader-container">
    <img src={logo} alt="logo" width={300} height={300} />
    <BarLoader color="#01A066" />
  </div>
);

export default Loader;
