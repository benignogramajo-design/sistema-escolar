import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets.css/logos/Logo.png";

const NumeroDeBoletas = ({ goBack, goHome }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const [filters, setFilters] = useState({
    cargo: "",
    apellido_nombre: "",
    curso: "",
    division: "",
    asignatura: "",
    turno: "",
    caracter: "",
    numero_boleta: "",
    estado: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener Estructura de Horario
      const { data: estData, error: estError } = await supabase
        .from('estructura_horario')
        .select('*')
        .order('id', { ascending: false });

      if (estError && estError.code !== 'PGRST116') throw estError;

      const processedRows = [];

      const safeParse = (val, fallback) => {
        if (typeof val === 'string') {
          try { return JSON.parse(val); } catch (e) { return fallback; }
        }
        return val || fallback;
      };

      (estData || []).forEach(item => {
        const titular = safeParse(item.docente_titular, { nombre: "---" });
        const interino = safeParse(item.docente_interino, { nombre: "---" });
        const suplentes = safeParse(item.docentes_suplentes, []);

        const addRow = (doc, caracter) => {
          if (!doc || !doc.nombre || doc.nombre === "---" || doc.nombre === "VACANTE") return;

          let nBoleta = doc.n_boleta || "";
          if (!nBoleta || nBoleta.trim() === "" || nBoleta === "3518-") {
            nBoleta = "3518-SIN N° BOLETA";
          }

          processedRows.push({
            id: `${item.id}-${caracter}-${doc.nombre}`,
            cargo: item.cargo,
            apellido_nombre: doc.nombre,
            curso: item.curso,
            division: item.division,
            asignatura: item.asignatura,
            turno: item.turno,
            caracter: caracter,
            n_boleta: nBoleta,
            estado: doc.estado
          });
        };

        addRow(titular, "TITULAR");
        addRow(interino, "INTERINO");
        if (Array.isArray(suplentes)) {
          suplentes.forEach(s => addRow(s, "SUPLENTE"));
        }
      });

      setData(processedRows);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Filtros ---
  const filteredData = data.filter(item => {
    const f = filters;
    return (
      (!f.cargo || item.cargo === f.cargo) &&
      (!f.apellido_nombre || (item.apellido_nombre || "").toLowerCase().includes(f.apellido_nombre.toLowerCase())) &&
      (!f.curso || item.curso === f.curso) &&
      (!f.division || item.division === f.division) &&
      (!f.asignatura || (item.asignatura || "").toLowerCase().includes(f.asignatura.toLowerCase())) &&
      (!f.turno || item.turno === f.turno) &&
      (!f.caracter || item.caracter === f.caracter) &&
      (!f.numero_boleta || (item.n_boleta || "").includes(f.numero_boleta)) &&
      (!f.estado || item.estado === f.estado)
    );
  });

  // Listas para selects de filtros
  const uniqueCargos = [...new Set(data.map(d => d.cargo).filter(Boolean))].sort();
  const uniqueCursos = [...new Set(data.map(d => d.curso).filter(Boolean))].sort();
  const uniqueDivisiones = [...new Set(data.map(d => d.division).filter(Boolean))].sort();
  const uniqueTurnos = [...new Set(data.map(d => d.turno).filter(Boolean))].sort();

  // --- Renderizado ---
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      
      {!showPrintPreview && (
        <>
          <h2>N° DE BOLETAS</h2>

          {/* Filtros y Botón Imprimir */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', alignItems: 'center' }}>
            <select value={filters.cargo} onChange={e => setFilters({...filters, cargo: e.target.value})} style={{ padding: '5px' }}>
              <option value="">CARGO</option>
              {uniqueCargos.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="APELLIDO Y NOMBRE" value={filters.apellido_nombre} onChange={e => setFilters({...filters, apellido_nombre: e.target.value})} style={{ padding: '5px' }} />
            <input placeholder="CURSO" value={filters.curso} onChange={e => setFilters({...filters, curso: e.target.value})} style={{ padding: '5px', width: '60px' }} />
            <input placeholder="DIVISIÓN" value={filters.division} onChange={e => setFilters({...filters, division: e.target.value})} style={{ padding: '5px', width: '70px' }} />
            <input placeholder="ASIGNATURA" value={filters.asignatura} onChange={e => setFilters({...filters, asignatura: e.target.value})} style={{ padding: '5px' }} />
            <select value={filters.turno} onChange={e => setFilters({...filters, turno: e.target.value})} style={{ padding: '5px' }}>
              <option value="">TURNO</option>
              {uniqueTurnos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="CARÁCTER" value={filters.caracter} onChange={e => setFilters({...filters, caracter: e.target.value})} style={{ padding: '5px' }} />
            <input placeholder="N° BOLETA" value={filters.numero_boleta} onChange={e => setFilters({...filters, numero_boleta: e.target.value})} style={{ padding: '5px' }} />
            <select value={filters.estado} onChange={e => setFilters({...filters, estado: e.target.value})} style={{ padding: '5px' }}>
              <option value="">ESTADO</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="NO ACTIVO">NO ACTIVO</option>
            </select>
            <button 
              onClick={() => setShowPrintPreview(true)} 
              style={{ backgroundColor: 'yellow', color: 'black', padding: '8px 15px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '10px' }}
            >
              IMPRIMIR
            </button>
          </div>

          {/* Tabla */}
          <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%", overflowX: 'auto' }}>
            <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)", fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: "#333", color: "white" }}>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>CARGO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>APELLIDO Y NOMBRE</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>CURSO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>DIVISIÓN</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>ASIGNATURA</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>TURNO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>CARÁCTER</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>N° DE BOLETA</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr 
                      key={item.id}
                    >
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.cargo}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.apellido_nombre}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.curso || '-'}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.division || '-'}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.asignatura || '-'}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.turno}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.caracter}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", color: item.n_boleta.includes("SIN N° BOLETA") ? "red" : "inherit" }}>{item.n_boleta}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.estado}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron registros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Vista Previa de Impresión */}
      {showPrintPreview && (
        <div className="print-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#555', zIndex: 2000, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div className="print-content" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="print-page">
              {/* Encabezado */}
              <div style={{ borderBottom: '2px solid black', marginBottom: '20px', paddingBottom: '10px', color: 'black' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={logo} alt="Logo" style={{ width: '60px', marginRight: '20px' }} />
                    <div>
                      <h1 style={{ fontSize: '18px', margin: 0, color: 'black' }}>Escuela Secundaria Gobernador Garmendia</h1>
                      <p style={{ fontSize: '12px', margin: 0 }}>CUE: 9001717/00 - Av. de la Soja S/N°</p>
                      <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>N° DE BOLETAS</p>
                    </div>
                </div>
              </div>

              {/* Tabla en Vista Previa */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: "#f2f2f2" }}>
                    <th style={{ padding: "5px", border: "1px solid #000" }}>CARGO</th>
                    <th style={{ padding: "5px", border: "1px solid #000" }}>APELLIDO Y NOMBRE</th>
                    <th style={{ padding: "5px", border: "1px solid #000" }}>CURSO</th>
                    <th style={{ padding: "5px", border: "1px solid #000" }}>DIVISIÓN</th>
                    <th style={{ padding: "5px", border: "1px solid #000" }}>ASIGNATURA</th>
                    <th style={{ padding: "5px", border: "1px solid #000" }}>TURNO</th>
                    <th style={{ padding: "5px", border: "1px solid #000" }}>CARÁCTER</th>
                    <th style={{ padding: "5px", border: "1px solid #000" }}>N° DE BOLETA</th>
                    <th style={{ padding: "5px", border: "1px solid #000" }}>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, i) => (
                    <tr key={i}>
                      <td style={{ padding: "5px", border: "1px solid #000" }}>{item.cargo}</td>
                      <td style={{ padding: "5px", border: "1px solid #000" }}>{item.apellido_nombre}</td>
                      <td style={{ padding: "5px", border: "1px solid #000", textAlign: "center" }}>{item.curso || '-'}</td>
                      <td style={{ padding: "5px", border: "1px solid #000", textAlign: "center" }}>{item.division || '-'}</td>
                      <td style={{ padding: "5px", border: "1px solid #000" }}>{item.asignatura || '-'}</td>
                      <td style={{ padding: "5px", border: "1px solid #000" }}>{item.turno}</td>
                      <td style={{ padding: "5px", border: "1px solid #000" }}>{item.caracter}</td>
                      <td style={{ padding: "5px", border: "1px solid #000", color: item.n_boleta.includes("SIN N° BOLETA") ? "red" : "inherit" }}>{item.n_boleta}</td>
                      <td style={{ padding: "5px", border: "1px solid #000" }}>{item.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="no-print" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', backgroundColor: '#333', padding: '15px', textAlign: 'center', boxShadow: '0 -2px 10px rgba(0,0,0,0.3)' }}>
            <button onClick={() => window.print()} style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>GUARDAR COMO PDF</button>
            <button onClick={() => window.print()} style={{ backgroundColor: '#ffc107', color: 'black', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>IMPRIMIR</button>
            <button onClick={() => setShowPrintPreview(false)} style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>CANCELAR</button>
          </div>
          <style>{`
            .print-page { width: 210mm; min-height: 297mm; padding: 20mm; margin-bottom: 20px; background-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.5); box-sizing: border-box; }
            @media print {
              .no-print { display: none !important; }
              body * { visibility: hidden; }
              .print-overlay, .print-overlay * { visibility: visible; }
              .print-overlay { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: auto !important; overflow: visible !important; background-color: white !important; display: block !important; z-index: 9999 !important; }
              .print-content { display: block !important; padding: 0 !important; }
              .print-page { box-shadow: none; margin: 0; width: 100%; height: auto !important; page-break-after: always; }
              .print-page:last-child { page-break-after: auto; }
              @page { size: A4; margin: 0; }
              html, body { height: auto !important; overflow: visible !important; margin: 0; padding: 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default NumeroDeBoletas;