import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";

const DocentesHorariosImprimir = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>HORARIOS PARA IMPRIMIR</h2>
      <div className="contenido-submenu">
        <p>Módulo para imprimir horarios</p>
      </div>
    </div>
  );
};

export default DocentesHorariosImprimir;
