import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/FONDO NOTICIAS.jpg";

const NuevaNoticia = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>NUEVA NOTICIA</h2>
      <div className="contenido-submenu">
        <p>Formulario para crear una nueva noticia.</p>
      </div>
    </div>
  );
};

export default NuevaNoticia;