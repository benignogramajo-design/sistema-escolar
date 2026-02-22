import React from "react";
import "../styles/menu.css";

const Submenu = ({ items }) => {
  return (
    <div className="submenu">
      {items.map((item, index) => (
        <button key={index} className="submenu-item">
          {item}
        </button>
      ))}
    </div>
  );
};

export default Submenu;
