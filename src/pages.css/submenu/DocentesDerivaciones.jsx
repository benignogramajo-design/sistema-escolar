import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo DOCENTES1.jpg";

const DocentesDerivaciones = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>DERIVACIONES</h2>
      <div className="contenido-submenu">
        <p>Panel de Derivaciones de Docentes.</p>
      </div>
    </div>
  );
};

export default DocentesDerivaciones;