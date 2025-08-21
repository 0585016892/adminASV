import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu,ChatWidget } from "../components";
import { Button } from "react-bootstrap";
import "../assets/Menu.css"; // chứa CSS ở trên

const Public = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="position-relative d-flex">
    
      {/* Sidebar */}
      <div className={`sidebar-container ${showMenu ? "open" : ""}`}>
        <Menu />
      </div>
         <div className="position-absolute" style={{ zIndex: "9999999999999",right:'2%',bottom:'30%' }}>
        <ChatWidget  />
      </div>
      {/* Main content */}
      <div className="content-area p-2" style={{marginLeft:220}}>
        <Outlet />
      </div>
    </div>
  );
};

export default Public;
