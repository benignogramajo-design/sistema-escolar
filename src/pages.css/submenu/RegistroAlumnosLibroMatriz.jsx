import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo REGISTRO ALUMNOS1.jpg";

const RegistroAlumnosLibroMatriz = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>LIBRO MATRIZ</h2>
      <div className="contenido-submenu">
        <p>Módulo de libro matriz</p>
      </div>
    </div>
  );
};

export default RegistroAlumnosLibroMatriz;
