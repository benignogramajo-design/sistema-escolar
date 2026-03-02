import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo REGISTRO ALUMNOS1.jpg";

const RegistroYConstanciaDeAlumnos = ({ goBack, goHome, navigate }) => {
  const botones = [
    { titulo: "FICHA DEL ALUMNO", action: "RegistroAlumnosFicha" },
    { titulo: "LIBRO MATRIZ", action: "RegistroAlumnosLibroMatriz" },
    { titulo: "BOLETO ESTUDIANTIL", action: "RegistroAlumnosBoletoEstudiantil" },
    { titulo: "CAUSAL DE VACANTE", action: "RegistroAlumnosCausalVacante" },
    { titulo: "ACTA DE EXAMEN", action: "RegistroAlumnosActaExamen" },
    { titulo: "PERMISOS DE EXAMEN", action: "RegistroAlumnosPermisosExamen" },
    { titulo: "CERTIFICADOS", action: "RegistroAlumnosCertificados" },
  ];

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2 style={{ textTransform: 'uppercase' }}>REGISTRO Y CONSTANCIA DE ALUMNOS</h2>
      <div className="subbotones">
        {botones.map((item) => (
          <SubBoton
            key={item.titulo}
            titulo={item.titulo}
            color="rgba(127, 255, 212, 0.7)"
            onClick={() => navigate(item.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default RegistroYConstanciaDeAlumnos;