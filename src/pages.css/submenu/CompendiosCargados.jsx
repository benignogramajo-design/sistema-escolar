import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PLANILLAS1.jpg";

const CompendiosCargados = ({ goBack, goHome }) => {
  return (
    <div
      className="pagina-modulo"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>COMPENDIOS CARGADOS</h2>
      <div className="contenido-submenu">
        <p>Listado de compendios cargados...</p>
      </div>
    </div>
  );
};

export default CompendiosCargados;