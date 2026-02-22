import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PRECEPTORIA1.jpg";

const PreceptoriaInformeAsistencia = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>INFORME DE ASISTENCIA MENSUAL</h2>
      <div className="contenido-submenu">
        <p>Módulo para generar informes de asistencia mensual</p>
      </div>
    </div>
  );
};

export default PreceptoriaInformeAsistencia;
