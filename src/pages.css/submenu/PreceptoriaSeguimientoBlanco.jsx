import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PRECEPTORIA1.jpg";

const PreceptoriaSeguimientoBlanco = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>PLANILLAS DE SEGUIMIENTO EN BLANCO</h2>
      <div className="contenido-submenu">
        <p>Módulo para planillas de seguimiento en blanco</p>
      </div>
    </div>
  );
};

export default PreceptoriaSeguimientoBlanco;
