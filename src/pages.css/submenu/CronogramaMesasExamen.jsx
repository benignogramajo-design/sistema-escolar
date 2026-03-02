import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";

const CronogramaMesasExamen = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>CRONOGRAMA MESAS DE EXAMEN</h2>
      <div className="contenido-submenu">
        <p>Módulo para la gestión del cronograma de mesas de examen.</p>
      </div>
    </div>
  );
};

export default CronogramaMesasExamen;