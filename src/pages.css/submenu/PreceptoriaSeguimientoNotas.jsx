import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PRECEPTORIA1.jpg";

const PreceptoriaSeguimientoNotas = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>PLANILLAS DE SEGUIMIENTO CON NOTAS</h2>
      <div className="contenido-submenu">
        <p>Módulo para planillas de seguimiento con notas</p>
      </div>
    </div>
  );
};

export default PreceptoriaSeguimientoNotas;
