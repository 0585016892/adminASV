import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "../components";
import { Button } from "react-bootstrap";
import "../assets/Menu.css"; // chứa CSS ở trên

const Public = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="position-relative d-flex">
      {/* Toggle menu button for mobile */}
      {/* <Button
        className="d-md-none m-2 position-fixed zindex-tooltip"
        variant="primary"
        onClick={() => setShowMenu(!showMenu)}
        style={{ top: 10, left: 10 }}
      >
        ☰ Menu
      </Button> */}

      {/* Sidebar */}
      <div className={`sidebar-container ${showMenu ? "open" : ""}`}>
        <Menu />
      </div>

      {/* Main content */}
      <div className="content-area p-2" style={{marginLeft:220}}>
        <Outlet />
      </div>
    </div>
  );
};

export default Public;
