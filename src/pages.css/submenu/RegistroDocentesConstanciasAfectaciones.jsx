import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo REGISTRO DOCENTES1.jpg";

const RegistroDocentesConstanciasAfectaciones = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>CONSTANCIAS DE AFECTACIONES</h2>
      <div className="contenido-submenu">
        <p>Módulo de constancias de afectaciones</p>
      </div>
    </div>
  );
};

export default RegistroDocentesConstanciasAfectaciones;
