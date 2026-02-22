import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo BIBLIOTECA1.jpg";

const BibliotecaMovimientos = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>MOVIMIENTOS</h2>
      <div className="contenido-submenu">
        <p>Módulo de movimientos de biblioteca</p>
      </div>
    </div>
  );
};

export default BibliotecaMovimientos;
