import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PRECEPTORIA1.jpg";

const PreceptoriaNotificacionesDerivaciones = ({ navigate, goBack, goHome }) => {
  return (
    <div className="pagina-modulo" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>NOTIFICACIONES / DERIVACIONES</h2>
      <div className="subbotones">
        <SubBoton
          titulo="NOTIFICACIONES"
          color="rgba(144, 238, 144, 0.7)"
          onClick={() => navigate("PreceptoriaNotificaciones")}
        />
        <SubBoton
          titulo="DERIVACIONES"
          color="rgba(144, 238, 144, 0.7)"
          onClick={() => navigate("PreceptoriaDerivaciones")}
        />
        <SubBoton
          titulo="RECIBIDOS / ENVIADOS"
          color="rgba(144, 238, 144, 0.7)"
          onClick={() => navigate("PreceptoriaRecibidosEnviados")}
        />
      </div>
    </div>
  );
};

export default PreceptoriaNotificacionesDerivaciones;