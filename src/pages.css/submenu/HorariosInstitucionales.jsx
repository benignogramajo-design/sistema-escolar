import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/fondo1.jpg";

const HorariosInstitucionales = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <div className="contenido-submenu">
        <h2>Horarios Institucionales</h2>
        <p>Contenido sobre los horarios generales de la institución...</p>
      </div>
    </div>
  );
};
export default HorariosInstitucionales;