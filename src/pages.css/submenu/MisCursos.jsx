import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo DOCENTES1.jpg";

const MisCursos = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <div className="contenido-submenu">
        <h2>Mis Cursos</h2>
        <p>Listado de cursos del docente...</p>
      </div>
    </div>
  );
};
export default MisCursos;