import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets.css/logos/Logo.png";

const NumeroDeBoletas = ({ goBack, goHome }) => {
  const [boletas, setBoletas] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [estructura, setEstructura] = useState([]);
  const [docentesLegajo, setDocentesLegajo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [mode, setMode] = useState("view"); // 'view', 'create', 'edit'
  const [selectedId, setSelectedId] = useState(null);

  // Estado del formulario
  const initialFormState = {
    cargo: "",
    apellido_nombre: "",
    curso: "",
    division: "",
    asignatura: "",
    turno: "",
    caracter: "",
    numero_boleta_suffix: "", // Solo la parte editable después de "3518-"
    estado: ""
  };
  const [formData, setFormData] = useState(initialFormState);

  // Filtros
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

  const cargosList = [
    "DIRECTOR/A", "SECRETARIO", "AYUDANTE DE SECRETARIA", "PRECEPTOR",
    "ASESOR PED.", "DOCENTE", "BIBLIOTECARIO/A",
    "AYUDANTE CLASES PRACTICAS (TECN/INFORM)", "AYUDANTE CLASES PRACTICAS (FISICA)",
    "PERSONAL AUXILIAR (CAT. 18)", "PERSONAL AUXILIAR (CAT. 15)"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Obtener Boletas existentes
      const { data: boletasData, error: boletasError } = await supabase
        .from('numero_de_boletas')
        .select('*')
        .order('id', { ascending: false });
      if (boletasError && boletasError.code !== 'PGRST116') throw boletasError;
      setBoletas(boletasData || []);

      // 2. Obtener Códigos (para listas desplegables)
      const { data: codigosData, error: codigosError } = await supabase
        .from('codigos')
        .select('*');
      if (codigosError) throw codigosError;
      setCodigos(codigosData || []);

      // 3. Obtener Estructura de Horario (para autocompletar datos)
      const { data: estData, error: estError } = await supabase
        .from('estructura_horario')
        .select('*');
      if (estError && estError.code !== 'PGRST116') throw estError;

      // Procesar estructura para asegurar JSON válido
      const parsedEst = (estData || []).map(item => ({
        ...item,
        docente_titular: typeof item.docente_titular === 'string' ? JSON.parse(item.docente_titular) : item.docente_titular,
        docente_interino: typeof item.docente_interino === 'string' ? JSON.parse(item.docente_interino) : item.docente_interino,
        docentes_suplentes: typeof item.docentes_suplentes === 'string' ? JSON.parse(item.docentes_suplentes) : item.docentes_suplentes
      }));
      setEstructura(parsedEst);

      // 4. Obtener Docentes de Legajo (para lista desplegable)
      const { data: docData, error: docError } = await supabase
        .from('datos_de_legajo_docentes')
        .select('apellido, nombre')
        .order('apellido');
      if (docError) throw docError;
      setDocentesLegajo(docData || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica del Formulario: Autocompletado ---
  useEffect(() => {
    if (formData.cargo && formData.apellido_nombre) {
      // Buscar en estructura horario coincidencias
      // Filtramos por cargo primero
      let matches = estructura.filter(e => e.cargo === formData.cargo);

      if (formData.cargo === "DOCENTE") {
        if (formData.curso) matches = matches.filter(e => e.curso === formData.curso);
        if (formData.division) matches = matches.filter(e => e.division === formData.division);
        if (formData.asignatura) matches = matches.filter(e => e.asignatura === formData.asignatura);
      }

      // Buscar el docente específico en los matches
      const docenteMatch = matches.find(m => {
        const nombre = formData.apellido_nombre;
        const isTitular = m.docente_titular?.nombre === nombre;
        const isInterino = m.docente_interino?.nombre === nombre;
        const isSuplente = Array.isArray(m.docentes_suplentes) && m.docentes_suplentes.some(s => s.nombre === nombre);
        return isTitular || isInterino || isSuplente;
      });

      if (docenteMatch) {
        // Determinar Carácter y Estado
        let caracter = "";
        let estado = "";
        const nombre = formData.apellido_nombre;

        if (docenteMatch.docente_titular?.nombre === nombre) {
          caracter = "TITULAR";
          estado = docenteMatch.docente_titular.estado;
        } else if (docenteMatch.docente_interino?.nombre === nombre) {
          caracter = "INTERINO";
          estado = docenteMatch.docente_interino.estado;
        } else if (Array.isArray(docenteMatch.docentes_suplentes)) {
          const sup = docenteMatch.docentes_suplentes.find(s => s.nombre === nombre);
          if (sup) {
            caracter = "SUPLENTE";
            estado = sup.estado;
          }
        }

        setFormData(prev => ({
          ...prev,
          turno: docenteMatch.turno || "",
          caracter: caracter,
          estado: estado || ""
        }));
      } else {
        // Si no encuentra coincidencia exacta, limpiar campos autocompletados
        setFormData(prev => ({ ...prev, turno: "", caracter: "", estado: "" }));
      }
    }
  }, [formData.cargo, formData.apellido_nombre, formData.curso, formData.division, formData.asignatura, estructura]);

  // --- Listas para Selects del Formulario ---
  // Docentes disponibles (desde datos de legajo)
  const availableDocentes = [...new Set(docentesLegajo.map(d => `${d.apellido}, ${d.nombre}`))].sort();

  const availableCursos = [...new Set(codigos.map(c => c.curso).filter(Boolean))].sort();
  
  // Divisiones filtradas por curso seleccionado
  const availableDivisiones = formData.curso 
    ? [...new Set(codigos.filter(c => c.curso === formData.curso).map(c => c.division).filter(Boolean))].sort()
    : [];

  // Asignaturas filtradas por curso y división
  const availableAsignaturas = (formData.curso && formData.division)
    ? [...new Set(codigos.filter(c => c.curso === formData.curso && c.division === formData.division).map(c => c.asignatura).filter(Boolean))].sort()
    : [];

  // --- Manejadores ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const fullBoleta = `3518-${formData.numero_boleta_suffix}`;
    
    const payload = {
      cargo: formData.cargo,
      apellido_nombre: formData.apellido_nombre,
      curso: formData.cargo === "DOCENTE" ? formData.curso : null,
      division: formData.cargo === "DOCENTE" ? formData.division : null,
      asignatura: formData.cargo === "DOCENTE" ? formData.asignatura : null,
      turno: formData.turno,
      caracter: formData.caracter,
      numero_boleta: fullBoleta,
      estado: formData.estado
    };

    try {
      if (mode === "create") {
        const { error } = await supabase.from('numero_de_boletas').insert([payload]);
        if (error) throw error;
      } else if (mode === "edit" && selectedId) {
        const { error } = await supabase.from('numero_de_boletas').update(payload).eq('id', selectedId);
        if (error) throw error;
      }
      await fetchData();
      setMode("view");
      setFormData(initialFormState);
      setSelectedId(null);
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) {
      alert("Seleccione un registro para eliminar.");
      return;
    }
    if (window.confirm("¿Está seguro de eliminar este registro?")) {
      try {
        const { error } = await supabase.from('numero_de_boletas').delete().eq('id', selectedId);
        if (error) throw error;
        await fetchData();
        setSelectedId(null);
      } catch (error) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  const handleRowClick = (item) => {
    setSelectedId(item.id);
    if (mode === "edit") {
      const suffix = item.numero_boleta ? item.numero_boleta.replace("3518-", "") : "";
      setFormData({
        cargo: item.cargo || "",
        apellido_nombre: item.apellido_nombre || "",
        curso: item.curso || "",
        division: item.division || "",
        asignatura: item.asignatura || "",
        turno: item.turno || "",
        caracter: item.caracter || "",
        numero_boleta_suffix: suffix,
        estado: item.estado || ""
      });
    }
  };

  // --- Filtros ---
  const filteredData = boletas.filter(item => {
    const f = filters;
    return (
      (!f.cargo || item.cargo === f.cargo) &&
      (!f.apellido_nombre || (item.apellido_nombre || "").toLowerCase().includes(f.apellido_nombre.toLowerCase())) &&
      (!f.curso || item.curso === f.curso) &&
      (!f.division || item.division === f.division) &&
      (!f.asignatura || (item.asignatura || "").toLowerCase().includes(f.asignatura.toLowerCase())) &&
      (!f.turno || item.turno === f.turno) &&
      (!f.caracter || item.caracter === f.caracter) &&
      (!f.numero_boleta || (item.numero_boleta || "").includes(f.numero_boleta)) &&
      (!f.estado || item.estado === f.estado)
    );
  });

  // --- Renderizado ---
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      
      {!showPrintPreview && (
        <>
          <h2>N° DE BOLETAS</h2>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
            <select value={filters.cargo} onChange={e => setFilters({...filters, cargo: e.target.value})} style={{ padding: '5px' }}>
              <option value="">CARGO</option>
              {cargosList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="APELLIDO Y NOMBRE" value={filters.apellido_nombre} onChange={e => setFilters({...filters, apellido_nombre: e.target.value})} style={{ padding: '5px' }} />
            <input placeholder="CURSO" value={filters.curso} onChange={e => setFilters({...filters, curso: e.target.value})} style={{ padding: '5px', width: '60px' }} />
            <input placeholder="DIVISIÓN" value={filters.division} onChange={e => setFilters({...filters, division: e.target.value})} style={{ padding: '5px', width: '70px' }} />
            <input placeholder="ASIGNATURA" value={filters.asignatura} onChange={e => setFilters({...filters, asignatura: e.target.value})} style={{ padding: '5px' }} />
            <select value={filters.turno} onChange={e => setFilters({...filters, turno: e.target.value})} style={{ padding: '5px' }}>
              <option value="">TURNO</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
            </select>
            <input placeholder="CARÁCTER" value={filters.caracter} onChange={e => setFilters({...filters, caracter: e.target.value})} style={{ padding: '5px' }} />
            <input placeholder="N° BOLETA" value={filters.numero_boleta} onChange={e => setFilters({...filters, numero_boleta: e.target.value})} style={{ padding: '5px' }} />
            <select value={filters.estado} onChange={e => setFilters({...filters, estado: e.target.value})} style={{ padding: '5px' }}>
              <option value="">ESTADO</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="NO ACTIVO">NO ACTIVO</option>
            </select>
          </div>

          {/* Botones de Acción */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
            <button onClick={() => { setMode("create"); setFormData(initialFormState); setSelectedId(null); }} style={{ backgroundColor: 'blue', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>NUEVO</button>
            <button onClick={() => { setMode("edit"); if(!selectedId) alert("Seleccione un registro"); }} style={{ backgroundColor: 'green', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>MODIFICAR</button>
            <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>ELIMINAR</button>
            <button onClick={() => setShowPrintPreview(true)} style={{ backgroundColor: 'yellow', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>IMPRIMIR</button>
          </div>

          {/* Formulario */}
          {(mode === "create" || (mode === "edit" && selectedId)) && (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', margin: '0 auto 20px', maxWidth: '800px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>{mode === "create" ? "Nueva Boleta" : "Modificar Boleta"}</h3>
              <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                
                <label style={{ gridColumn: '1 / -1' }}>CARGO:
                  <select name="cargo" value={formData.cargo} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }}>
                    <option value="">Seleccione...</option>
                    {cargosList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>

                <label style={{ gridColumn: '1 / -1' }}>APELLIDO Y NOMBRE:
                  <select name="apellido_nombre" value={formData.apellido_nombre} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }}>
                    <option value="">Seleccione...</option>
                    {availableDocentes.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>

                {formData.cargo === "DOCENTE" && (
                  <>
                    <label>CURSO:
                      <select name="curso" value={formData.curso} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }}>
                        <option value="">Seleccione...</option>
                        {availableCursos.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                    <label>DIVISIÓN:
                      <select name="division" value={formData.division} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }}>
                        <option value="">Seleccione...</option>
                        {availableDivisiones.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </label>
                    <label style={{ gridColumn: '1 / -1' }}>ASIGNATURA:
                      <select name="asignatura" value={formData.asignatura} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }}>
                        <option value="">Seleccione...</option>
                        {availableAsignaturas.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </label>
                  </>
                )}

                <label>TURNO: <input name="turno" value={formData.turno} readOnly style={{ width: '100%', padding: '5px', backgroundColor: '#eee' }} /></label>
                <label>CARÁCTER: <input name="caracter" value={formData.caracter} readOnly style={{ width: '100%', padding: '5px', backgroundColor: '#eee' }} /></label>
                
                <label>N° DE BOLETA: 
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '5px' }}>3518-</span>
                    <input name="numero_boleta_suffix" value={formData.numero_boleta_suffix} onChange={handleInputChange} required style={{ flex: 1, padding: '5px' }} />
                  </div>
                </label>
                
                <label>ESTADO: <input name="estado" value={formData.estado} readOnly style={{ width: '100%', padding: '5px', backgroundColor: '#eee' }} /></label>

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                  <button type="submit" style={{ padding: '10px 30px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>GUARDAR</button>
                  <button type="button" onClick={() => { setMode("view"); setSelectedId(null); }} style={{ padding: '10px 30px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>CANCELAR</button>
                </div>
              </form>
            </div>
          )}

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
                      onClick={() => handleRowClick(item)}
                      style={{ 
                        cursor: (mode === "edit" || mode === "delete") ? "pointer" : "default",
                        backgroundColor: selectedId === item.id ? "#fffbe6" : "transparent"
                      }}
                    >
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.cargo}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.apellido_nombre}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.curso || '-'}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.division || '-'}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.asignatura || '-'}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.turno}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.caracter}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.numero_boleta}</td>
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
                      <td style={{ padding: "5px", border: "1px solid #000" }}>{item.numero_boleta}</td>
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