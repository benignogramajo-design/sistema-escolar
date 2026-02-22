import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/FONDO NOTICIAS.jpg";

const MisNoticias = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>MIS NOTICIAS</h2>
      <div className="contenido-submenu">
        <p>Listado de noticias publicadas.</p>
      </div>
    </div>
  );
};

export default MisNoticias;