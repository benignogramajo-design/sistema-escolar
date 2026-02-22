import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo DOCENTES1.jpg";

const SeguimientoPorCurso = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <div className="contenido-submenu">
        <h2>Seguimiento por Curso</h2>
        <p>Módulo para el seguimiento general de un curso...</p>
      </div>
    </div>
  );
};
export default SeguimientoPorCurso;