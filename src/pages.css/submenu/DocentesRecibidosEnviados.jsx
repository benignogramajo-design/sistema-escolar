import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo DOCENTES1.jpg";

const DocentesRecibidosEnviados = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>RECIBIDOS / ENVIADOS</h2>
      <div className="contenido-submenu">
        <p>Historial de Recibidos y Enviados de Docentes.</p>
      </div>
    </div>
  );
};

export default DocentesRecibidosEnviados;