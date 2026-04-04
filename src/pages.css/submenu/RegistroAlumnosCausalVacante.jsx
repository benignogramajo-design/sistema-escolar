import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo REGISTRO ALUMNOS1.jpg";
import logo from "../../assets/logos/Logo.png";
import logoMinisterio from "../../assets/logos/Logo MINISTERIO DE EDUCACION.png";
import logoEscuela from "../../assets/logos/Logo ESC. GDIA.png";
import { supabase } from "../../components.css/supabaseClient";

const RegistroAlumnosCausalVacante = ({ goBack, goHome }) => {
  // --- Estados ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit' | 'view'
  const [selectedId, setSelectedId] = useState(null);
  const [autoFill, setAutoFill] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [printMode, setPrintMode] = useState("table"); // 'table' | 'single'

  // --- Filtros ---
  const [filters, setFilters] = useState({
    nombre: "",
    dni: "",
    institucion: "",
    ciclo: ""
  });

  // --- Formulario ---
  const initialForm = {
    fecha_emision: new Date().toISOString().split('T')[0],
    dni_alumno: "",
    nombre_alumno: "",
    apellido_alumno: "",
    institucion: ""
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from('registro_alumnos_causal_vacante')
        .select('*')
        .order('fecha_emision', { ascending: false });
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica Autocompletar ---
  const handleAutocomplete = async () => {
    if (!formData.dni_alumno) return;
    
    // 1. Buscar en PreceptoriaCargarDatos (registro_alumnos)
    let { data: alumnoPreceptoria } = await supabase
      .from('registro_alumnos')
      .select('apellido, nombre')
      .eq('dni', formData.dni_alumno)
      .maybeSingle();

    if (alumnoPreceptoria) {
      setFormData(prev => ({
        ...prev,
        apellido_alumno: alumnoPreceptoria.apellido,
        nombre_alumno: alumnoPreceptoria.nombre
      }));
      return;
    }

    // 2. Buscar en tabla local
    const localRecord = data.find(d => d.dni_alumno === formData.dni_alumno);
    if (localRecord) {
      setFormData(prev => ({
        ...prev,
        apellido_alumno: localRecord.apellido_alumno,
        nombre_alumno: localRecord.nombre_alumno
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        apellido_alumno: "—SIN DATOS ENCONTRADOS—",
        nombre_alumno: "—SIN DATOS ENCONTRADOS—"
      }));
    }
  };

  useEffect(() => {
    if (autoFill) handleAutocomplete();
  }, [autoFill]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { id, created_at, ...payload } = formData;
      
      // Sanitización de fecha para evitar error: invalid input syntax for type date: ""
      if (payload.fecha_emision === "") payload.fecha_emision = null;

      if (modalMode === "create") {
        const { error } = await supabase.from('registro_alumnos_causal_vacante').insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('registro_alumnos_causal_vacante').update(payload).eq('id', selectedId);
        if (error) throw error;
      }
      setShowModal(false);
      fetchData();
    } catch (err) { alert("Error al guardar: " + err.message); }
  };

  const handleDelete = async () => {
    if (!selectedId) return alert("Seleccione un registro.");
    if (window.confirm("¿Eliminar registro?")) {
      await supabase.from('registro_alumnos_causal_vacante').delete().eq('id', selectedId);
      fetchData();
      setSelectedId(null);
    }
  };

  // --- Helpers ---
  const formatDate = (dateStr) => {
    if (!dateStr) return "---";
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getMonthName = (monthNumber) => {
    const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    return months[parseInt(monthNumber) - 1];
  };

  const filteredData = data.filter(d => {
    const fullName = `${d.apellido_alumno || ""} ${d.nombre_alumno || ""}`.toLowerCase();
    const ciclo = d.fecha_emision ? d.fecha_emision.split('-')[0] : "";
    return (
      (!filters.nombre || fullName.includes(filters.nombre.toLowerCase())) &&
      (!filters.dni || (d.dni_alumno || "").includes(filters.dni)) &&
      (!filters.institucion || (d.institucion || "").toLowerCase().includes(filters.institucion.toLowerCase())) &&
      (!filters.ciclo || ciclo.includes(filters.ciclo))
    );
  });

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />

      {!showPrint && (
        <>
          <h2>CAUSAL DE VACANTE</h2>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', justifyContent: 'center', marginBottom: '20px' }}>
            <input placeholder="APELLIDO Y NOMBRE" value={filters.nombre} onChange={e => setFilters({ ...filters, nombre: e.target.value })} />
            <input placeholder="DNI" value={filters.dni} onChange={e => setFilters({ ...filters, dni: e.target.value })} />
            <input placeholder="INSTITUCIÓN" value={filters.institucion} onChange={e => setFilters({ ...filters, institucion: e.target.value })} />
            <input placeholder="CICLO LECTIVO" value={filters.ciclo} onChange={e => setFilters({ ...filters, ciclo: e.target.value })} />
          </div>

          {/* Botones de Acción */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
            <button onClick={() => { setModalMode("create"); setFormData(initialForm); setAutoFill(false); setShowModal(true); }} style={{ backgroundColor: 'blue', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>NUEVO</button>
            <button onClick={() => { if (!selectedId) return alert("Seleccione registro"); setModalMode("edit"); setShowModal(true); }} style={{ backgroundColor: 'green', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>MODIFICAR</button>
            <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>ELIMINAR</button>
            <button onClick={() => { setPrintMode("table"); setShowPrint(true); }} style={{ backgroundColor: 'yellow', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>IMPRIMIR</button>
          </div>

          {/* Tabla */}
          <div className="contenido-submenu" style={{ width: '98%', maxWidth: '98%', padding: '15px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#333', color: 'white' }}>
                  <th>FECHA EMISIÓN</th><th>DNI ALUMNO</th><th>APELLIDO Y NOMBRE</th><th>CICLO LECTIVO</th><th>INSTITUCIÓN</th><th>VISTA</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (<tr><td colSpan="6">Cargando...</td></tr>) : filteredData.map(d => (
                  <tr key={d.id} onClick={() => { setSelectedId(d.id); setFormData(d); }} style={{ backgroundColor: selectedId === d.id ? '#e3f2fd' : 'transparent', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                    <td style={{ textAlign: 'center', padding: '8px' }}>{formatDate(d.fecha_emision)}</td>
                    <td style={{ textAlign: 'center' }}>{d.dni_alumno}</td>
                    <td>{d.apellido_alumno}, {d.nombre_alumno}</td>
                    <td style={{ textAlign: 'center' }}>{d.fecha_emision ? d.fecha_emision.split('-')[0] : ""}</td>
                    <td>{d.institucion}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={(e) => { e.stopPropagation(); setFormData(d); setModalMode("view"); setShowModal(true); }} style={{ backgroundColor: 'skyblue', border: 'none', padding: '3px 8px', marginRight: '5px', cursor: 'pointer', fontWeight: 'bold' }}>VER</button>
                      <button onClick={(e) => { e.stopPropagation(); setFormData(d); setPrintMode("single"); setShowPrint(true); }} style={{ backgroundColor: 'yellow', border: 'none', padding: '3px 8px', cursor: 'pointer', fontWeight: 'bold' }}>IMPRIMIR</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Formulario */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', width: '90%', maxWidth: '600px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{modalMode === 'view' ? 'VISTA DE REGISTRO' : (modalMode === 'create' ? 'NUEVO REGISTRO' : 'MODIFICAR REGISTRO')}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label>FECHA DE EMISIÓN DE CONSTANCIA: <input type="date" name="fecha_emision" value={formData.fecha_emision} onChange={handleInputChange} required disabled={modalMode === 'view'} style={{ width: '100%' }} /></label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ flex: 1 }}>DNI DEL ALUMNO: <input name="dni_alumno" value={formData.dni_alumno} onChange={handleInputChange} required disabled={modalMode === 'view'} style={{ width: '100%' }} /></label>
                {modalMode !== 'view' && (
                  <label style={{ fontSize: '12px', color: 'blue', fontWeight: 'bold', cursor: 'pointer' }}>
                    <input type="checkbox" checked={autoFill} onChange={e => setAutoFill(e.target.checked)} /> AUTOCOMPLETAR
                  </label>
                )}
              </div>
              <label>NOMBRE DEL ALUMNO: <input name="nombre_alumno" value={formData.nombre_alumno} onChange={handleInputChange} required disabled={modalMode === 'view'} style={{ width: '100%' }} /></label>
              <label>APELLIDO DEL ALUMNO: <input name="apellido_alumno" value={formData.apellido_alumno} onChange={handleInputChange} required disabled={modalMode === 'view'} style={{ width: '100%' }} /></label>
              <label>INSTITUCIÓN: <input name="institucion" value={formData.institucion} onChange={handleInputChange} required disabled={modalMode === 'view'} style={{ width: '100%' }} /></label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                {modalMode !== 'view' && <button type="submit" style={{ padding: '10px 40px', backgroundColor: 'blue', color: 'white', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>GUARDAR</button>}
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 40px', backgroundColor: 'gray', color: 'white', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>{modalMode === 'view' ? 'CERRAR' : 'CANCELAR'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pantalla de Impresión */}
      {showPrint && (
        <div className="print-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#eee', zIndex: 2000, overflowY: 'auto' }}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="print-page" style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', padding: '1.5cm', boxShadow: '0 0 10px rgba(0,0,0,0.5)', boxSizing: 'border-box' }}>
              
              {printMode === 'table' ? (
                /* --- Impresión de Tabla --- */
                <div style={{ color: 'black' }}>
                  <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                    <img src={logo} alt="Logo" style={{ width: '60px', marginRight: '20px' }} />
                    <div>
                      <h1 style={{ fontSize: '18px', margin: 0 }}>Escuela Secundaria Gobernador Garmendia</h1>
                      <p style={{ fontSize: '12px', margin: 0 }}>CUE: 9001717/00 - Av. de la Soja S/N°</p>
                      <p style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Reporte General - Causal de Vacante</p>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#eee', border: '1px solid black' }}>
                        <th style={{ border: '1px solid black', padding: '5px' }}>FECHA</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>DNI</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>ALUMNO</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>INSTITUCIÓN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map(d => (
                        <tr key={d.id}>
                          <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{formatDate(d.fecha_emision)}</td>
                          <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{d.dni_alumno}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{d.apellido_alumno}, {d.nombre_alumno}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{d.institucion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* --- Impresión de Constancia Individual --- */
                <div style={{ color: 'black', fontFamily: 'Arial', position: 'relative', height: '100%' }}>
                  {/* Logos Superiores */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                    <img src={logoMinisterio} alt="Ministerio" style={{ height: '2.5cm' }} />
                    <img src={logoEscuela} alt="Escuela" style={{ height: '2.5cm' }} />
                  </div>

                  {/* Título */}
                  <h1 style={{ textAlign: 'center', fontSize: '18pt', fontWeight: 'bold', margin: '0 0 1.5cm 0' }}>CONSTANCIA DE VACANTE</h1>

                  {/* Fecha */}
                  <div style={{ marginBottom: '1.5cm', textAlign: 'left' }}>
                    {(() => {
                      const [year, month, day] = formData.fecha_emision.split('-');
                      return `Gobernador Garmendia, ${day} del mes de ${getMonthName(month)} del año ${year}`;
                    })()}
                  </div>

                  {/* Destinatario */}
                  <div style={{ marginBottom: '1.5cm', textAlign: 'left', lineHeight: '1.2' }}>
                    <p style={{ margin: 0 }}>AL DIRECTOR/A DE</p>
                    <p style={{ margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>{formData.institucion}</p>
                    <p style={{ margin: 0 }}>S      /      D</p>
                  </div>

                  {/* Cuerpo */}
                  <div style={{ fontSize: '12pt', textAlign: 'justify', lineHeight: '1.15', textIndent: '1.5cm', marginBottom: '4cm' }}>
                    La dirección de la Escuela Secundaria Gobernador Garmendia informa que el/la joven <strong>{formData.apellido_alumno} {formData.nombre_alumno}</strong>, D.N.I. N° <strong>{formData.dni_alumno}</strong>, cuenta con vacante en nuestra institución, por este motivo solicitamos fotocopia del ANALÍTICO/LIBRO MATRIZ, PASE, INFORME PEDAGÓGICO de la alumno/a, pase de seguro escolar. -
                    <br /><br />
                    Sin otro particular saludo cordialmente. -
                  </div>

                  {/* Footer Firmas */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10pt' }}>
                    <div style={{ width: '5cm', textAlign: 'center' }}>
                      <div style={{ borderTop: '1px dotted black', marginBottom: '5px' }}></div>
                      SELLO DEL ESTABLECIMIENTO
                    </div>
                    <div style={{ width: '7cm', textAlign: 'center' }}>
                      <div style={{ borderTop: '1px dotted black', marginBottom: '5px' }}></div>
                      FIRMA Y SELLO DEL DIRECTOR/A o RESPONSABLE
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controles de Impresión */}
            <div className="no-print" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button onClick={() => window.print()} style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>GUARDAR COMO PDF</button>
              <button onClick={() => window.print()} style={{ padding: '10px 20px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>IMPRIMIR</button>
              <button onClick={() => setShowPrint(false)} style={{ padding: '10px 20px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>CANCELAR</button>
            </div>
          </div>

          <style>{`
            @media print {
              .no-print { display: none !important; }
              body { background: white !important; padding: 0 !important; }
              .print-overlay { position: static; background: white; }
              .print-page { box-shadow: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
              @page { margin: 1.27cm; size: ${printMode === 'table' ? 'A4 landscape' : 'A4 portrait'}; }
            }
          `}`}</style>
        </div>
      )}
    </div>
  );
};

export default RegistroAlumnosCausalVacante;
