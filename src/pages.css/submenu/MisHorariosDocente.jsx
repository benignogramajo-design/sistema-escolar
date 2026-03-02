import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo DOCENTES1.jpg";

const MisHorariosDocente = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <div className="contenido-submenu">
        <h2>Mis Horarios</h2>
        <p>Información sobre los horarios del docente...</p>
      </div>
    </div>
  );
};
export default MisHorariosDocente;