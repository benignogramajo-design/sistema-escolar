import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets.css/logos/Logo.png";

const PersonalPorDia = ({ goBack, goHome }) => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const [filters, setFilters] = useState({
    nombre: "",
    cargo: "",
    curso: "",
    division: "",
    asignatura: "",
    turno: "",
    dia: "",
    estado: ""
  });

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Obtener Docentes (Base)
      const { data: docData, error: docError } = await supabase
        .from('datos_de_legajo_docentes')
        .select('*')
        .order('apellido');
      
      if (docError) throw docError;

      // 2. Obtener Estructura de Horario
      const { data: estData, error: estError } = await supabase
        .from('estructura_horario')
        .select('*');

      if (estError && estError.code !== 'PGRST116') throw estError;

      // 3. Procesar datos
      const processedData = (docData || []).map(doc => {
        const nombreCompleto = `${doc.apellido}, ${doc.nombre}`;
        
        // Buscar asignaciones
        const rawAssignments = (estData || []).filter(item => {
          const isTitular = item.docente_titular?.nombre === nombreCompleto;
          const isInterino = item.docente_interino?.nombre === nombreCompleto;
          const isSuplente = Array.isArray(item.docentes_suplentes) && item.docentes_suplentes.some(s => s.nombre === nombreCompleto);
          return isTitular || isInterino || isSuplente;
        });

        // Normalizar turno
        const assignments = rawAssignments.map(asig => {
          let turnoNormalizado = asig.turno || "";
          const upper = turnoNormalizado.toUpperCase();
          if (upper.includes("MAÑANA") && upper.includes("TARDE")) turnoNormalizado = "Mañana y Tarde";
          else if (upper.includes("MAÑANA")) turnoNormalizado = "Mañana";
          else if (upper.includes("TARDE")) turnoNormalizado = "Tarde";
          return { ...asig, turno: turnoNormalizado };
        });

        // --- Construir campos para la tabla ---

        // CARGO
        const cargos = [...new Set(assignments.map(a => a.cargo).filter(Boolean))].join(" / ");

        // CURSO y DIVISIÓN - ASIGNATURA - ESTADO
        const cursoDivAsigEstadoList = assignments.map(a => {
          // Determinar estado del docente en esta asignación
          let estado = "---";
          if (a.docente_titular?.nombre === nombreCompleto) estado = a.docente_titular.estado;
          else if (a.docente_interino?.nombre === nombreCompleto) estado = a.docente_interino.estado;
          else if (Array.isArray(a.docentes_suplentes)) {
            const sup = a.docentes_suplentes.find(s => s.nombre === nombreCompleto);
            if (sup) estado = sup.estado;
          }

          const cursoDiv = (a.curso || a.division) ? `${a.curso || ''} ${a.division || ''}`.trim() : "---";
          const asignatura = a.asignatura || "---";
          
          return `${cursoDiv} - ${asignatura} - ${estado || '---'}`;
        });
        const cursoDivAsigEstado = [...new Set(cursoDivAsigEstadoList)].join(" | ");

        // TURNO
        const turnos = [...new Set(assignments.map(a => a.turno).filter(Boolean))].join(" / ");

        // DÍA (con horarios)
        const diasHorariosList = {};
        assignments.forEach(a => {
          if (Array.isArray(a.horarios)) {
            a.horarios.forEach(h => {
              if (!diasHorariosList[h.dia]) diasHorariosList[h.dia] = new Set();
              
              if (a.cargo !== 'DOCENTE' && h.horario_texto) {
                diasHorariosList[h.dia].add(h.horario_texto);
              } else if (Array.isArray(h.horas)) {
                h.horas.forEach(hora => diasHorariosList[h.dia].add(hora.split(' ')[0]));
              }
            });
          }
        });
        const diasHorarios = Object.entries(diasHorariosList)
          .map(([dia, horasSet]) => `${dia} (${[...horasSet].join(', ')})`).join(" | ");

        return {
          ...doc,
          nombreCompleto,
          display: {
            cargos,
            cursoDivAsigEstado,
            turnos,
            diasHorarios
          },
          // Datos crudos para filtros
          rawAssignments: assignments
        };
      });

      setDocentes(processedData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Filtros ---
  const filteredDocentes = docentes.map(d => {
    const f = filters;
    
    // 1. Filtro por Nombre (Docente)
    if (f.nombre && !d.nombreCompleto.toLowerCase().includes(f.nombre.toLowerCase())) {
      return null;
    }

    // 2. Filtrar Asignaciones y Recalcular Display
    const validAssignments = d.rawAssignments.filter(a => {
      if (f.cargo && a.cargo !== f.cargo) return false;
      if (f.curso && a.curso !== f.curso) return false;
      if (f.division && a.division !== f.division) return false;
      if (f.asignatura && !(a.asignatura || "").toLowerCase().includes(f.asignatura.toLowerCase())) return false;
      if (f.turno && a.turno !== f.turno) return false;

      // Estado check
      let estado = "---";
      if (a.docente_titular?.nombre === d.nombreCompleto) estado = a.docente_titular.estado;
      else if (a.docente_interino?.nombre === d.nombreCompleto) estado = a.docente_interino.estado;
      else if (Array.isArray(a.docentes_suplentes)) {
        const sup = a.docentes_suplentes.find(s => s.nombre === d.nombreCompleto);
        if (sup) estado = sup.estado;
      }
      if (f.estado && estado !== f.estado) return false;

      // Dia check (si el filtro de día está activo, la asignación debe tener ese día)
      if (f.dia) {
        if (!Array.isArray(a.horarios) || !a.horarios.some(h => h.dia === f.dia)) return false;
      }

      return true;
    });

    // Si hay filtros activos que afectan asignaciones y no queda ninguna válida, ocultar docente.
    const hasAssignmentFilters = f.cargo || f.curso || f.division || f.asignatura || f.turno || f.dia || f.estado;
    if (hasAssignmentFilters && validAssignments.length === 0) {
      return null;
    }

    // 3. Recalcular Strings de Visualización con las asignaciones filtradas
    const cargos = [...new Set(validAssignments.map(a => a.cargo).filter(Boolean))].join(" / ");
    const turnos = [...new Set(validAssignments.map(a => a.turno).filter(Boolean))].join(" / ");
    
    const cursoDivAsigEstadoList = validAssignments.map(a => {
      let estado = "---";
      if (a.docente_titular?.nombre === d.nombreCompleto) estado = a.docente_titular.estado;
      else if (a.docente_interino?.nombre === d.nombreCompleto) estado = a.docente_interino.estado;
      else if (Array.isArray(a.docentes_suplentes)) {
        const sup = a.docentes_suplentes.find(s => s.nombre === d.nombreCompleto);
        if (sup) estado = sup.estado;
      }
      const cursoDiv = (a.curso || a.division) ? `${a.curso || ''} ${a.division || ''}`.trim() : "---";
      const asignatura = a.asignatura || "---";
      return `${cursoDiv} - ${asignatura} - ${estado || '---'}`;
    });
    const cursoDivAsigEstado = [...new Set(cursoDivAsigEstadoList)].join(" | ");

    const diasHorariosList = {};
    validAssignments.forEach(a => {
      if (Array.isArray(a.horarios)) {
        a.horarios.forEach(h => {
          // Si hay filtro de día, solo mostrar ese día en la columna
          if (f.dia && h.dia !== f.dia) return;

          if (!diasHorariosList[h.dia]) diasHorariosList[h.dia] = new Set();
          
          if (a.cargo !== 'DOCENTE' && h.horario_texto) {
            diasHorariosList[h.dia].add(h.horario_texto);
          } else if (Array.isArray(h.horas)) {
            h.horas.forEach(hora => diasHorariosList[h.dia].add(hora.split(' ')[0]));
          }
        });
      }
    });
    const diasHorarios = Object.entries(diasHorariosList)
      .map(([dia, horasSet]) => `${dia} (${[...horasSet].join(', ')})`).join(" | ");

    return {
      ...d,
      display: {
        cargos,
        cursoDivAsigEstado,
        turnos,
        diasHorarios
      }
    };
  }).filter(Boolean);

  // Listas para selects de filtros (basadas en datos cargados)
  const uniqueCargos = [...new Set(docentes.flatMap(d => d.rawAssignments.map(a => a.cargo)).filter(Boolean))].sort();
  const uniqueCursos = [...new Set(docentes.flatMap(d => d.rawAssignments.map(a => a.curso)).filter(Boolean))].sort();
  const uniqueDivisiones = [...new Set(docentes.flatMap(d => d.rawAssignments.map(a => a.division)).filter(Boolean))].sort();
  const uniqueTurnos = ["Mañana", "Tarde", "Mañana y Tarde"];

  // --- Renderizado de Tabla ---
  const renderTable = () => (
    <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)", fontSize: '11px' }}>
      <thead>
        <tr style={{ backgroundColor: "#333", color: "white" }}>
          <th style={{ padding: "8px", border: "1px solid #ddd" }}>APELLIDO Y NOMBRE</th>
          <th style={{ padding: "8px", border: "1px solid #ddd" }}>CARGO</th>
          <th style={{ padding: "8px", border: "1px solid #ddd" }}>CURSO Y DIVISIÓN - ASIGNATURA - ESTADO</th>
          <th style={{ padding: "8px", border: "1px solid #ddd" }}>TURNO</th>
          <th style={{ padding: "8px", border: "1px solid #ddd" }}>DÍA</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
        ) : filteredDocentes.length > 0 ? (
          filteredDocentes.map((doc, i) => (
            <tr key={i}>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{doc.nombreCompleto}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{doc.display.cargos}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{doc.display.cursoDivAsigEstado}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{doc.display.turnos}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{doc.display.diasHorarios}</td>
            </tr>
          ))
        ) : (
          <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron registros.</td></tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      
      {!showPrintPreview && (
        <>
          <h2>PERSONAL POR DIA</h2>

          {/* Filtros y Botón Imprimir */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', alignItems: 'center' }}>
            <input 
              placeholder="APELLIDO Y NOMBRE" 
              value={filters.nombre} 
              onChange={e => setFilters({...filters, nombre: e.target.value})} 
              style={{ padding: '5px' }} 
            />
            <select value={filters.cargo} onChange={e => setFilters({...filters, cargo: e.target.value})} style={{ padding: '5px' }}>
              <option value="">CARGO</option>
              {uniqueCargos.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.curso} onChange={e => setFilters({...filters, curso: e.target.value})} style={{ padding: '5px', width: '70px' }}>
              <option value="">CURSO</option>
              {uniqueCursos.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.division} onChange={e => setFilters({...filters, division: e.target.value})} style={{ padding: '5px', width: '70px' }}>
              <option value="">DIVISIÓN</option>
              {uniqueDivisiones.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input 
              placeholder="ASIGNATURA" 
              value={filters.asignatura} 
              onChange={e => setFilters({...filters, asignatura: e.target.value})} 
              style={{ padding: '5px' }} 
            />
            <select value={filters.turno} onChange={e => setFilters({...filters, turno: e.target.value})} style={{ padding: '5px' }}>
              <option value="">TURNO</option>
              {uniqueTurnos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filters.dia} onChange={e => setFilters({...filters, dia: e.target.value})} style={{ padding: '5px' }}>
              <option value="">DÍA</option>
              {diasSemana.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filters.estado} onChange={e => setFilters({...filters, estado: e.target.value})} style={{ padding: '5px' }}>
              <option value="">ESTADO</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="NO ACTIVO">NO ACTIVO</option>
            </select>

            <button 
              onClick={() => setShowPrintPreview(true)}
              style={{ backgroundColor: 'yellow', color: 'black', border: 'none', padding: '8px 15px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }}
            >
              IMPRIMIR
            </button>
          </div>

          {/* Tabla Principal */}
          <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%", overflowX: 'auto' }}>
            {renderTable()}
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
                      <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>PERSONAL POR DÍA</p>
                    </div>
                </div>
              </div>

              {/* Tabla en Vista Previa */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: "#f2f2f2" }}>
                    <th style={{ padding: "5px", border: "1px solid #000" }}>APELLIDO Y NOMBRE</th>
                    <th style={{ padding: "5px", border: "1px solid #000" }}>CARGO</th>
                    <th style={{ padding: "5px", border: "1px solid #000" }}>CURSO Y DIVISIÓN - ASIGNATURA - ESTADO</th>
                    <th style={{ padding: "5px", border: "1px solid #000" }}>TURNO</th>
                    <th style={{ padding: "5px", border: "1px solid #000" }}>DÍA</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocentes.map((doc, i) => (
                    <tr key={i}>
                      <td style={{ padding: "5px", border: "1px solid #000" }}>{doc.nombreCompleto}</td>
                      <td style={{ padding: "5px", border: "1px solid #000" }}>{doc.display.cargos}</td>
                      <td style={{ padding: "5px", border: "1px solid #000" }}>{doc.display.cursoDivAsigEstado}</td>
                      <td style={{ padding: "5px", border: "1px solid #000" }}>{doc.display.turnos}</td>
                      <td style={{ padding: "5px", border: "1px solid #000" }}>{doc.display.diasHorarios}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
          
          <div className="no-print" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', backgroundColor: '#333', padding: '15px', textAlign: 'center', boxShadow: '0 -2px 10px rgba(0,0,0,0.3)' }}>
            <button 
              onClick={() => window.print()} 
              style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              GUARDAR COMO PDF
            </button>
            <button 
              onClick={() => window.print()} 
              style={{ backgroundColor: '#ffc107', color: 'black', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              IMPRIMIR
            </button>
            <button 
              onClick={() => setShowPrintPreview(false)} 
              style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              CANCELAR
            </button>
          </div>
          <style>{`
            .print-page {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              margin-bottom: 20px;
              background-color: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.5);
              box-sizing: border-box;
            }
            @media print {
              .no-print { display: none !important; }
              
              body * {
                visibility: hidden;
              }
              
              .print-overlay, .print-overlay * {
                visibility: visible;
              }
              
              .print-overlay {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: auto !important;
                overflow: visible !important;
                background-color: white !important;
                display: block !important;
                z-index: 9999 !important;
              }

              .print-content {
                display: block !important;
                padding: 0 !important;
              }

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

export default PersonalPorDia;