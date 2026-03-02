import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PRECEPTORIA1.jpg";

const PreceptoriaCompendiosNotas = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>COMPENDIOS CON NOTAS</h2>
      <div className="contenido-submenu">
        <p>Módulo para generar compendios con notas</p>
      </div>
    </div>
  );
};

export default PreceptoriaCompendiosNotas;