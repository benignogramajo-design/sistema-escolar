import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/fondo1.jpg";

const OfertasAcademicas = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <div className="contenido-submenu">
        <h2>Ofertas Académicas</h2>
        <p>Contenido sobre las ofertas académicas de la institución...</p>
      </div>
    </div>
  );
};
export default OfertasAcademicas;