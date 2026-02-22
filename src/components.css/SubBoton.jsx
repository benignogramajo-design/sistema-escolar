import React from "react";
import "../styles/subBoton.css";

const SubBoton = ({ titulo, color, onClick }) => {
  return (
    <button
      className="sub-boton"
      style={{ backgroundColor: color }}
      onClick={onClick}
    >
      {titulo}
    </button>
  );
};

export default SubBoton;
