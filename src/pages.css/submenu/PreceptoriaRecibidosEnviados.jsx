import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PRECEPTORIA1.jpg";

const PreceptoriaRecibidosEnviados = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>RECIBIDOS / ENVIADOS</h2>
      <div className="contenido-submenu">
        <p>Historial de Recibidos y Enviados de Preceptoría.</p>
      </div>
    </div>
  );
};

export default PreceptoriaRecibidosEnviados;