import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/FONDO NOTICIAS.jpg";

const Noticias = ({ navigate, goBack, goHome }) => {
  return (
    <div className="pagina-modulo" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>NOTICIAS</h2>
      <div className="subbotones">
        <SubBoton
          titulo="MIS NOTICIAS"
          color="rgba(175, 172, 172, 0.8)"
          onClick={() => navigate("MisNoticias")}
        />
        <SubBoton
          titulo="NUEVA NOTICIA"
          color="rgba(175, 172, 172, 0.8)"
          onClick={() => navigate("NuevaNoticia")}
        />
      </div>
    </div>
  );
};

export default Noticias;