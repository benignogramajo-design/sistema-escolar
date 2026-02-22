import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";

const DocentesHorariosDia = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>HORARIOS POR DÍA</h2>
      <div className="contenido-submenu">
        <p>Módulo de horarios por día</p>
      </div>
    </div>
  );
};

export default DocentesHorariosDia;
