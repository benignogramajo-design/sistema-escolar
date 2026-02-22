import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PLANILLAS1.jpg";

const CompendiosHabilitar = ({ goBack, goHome }) => {
  return (
    <div
      className="pagina-modulo"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>HABILITAR COMPENDIOS</h2>
      <div className="contenido-submenu">
        <p>Contenido para habilitar compendios...</p>
      </div>
    </div>
  );
};

export default CompendiosHabilitar;