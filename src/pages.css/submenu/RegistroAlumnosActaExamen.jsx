import React, { useState } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo REGISTRO ALUMNOS1.jpg";
import logoEscuela from "../../assets/logos/Logo ESC. GDIA.png";

const RegistroAlumnosActaExamen = ({ goBack, goHome }) => {
  const [showPrint, setShowPrint] = useState(false);

  // Estilos comunes
  const borderStyle = { border: '1px solid black' };

  // Renderiza las 20 filas vacías del acta
  const renderRows = () => {
    const rows = [];
    for (let i = 1; i <= 20; i++) {
      rows.push(
        <tr key={i} style={{ height: '0.8cm' }}>
          <td style={{ ...borderStyle, fontWeight: 'bold' }}>{i}</td>
          <td style={borderStyle}></td>
          <td style={borderStyle}></td>
          <td style={borderStyle}></td>
          <td style={borderStyle}></td>
          <td style={borderStyle}></td>
          <td style={borderStyle}></td>
          <td style={borderStyle}></td>
        </tr>
      );
    }
    return rows;
  };

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      
      {!showPrint ? (
        <>
          <h2>ACTA DE EXAMEN</h2>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0' }}>
            <button 
              onClick={() => setShowPrint(true)} 
              style={{ backgroundColor: 'yellow', color: 'black', padding: '10px 25px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              IMPRIMIR
            </button>
            <button 
              onClick={() => setShowPrint(true)} 
              style={{ backgroundColor: 'red', color: 'white', padding: '10px 25px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              DESCARGAR COMO PDF
            </button>
          </div>

          <div className="contenido-submenu">
            <p style={{ textAlign: 'center' }}>Haga clic en los botones superiores para generar la vista previa del Acta Volante de Examen lista para impresión.</p>
          </div>
        </>
      ) : (
        /* CONTENEDOR DE VISTA PREVIA */
        <div className="print-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#eee', zIndex: 2000, overflowY: 'auto' }}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* HOJA A4 VERTICAL */}
            <div className="print-page" style={{ 
              width: '210mm', 
              minHeight: '297mm', 
              backgroundColor: 'white', 
              padding: '1cm 1.5cm', 
              boxShadow: '0 0 10px rgba(0,0,0,0.5)', 
              boxSizing: 'border-box',
              fontFamily: '"Helvetica", "Arial", sans-serif',
              color: 'black'
            }}>
              
              {/* Encabezado: Logo y Grilla de Fecha */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <img src={logoEscuela} alt="Logo Escuela" style={{ width: '8cm', height: '2.5cm', objectFit: 'contain' }} />
                
                <table style={{ borderCollapse: 'collapse', fontSize: '10pt', textAlign: 'center' }}>
                  <thead>
                    <tr>
                      <th style={{ ...borderStyle, padding: '2px 8px' }}>Día</th>
                      <th style={{ ...borderStyle, padding: '2px 8px' }}>Mes</th>
                      <th style={{ ...borderStyle, padding: '2px 8px' }}>Año</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ height: '25px' }}>
                      <td style={borderStyle}></td>
                      <td style={borderStyle}></td>
                      <td style={borderStyle}></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Título Central */}
              <h1 style={{ textAlign: 'center', fontSize: '20pt', fontWeight: 'bold', margin: '30px 0 20px 0', textDecoration: 'none', color: 'black' }}>
                ACTA VOLANTE DE EXAMEN
              </h1>

              {/* Líneas de Información */}
              <div style={{ fontSize: '11pt', marginBottom: '15px', lineHeight: '1.8' }}>
                <div style={{ marginBottom: '5px' }}>Exámenes de Alumnos: .................................................................................................................................</div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                  <div style={{ flex: 2 }}>Asignatura: ......................................................</div>
                  <div style={{ flex: 0.6 }}>Año: ............</div>
                  <div style={{ flex: 0.6 }}>Div.: ...............</div>
                  <div style={{ flex: 1 }}>Turno: .........................</div>
                </div>
              </div>

              {/* Tabla de Alumnos */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt', textAlign: 'center' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9f9f9' }}>
                    <th rowSpan="2" style={{ ...borderStyle, width: '0.8cm' }}>N° de Ord.</th>
                    <th rowSpan="2" style={{ ...borderStyle, width: '2cm' }}>N° de Permiso</th>
                    <th rowSpan="2" style={borderStyle}>Apellido y Nombres</th>
                    <th colSpan="3" style={borderStyle}>Calificaciones</th>
                    <th rowSpan="2" style={{ ...borderStyle, width: '1.5cm' }}>N° de Bolillas</th>
                    <th rowSpan="2" style={{ ...borderStyle, width: '3.5cm' }}>DOCUMENTO DE IDENTIDAD</th>
                  </tr>
                  <tr style={{ backgroundColor: '#f9f9f9' }}>
                    <th style={{ ...borderStyle, width: '1cm' }}>Esc.</th>
                    <th style={{ ...borderStyle, width: '1cm' }}>Oral</th>
                    <th style={{ ...borderStyle, width: '1cm' }}>Prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {renderRows()}
                </tbody>
              </table>

              {/* Pie de Página */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px', fontSize: '10pt', lineHeight: '1.6' }}>
                {/* Firmas Izquierda */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>Presidente: ............................................................</div>
                  <div>Vocal 1: .................................................................</div>
                  <div>Vocal 2: .................................................................</div>
                </div>

                {/* Totales Derecha */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                  <div>Total de Alumnos: ...........................</div>
                  <div>Aprobados: ...........................</div>
                  <div>Aplazados: ...........................</div>
                  <div>Ausentes: ...........................</div>
                </div>
              </div>

              {/* Fecha Final */}
              <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '11pt' }}>
                Gobernador Garmendia, ______ de __________________ de 20 ______
              </div>

            </div>

            {/* Botones de Control Flotantes */}
            <div className="no-print" style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
              <button onClick={() => window.print()} style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>GUARDAR COMO PDF</button>
              <button onClick={() => window.print()} style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>IMPRIMIR</button>
              <button onClick={() => setShowPrint(false)} style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>CANCELAR</button>
            </div>

          </div>

          <style>{`
            @media print {
              .no-print { display: none !important; }
              body * { visibility: hidden; }
              .print-overlay, .print-overlay * { visibility: visible; }
              .print-overlay { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; background: white !important; display: block !important; }
              .print-page { box-shadow: none !important; margin: 0 !important; width: 100% !important; padding: 0 !important; }
              html, body { height: auto !important; overflow: visible !important; margin: 0 !important; padding: 0 !important; }
              @page { margin: 1cm; size: A4 portrait; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default RegistroAlumnosActaExamen;