import React from "react";
import "../styles/botonModulo.css";

const BotonModulo = ({ titulo, color, icono, onClick }) => {
  return (
    <div className="boton-modulo" style={{ backgroundColor: color }} onClick={onClick}>
      <img src={icono} alt={titulo} />
      <span>{titulo}</span>
    </div>
  );
};

export default BotonModulo;
