import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";

const PersonalInstitucional = ({ goBack, goHome, navigate }) => {
  const botones = [
    { titulo: "CÓDIGOS", action: "DocentesCodigos" },
    { titulo: "ESTRUCTURA DE HORARIO", action: "DocentesEstructura" },
    { titulo: "DATOS DE LEGAJO", action: "DocentesDatosLegajo" },
    { titulo: "LEGAJO PERSONAL", action: "DocentesLegajo" },
    { titulo: "PERSONAL POR DIA", action: "PersonalPorDia" },
    { titulo: "N° DE BOLETAS", action: "NumeroDeBoletas" },
    { titulo: "USUARIOS", action: "DocentesUsuarios" },
    { titulo: "HORARIOS POR DÍA", action: "DocentesHorariosDia" },
    { titulo: "HORARIOS PARA IMPRIMIR", action: "DocentesHorariosImprimir" },
  ];

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2 style={{ textTransform: 'uppercase' }}>PERSONAL INSTITUCIONAL</h2>
      <div className="subbotones">
        {botones.map((item) => (
          <SubBoton
            key={item.titulo}
            titulo={item.titulo}
            color="rgba(115, 214, 253, 0.7)"
            onClick={() => navigate(item.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default PersonalInstitucional;