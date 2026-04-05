import React, { useState } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo REGISTRO ALUMNOS1.jpg";

const RegistroAlumnosPermisosExamen = ({ goBack, goHome }) => {
  const [showPrint, setShowPrint] = useState(false);

  // Renderiza las 12 filas de la tabla de permiso
  const renderTableRows = () => {
    const rows = [];
    for (let i = 1; i <= 12; i++) {
      rows.push(
        <tr key={i} style={{ height: '0.8cm' }}>
          <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold' }}>{i}</td>
          <td style={{ border: '1px solid black' }}></td>
          <td style={{ border: '1px solid black' }}></td>
          <td style={{ border: '1px solid black' }}></td>
          <td style={{ border: '1px solid black' }}></td>
          <td style={{ border: '1px solid black' }}></td>
        </tr>
      );
    }
    return rows;
  };

  // Componente de la Ficha Individual para duplicar
  const PermisoIndividual = () => (
    <div style={{ 
      width: '13.5cm', 
      height: '19cm', 
      padding: '0.5cm', 
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Helvetica", "Arial", sans-serif',
      color: 'black',
      backgroundColor: 'white'
    }}>
      {/* Encabezado */}
      <div style={{ fontSize: '16pt', fontWeight: 'bold', textAlign: 'center', margin: '0', textTransform: 'uppercase', color: 'black' }}>PERMISO DE EXAMEN</div>
      <div style={{ fontSize: '12pt', fontWeight: 'bold', textAlign: 'center', margin: '5px 0 15px 0', color: 'black' }}>Escuela Secundaria Gobernador Garmendia</div>

      {/* Info Personal */}
      <div style={{ marginBottom: '10px', fontSize: '10pt' }}>
        <p style={{ margin: '8px 0' }}>Alumno/A: .........................................................................................................</p>
        <p style={{ textAlign: 'center', margin: '8px 0' }}>Permiso De Examen N°: ...........................................</p>
      </div>

      {/* Condición */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '10px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '10pt' }}>Condición:</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 25px' }}>
          {["REGULAR", "PREVIO", "FINAL", "COMPLETAR CARRERA"].map(cond => (
            <label key={cond} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '9pt', fontWeight: 'bold' }}>
              <div style={{ width: '12px', height: '12px', border: '1px solid black' }}></div> {cond}
            </label>
          ))}
        </div>
      </div>

      {/* Texto Legal */}
      <p style={{ fontSize: '9pt', textAlign: 'justify', lineHeight: '1.3', margin: '15px 0' }}>
        Por la presente se deja constancia que el/la <strong>alumno/a mencionado/a</strong> se encuentra <strong>debidamente habilitado/a</strong> para rendir las asignaturas correspondientes al <strong>año de estudio</strong> que se detallan a continuación, en las fechas que se consignan:
      </p>

      {/* Tabla */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5pt' }}>
        <thead>
          <tr style={{ height: '1.2cm' }}>
            <th style={{ border: '1px solid black', width: '0.8cm', position: 'relative' }}>
              <div style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontWeight: 'bold' }}>N° DE ORD.</div>
            </th>
            <th style={{ border: '1px solid black', width: '1.2cm', fontWeight: 'bold' }}>AÑO</th>
            <th style={{ border: '1px solid black', fontWeight: 'bold' }}>ASIGNATURA</th>
            <th style={{ border: '1px solid black', width: '2.2cm', fontWeight: 'bold' }}>FECHA</th>
            <th style={{ border: '1px solid black', width: '1.8cm', fontWeight: 'bold' }}>Calificación</th>
            <th style={{ border: '1px solid black', width: '2.5cm', fontWeight: 'bold' }}>FIRMA DEL PDT.E DE LA MESA EXAM.</th>
          </tr>
        </thead>
        <tbody>
          {renderTableRows()}
        </tbody>
      </table>

      {/* Pie de Página */}
      <div style={{ marginTop: 'auto' }}>
        <p style={{ textAlign: 'center', margin: '20px 0', fontSize: '10pt' }}>
          Gobernador Garmendia, _____ de _____________ de 20 ______
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px', fontSize: '8pt', fontWeight: 'bold' }}>
          <div style={{ width: '4.5cm', textAlign: 'center' }}>
            ................................................<br />SELLO
          </div>
          <div style={{ width: '6.5cm', textAlign: 'center' }}>
            ....................................................................<br />FIRMA MANUSCRITA DEL SECRETARIO
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      
      {!showPrint ? (
        <>
          <h2>PERMISOS DE EXAMEN</h2>
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

          {/* Vista previa en pantalla (escalada para que quepa) */}
          <div className="contenido-submenu" style={{ maxWidth: '100%', width: '98%', backgroundColor: 'transparent', boxShadow: 'none', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', transform: 'scale(0.75)', transformOrigin: 'top center', paddingBottom: '100px' }}>
               <PermisoIndividual />
               <PermisoIndividual />
            </div>
          </div>
        </>
      ) : (
        /* CONTENEDOR DE IMPRESIÓN FULL SCREEN */
        <div className="print-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#eee', zIndex: 2000, overflowY: 'auto' }}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* HOJA A4 LANDSCAPE (297x210mm) */}
            <div className="print-page landscape" style={{ 
              width: '297mm', 
              height: '210mm', 
              backgroundColor: 'white', 
              padding: '0.8cm 1cm', 
              boxSizing: 'border-box',
              display: 'flex',
              justifyContent: 'space-between',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              color: 'black'
            }}>
              <PermisoIndividual />
              <PermisoIndividual />
            </div>

            {/* Botones de Control */}
            <div className="no-print" style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
              <button onClick={() => window.print()} style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>GUARDAR COMO PDF</button>
              <button onClick={() => window.print()} style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>IMPRIMIR</button>
              <button onClick={() => setShowPrint(false)} style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>CANCELAR</button>
            </div>

          </div>

          <style>{`
            @media print {
              .navbar, .no-print, h2, .contenido-submenu { display: none !important; }
              .pagina-submenu { background-image: none !important; padding: 0 !important; margin: 0 !important; }
              body * { visibility: hidden; }
              .print-overlay, .print-overlay * { visibility: visible; }
              
              .print-overlay { 
                position: absolute !important; 
                top: 0 !important; 
                left: 0 !important; 
                width: 100% !important; 
                height: 100% !important;
                background: white !important; 
                margin: 0 !important;
                padding: 0 !important;
                display: block !important; 
                overflow: hidden !important;
              }
              
              .print-page { 
                box-shadow: none !important; 
                margin: 0 auto !important; 
                width: 297mm !important; 
                height: 210mm !important;
                padding: 0.5cm !important; 
                box-sizing: border-box !important;
              }
              
              html, body { height: 100% !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; background: white !important; }
              @page { margin: 0; size: A4 landscape; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default RegistroAlumnosPermisosExamen;
