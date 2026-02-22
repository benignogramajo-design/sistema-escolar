import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";

const DocentesUsuarios = ({ navigate, goBack, goHome }) => {
  const subBotones = [
    { titulo: "USUARIO DEL PERSONAL", action: "UsuariosPersonal" },
    { titulo: "USUARIOS DE ALUMNOS", action: "UsuariosAlumnos" },
  ];

  return (
    <div
      className="pagina-submenu"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>USUARIOS</h2>
      <div className="subbotones">
        {subBotones.map((sub, index) => (
          <SubBoton
            key={index}
            titulo={sub.titulo}
            color="rgba(115, 214, 253, 0.7)"
            onClick={() => navigate(sub.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default DocentesUsuarios;