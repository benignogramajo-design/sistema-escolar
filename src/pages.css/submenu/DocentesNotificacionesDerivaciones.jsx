import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo DOCENTES1.jpg";

const DocentesNotificacionesDerivaciones = ({ navigate, goBack, goHome }) => {
  return (
    <div className="pagina-modulo" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>NOTIFICACIONES / DERIVACIONES</h2>
      <div className="subbotones">
        <SubBoton
          titulo="NOTIFICACIONES"
          color="rgba(100, 149, 237, 0.7)"
          onClick={() => navigate("DocentesNotificaciones")}
        />
        <SubBoton
          titulo="DERIVACIONES"
          color="rgba(100, 149, 237, 0.7)"
          onClick={() => navigate("DocentesDerivaciones")}
        />
        <SubBoton
          titulo="RECIBIDOS / ENVIADOS"
          color="rgba(100, 149, 237, 0.7)"
          onClick={() => navigate("DocentesRecibidosEnviados")}
        />
      </div>
    </div>
  );
};

export default DocentesNotificacionesDerivaciones;