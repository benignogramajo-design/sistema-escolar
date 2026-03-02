import React, { useEffect, useState } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets.css/logos/Logo.png";

const DocentesCodigos = ({ goBack, goHome }) => {
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [mode, setMode] = useState("view"); // 'view', 'create', 'edit', 'delete'
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Estado del formulario
  const initialFormState = {
    turno: "",
    cargo: "",
    orden: "",
    curso: "",
    carga_horaria: "",
    division: "",
    asignatura: "",
    plazas: [""] // Array para manejar plazas dinámicas
  };
  const [formData, setFormData] = useState(initialFormState);

  // Estado de filtros
  const [filters, setFilters] = useState({
    cargo: "",
    turno: "",
    curso: "",
    division: "",
    asignatura: "",
    plazas: ""
  });

  const fetchCodigos = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const { data, error } = await supabase
        .from('codigos')
        .select('*')
        .order('id', { ascending: false }); // Orden inicial (se reordena en cliente)

      if (error) throw error;

      // Ordenamiento personalizado: Docentes primero (por ord/curso/div), luego el resto (por ord)
      const sortedData = (data || []).sort((a, b) => {
        const cargoA = (a.cargo || "").trim().toUpperCase();
        const cargoB = (b.cargo || "").trim().toUpperCase();
        
        const isDocenteA = cargoA === "DOCENTE";
        const isDocenteB = cargoB === "DOCENTE";

        // 1. Prioridad: Poner el cargo "DOCENTE" siempre arriba
        if (isDocenteA && !isDocenteB) return -1;
        if (!isDocenteA && isDocenteB) return 1;

        // 2. Si ambos son DOCENTE: Ordenar por Curso, División y luego Ord
        if (isDocenteA) { // No hace falta chequear isDocenteB, ya que si uno fuera false, habría salido en el paso 1.
          const cursoA = (a.curso || "").toString();
          const cursoB = (b.curso || "").toString();
          const compareCurso = cursoA.localeCompare(cursoB, undefined, { numeric: true });
          if (compareCurso !== 0) return compareCurso;

          const divA = (a.division || "").toString();
          const divB = (b.division || "").toString();
          const compareDiv = divA.localeCompare(divB, undefined, { numeric: true });
          if (compareDiv !== 0) return compareDiv;

          const ordenA_doc = (a.orden || "").toString();
          const ordenB_doc = (b.orden || "").toString();
          return ordenA_doc.localeCompare(ordenB_doc, undefined, { numeric: true });
        }

        // 3. Si ninguno es DOCENTE (o ambos son otro cargo): Ordenar por "orden"
        const ordenA = (a.orden || "").toString();
        const ordenB = (b.orden || "").toString();
        return ordenA.localeCompare(ordenB, undefined, { numeric: true });
      });

      setCodigos(sortedData);
    } catch (error) {
      console.error("Error cargando códigos:", error.message);
      setFetchError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodigos();
  }, []);

  // Manejo de inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejo dinámico de plazas
  const handlePlazaChange = (index, value) => {
    const newPlazas = [...formData.plazas];
    newPlazas[index] = value;
    // Si escribimos en el último campo, agregamos uno nuevo
    if (index === newPlazas.length - 1 && value !== "") {
      newPlazas.push("");
    }
    setFormData(prev => ({ ...prev, plazas: newPlazas }));
  };

  // Guardar (Nuevo o Editar)
  const handleSave = async (e) => {
    e.preventDefault();
    const plazasClean = formData.plazas.filter(p => p.trim() !== "");
    
    const payload = {
      turno: formData.turno || "---",
      cargo: formData.cargo || "---",
      orden: formData.orden || "---",
      curso: formData.curso || "---",
      carga_horaria: formData.carga_horaria || "---",
      division: formData.division || "---",
      asignatura: formData.asignatura || "---",
      plazas: plazasClean // Supabase guardará esto como JSON si la columna es JSONB
    };

    try {
      if (mode === "create") {
        const { error } = await supabase.from('codigos').insert([payload]);
        if (error) throw error;
      } else if (mode === "edit" && selectedId) {
        const { error } = await supabase.from('codigos').update(payload).eq('id', selectedId);
        if (error) throw error;
      }
      
      await fetchCodigos();
      setMode("view");
      setFormData(initialFormState);
      setSelectedId(null);
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  // Helper para formatear visualización de plazas
  const formatPlazas = (plazas, keyPrefix) => {
    let p = plazas;
    if (typeof p === 'string') {
      try {
        p = JSON.parse(p);
      } catch (e) {}
    }

    if (Array.isArray(p)) {
      return p.map((plaza, index) => {
        const plazaText = String(plaza).trim();
        const isRed = plazaText.includes("SIME") || plazaText.includes("D/REC");
        return (
          <span key={`${keyPrefix}-${index}`} style={{ color: isRed ? 'red' : 'inherit' }}>
            {plazaText}
          </span>
        );
      }).reduce((prev, curr) => [prev, " - ", curr]);
    }

    // Si no es un array o string JSON válido, devuelve el valor original
    return p;
  };

  // Manejo de clic en fila (para editar o eliminar)
  const handleRowClick = async (item) => {
    if (mode === "edit") {
      setSelectedId(item.id);
      setFormData({
        turno: item.turno === "---" ? "" : item.turno,
        cargo: item.cargo === "---" ? "" : item.cargo,
        orden: item.orden === "---" ? "" : item.orden,
        curso: item.curso === "---" ? "" : item.curso,
        carga_horaria: item.carga_horaria === "---" ? "" : item.carga_horaria,
        division: item.division === "---" ? "" : item.division,
        asignatura: item.asignatura === "---" ? "" : item.asignatura,
        plazas: (Array.isArray(item.plazas) && item.plazas.length > 0) ? [...item.plazas, ""] : [""]
      });
    } else if (mode === "delete") {
      if (window.confirm("¿Está seguro de eliminar este registro?")) {
        try {
          const { error } = await supabase.from('codigos').delete().eq('id', item.id);
          if (error) throw error;
          fetchCodigos();
        } catch (error) {
          alert("Error al eliminar: " + error.message);
        }
      }
    }
  };

  // Helper para obtener opciones únicas para los filtros
  const getUniqueOptions = (field) => {
    const values = codigos.map(item => item[field]).filter(val => val !== null && val !== undefined && val !== "");
    return [...new Set(values)].sort((a, b) => a.toString().localeCompare(b.toString(), undefined, { numeric: true }));
  };

  // Filtrado de datos
  const filteredData = codigos.filter(item => {
    const normalizeTurno = (turno) => {
      if (!turno) return "";
      const upper = String(turno).toUpperCase();
      if (upper.includes("MAÑANA") && upper.includes("TARDE")) return "Mañana y Tarde";
      if (upper.includes("MAÑANA")) return "Mañana";
      if (upper.includes("TARDE")) return "Tarde";
      return turno;
    };

    const checkSelect = (val, filter) => !filter || (val && val.toString() === filter);

    const checkPlazas = (plazasData, filterText) => {
      if (!filterText) return true;
      const lowercasedFilter = filterText.toLowerCase();
      
      let p = plazasData;
      if (typeof p === 'string') {
        try { p = JSON.parse(p); } catch (e) {}
      }

      if (Array.isArray(p)) {
        return p.some(plaza => String(plaza).toLowerCase().includes(lowercasedFilter));
      }
      return false;
    };

    return (
      checkSelect(item.cargo, filters.cargo) &&
      (!filters.turno || normalizeTurno(item.turno) === filters.turno) &&
      checkSelect(item.curso, filters.curso) &&
      checkSelect(item.division, filters.division) &&
      checkSelect(item.asignatura, filters.asignatura) &&
      checkPlazas(item.plazas, filters.plazas)
    );
  });

  // Calculo de horas totales
  const totalHs = filteredData.reduce((sum, item) => {
    const hs = parseFloat(item.carga_horaria);
    return sum + (isNaN(hs) ? 0 : hs);
  }, 0);

  // --- Renderizado de Tabla ---
  const renderTable = (isPrint = false) => {
    const tableStyles = isPrint 
      ? { width: "100%", borderCollapse: "collapse", fontSize: '10px' }
      : { width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)" };
    
    const thStyles = isPrint
      ? { padding: "5px", border: "1px solid #000", backgroundColor: "#f2f2f2" }
      : { padding: "10px", border: "1px solid #ddd" };

    const tdStyles = isPrint
      ? { padding: "5px", border: "1px solid #000" }
      : { padding: "10px", border: "1px solid #ddd" };

    return (
      <table style={tableStyles}>
        <thead style={isPrint ? {} : { backgroundColor: "#333", color: "white" }}>
          <tr>
            <th style={thStyles}>Ord.</th>                 
            <th style={thStyles}>Cargo</th>
            <th style={thStyles}>Turno</th>
            <th style={thStyles}>Curso/Div</th>
            <th style={thStyles}>Asignatura</th>
            <th style={thStyles}>HS</th>
            <th style={thStyles}>Plazas</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <tr 
                key={item.id}
                onClick={() => !isPrint && handleRowClick(item)}
                style={!isPrint ? { 
                  cursor: (mode === "edit" || mode === "delete") ? "pointer" : "default",
                  backgroundColor: (mode === "edit" || mode === "delete") ? "#fffbe6" : "transparent",
                  transition: "background-color 0.2s"
                } : {}}
                onMouseEnter={(e) => { if(!isPrint && mode !== "view") e.currentTarget.style.backgroundColor = "#f0f0f0"; }}
                onMouseLeave={(e) => { if(!isPrint && mode !== "view") e.currentTarget.style.backgroundColor = (mode === "edit" || mode === "delete") ? "#fffbe6" : "transparent"; }}
              >
                <td style={{...tdStyles, textAlign: "center" }}>{item.orden}</td>
                <td style={tdStyles}>{item.cargo}</td>
                <td style={tdStyles}>{item.turno}</td>
                <td style={{...tdStyles, textAlign: "center" }}>{item.curso} {item.division}</td>
                <td style={tdStyles}>{item.asignatura}</td>
                <td style={{...tdStyles, textAlign: "center" }}>{item.carga_horaria}</td>
                <td style={tdStyles}>{formatPlazas(item.plazas, item.id)}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="7" style={{ ...tdStyles, padding: "20px", textAlign: "center" }}>No se encontraron registros.</td></tr>
          )}
        </tbody>
        {filteredData.length > 0 && (
          <tfoot>
            <tr style={{ backgroundColor: isPrint ? "#f2f2f2" : "#e0e0e0", fontWeight: "bold" }}>
              <td colSpan="5" style={{ ...tdStyles, textAlign: "right" }}>TOTAL HORAS:</td>
              <td style={{ ...tdStyles, textAlign: "center" }}>{totalHs}</td>
              <td style={tdStyles}></td>
            </tr>
          </tfoot>
        )}
      </table>
    );
  };

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      {!showPrintPreview && (
        <>
          <h2>CÓDIGOS DOCENTES</h2>

          {/* Botones de Acción */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0' }}>
            <button 
              onClick={() => { setMode("create"); setFormData(initialFormState); setSelectedId(null); }} 
              style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
            >
              NUEVO
            </button>
            <button 
              onClick={() => { setMode("edit"); setSelectedId(null); }} 
              style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
            >
              MODIFICAR
            </button>
            <button 
              onClick={() => { setMode("delete"); setSelectedId(null); }} 
              style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
            >
              ELIMINAR
            </button>
            <button 
              onClick={() => setShowPrintPreview(true)} 
              style={{ backgroundColor: 'yellow', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
            >
              IMPRIMIR
            </button>
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
            <select value={filters.cargo} onChange={e => setFilters({...filters, cargo: e.target.value})} style={{ padding: '5px' }}>
              <option value="">Todos los Cargos</option>
              {getUniqueOptions("cargo").map(op => <option key={op} value={op}>{op}</option>)}
            </select>
            <select value={filters.turno} onChange={e => setFilters({...filters, turno: e.target.value})} style={{ padding: '5px' }}>
              <option value="">Todos los Turnos</option>          
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Mañana y Tarde">Mañana y Tarde</option>
            </select>
            <select value={filters.curso} onChange={e => setFilters({...filters, curso: e.target.value})} style={{ padding: '5px' }}>
              <option value="">Todos los Cursos</option>
              {getUniqueOptions("curso").map(op => <option key={op} value={op}>{op}</option>)}
            </select>
            <select value={filters.division} onChange={e => setFilters({...filters, division: e.target.value})} style={{ padding: '5px' }}>
              <option value="">Todas las Divisiones</option>
              {getUniqueOptions("division").map(op => <option key={op} value={op}>{op}</option>)}
            </select>
            <select value={filters.asignatura} onChange={e => setFilters({...filters, asignatura: e.target.value})} style={{ padding: '5px', maxWidth: '200px' }}>
              <option value="">Todas las Asignaturas</option>
              {getUniqueOptions("asignatura").map(op => <option key={op} value={op}>{op}</option>)}
            </select>
            <input 
              placeholder="Filtrar por Plaza" 
              value={filters.plazas} 
              onChange={e => setFilters({...filters, plazas: e.target.value})} 
              style={{ padding: '5px' }} 
            />
          </div>

          {/* Formulario de Carga/Edición */}
          {(mode === "create" || (mode === "edit" && selectedId)) && (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', margin: '0 auto 20px', maxWidth: '800px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>{mode === "create" ? "Nuevo Código" : "Modificar Código"}</h3>
              <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                
                <label style={{ display: 'flex', flexDirection: 'column' }}>
                  Turno:
                  <select name="turno" value={formData.turno} onChange={handleInputChange} style={{ padding: '8px' }}>
                    <option value="">Seleccione...</option>
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Mañana y Tarde">Mañana y Tarde</option>
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column' }}>
                  Cargo:
                  <select name="cargo" value={formData.cargo} onChange={handleInputChange} style={{ padding: '8px' }}>
                    <option value="">Seleccione...</option>
                    {[
                      "DIRECTOR/A", "SECRETARIO", "AYUDANTE DE SECRETARIA", "PRECEPTOR", 
                      "ASESOR PED.", "DOCENTE", "BIBLIOTECARIO/A", 
                      "AYUDANTE CLASES PRACTICAS (TECN/INFORM)", "AYUDANTE CLASES PRACTICAS (FISICA)", 
                      "PERSONAL AUXILIAR (CAT. 18)", "PERSONAL AUXILIAR (CAT. 15)"
                    ].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column' }}>N° de Ord.: <input name="orden" value={formData.orden} onChange={handleInputChange} style={{ padding: '8px' }} /></label>
                <label style={{ display: 'flex', flexDirection: 'column' }}>Curso: <input name="curso" value={formData.curso} onChange={handleInputChange} style={{ padding: '8px' }} /></label>
                <label style={{ display: 'flex', flexDirection: 'column' }}>División: <input name="division" value={formData.division} onChange={handleInputChange} style={{ padding: '8px' }} /></label>
                <label style={{ display: 'flex', flexDirection: 'column' }}>Asignatura: <input name="asignatura" value={formData.asignatura} onChange={handleInputChange} style={{ padding: '8px' }} /></label>
                <label style={{ display: 'flex', flexDirection: 'column' }}>Carga Horaria: <input name="carga_horaria" value={formData.carga_horaria} onChange={handleInputChange} style={{ padding: '8px' }} /></label>
                
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                  <h4>Plazas</h4>
                  {formData.plazas.map((plaza, index) => (
                    <div key={index} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ minWidth: '60px' }}>Plaza {index + 1}:</label>
                      <input 
                        value={plaza} 
                        onChange={(e) => handlePlazaChange(index, e.target.value)}
                        style={{ flex: 1, padding: '8px' }}
                        placeholder="Ingrese plaza..."
                      />
                    </div>
                  ))}
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                  <button type="submit" style={{ padding: '10px 30px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Guardar</button>
                  <button type="button" onClick={() => { setMode("view"); setSelectedId(null); }} style={{ padding: '10px 30px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </form>
            </div>
          )}

          <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%" }}>
            {mode === "edit" && !selectedId && <div style={{ backgroundColor: '#e6fffa', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid green', borderRadius: '5px' }}>Seleccione un registro de la lista para modificarlo.</div>}
            {mode === "delete" && <div style={{ backgroundColor: '#fff5f5', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid red', borderRadius: '5px' }}>Seleccione un registro de la lista para eliminarlo.</div>}
            {fetchError && (
              <div style={{ backgroundColor: '#fff5f5', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid red', borderRadius: '5px', color: 'red' }}>
                Error al cargar datos: {fetchError}
              </div>
            )}

            {loading ? (
              <p style={{ textAlign: "center", fontWeight: "bold" }}>Cargando datos...</p>
            ) : (
              renderTable(false)
            )}
          </div>
        </>
      )}

      {showPrintPreview && (
        <div className="print-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#555', zIndex: 2000, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div className="print-content" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="print-page">
              <div style={{ borderBottom: '2px solid black', marginBottom: '20px', paddingBottom: '10px', color: 'black' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={logo} alt="Logo" style={{ width: '60px', marginRight: '20px' }} />
                  <div>
                    <h1 style={{ fontSize: '18px', margin: 0, color: 'black' }}>Escuela Secundaria Gobernador Garmendia</h1>
                    <p style={{ fontSize: '12px', margin: 0 }}>CUE: 9001717/00 - Av. de la Soja S/N°</p>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>CÓDIGOS DOCENTES</p>
                  </div>
                </div>
              </div>
              {renderTable(true)}
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

export default DocentesCodigos;
