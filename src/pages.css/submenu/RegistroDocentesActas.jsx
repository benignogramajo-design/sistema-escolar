import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo REGISTRO DOCENTES1.jpg";
import logo from "../../assets/logos/Logo.png";
import { supabase } from "../../components.css/supabaseClient";

const RegistroDocentesActas = ({ goBack, goHome }) => {
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
    libro: "", folio: "", acta: "", causal: "", nombre: "", asignatura: "", anio: ""
  });

  // --- Formulario ---
  const initialForm = {
    libro: "", acta: "", folios: [""], fecha: "", causal: "",
    dni_docente: "", apellido_docente: "", nombre_docente: "",
    asignaturas: [""], observaciones: ""
  };
  const [formData, setFormData] = useState(initialForm);

  const causalesList = ["ALTA", "TOMA", "CESE", "BAJA", "OFRECIMIENTO", "CONTINUIDAD", "ADSCRIPCIÓN", "REUBICACIÓN", "REUNIÓN", "OTROS"];
  const requiresDocente = ["ALTA", "TOMA", "CESE", "BAJA", "CONTINUIDAD", "ADSCRIPCIÓN", "REUBICACIÓN"];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.from('registro_docentes_actas').select('*');
      if (error) throw error;
      setData(result || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // --- Autocompletado ---
  const handleAutocomplete = async () => {
    if (!formData.dni_docente) return;
    const { data: legajo } = await supabase.from('datos_de_legajo_docentes').select('apellido, nombre').eq('dni', formData.dni_docente).maybeSingle();
    if (legajo) {
      setFormData(prev => ({ ...prev, apellido_docente: legajo.apellido, nombre_docente: legajo.nombre }));
    } else {
      const local = data.find(d => d.dni_docente === formData.dni_docente);
      if (local) setFormData(prev => ({ ...prev, apellido_docente: local.apellido_docente, nombre_docente: local.nombre_docente }));
      else setFormData(prev => ({ ...prev, apellido_docente: "—SIN DATOS ENCONTRADOS—", nombre_docente: "—SIN DATOS ENCONTRADOS—" }));
    }
  };
  useEffect(() => { if (autoFill) handleAutocomplete(); }, [autoFill]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData(prev => ({ ...prev, [field]: newList }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      folios: formData.folios.filter(f => f.trim() !== ""),
      asignaturas: formData.asignaturas.filter(a => a.trim() !== ""),
      observaciones: formData.observaciones.trim() || "---"
    };
    if (payload.fecha === "") payload.fecha = null;
    try {
      if (modalMode === "create") await supabase.from('registro_docentes_actas').insert([payload]);
      else {
        const { id, created_at, ...updateData } = payload;
        await supabase.from('registro_docentes_actas').update(updateData).eq('id', selectedId);
      }
      setShowModal(false); fetchData();
    } catch (e) { alert("Error al guardar"); }
  };

  const filteredData = data.filter(d => {
    const fullName = `${d.apellido_docente} ${d.nombre_docente}`.toLowerCase();
    const anio = d.fecha ? d.fecha.split('-')[0] : "";
    return (
      (!filters.libro || d.libro.toLowerCase().includes(filters.libro.toLowerCase())) &&
      (!filters.folio || d.folios?.some(f => f.includes(filters.folio))) &&
      (!filters.acta || d.acta.includes(filters.acta)) &&
      (!filters.causal || d.causal.includes(filters.causal.toUpperCase())) &&
      (!filters.nombre || fullName.includes(filters.nombre.toLowerCase())) &&
      (!filters.asignatura || d.asignaturas?.some(a => a.toLowerCase().includes(filters.asignatura.toLowerCase()))) &&
      (!filters.anio || anio.includes(filters.anio))
    );
  }).sort((a, b) => {
    if (a.libro !== b.libro) return a.libro.localeCompare(b.libro, undefined, { numeric: true });
    const fA = a.folios?.[0] || ""; const fB = b.folios?.[0] || "";
    if (fA !== fB) return fA.localeCompare(fB, undefined, { numeric: true });
    return a.acta.localeCompare(b.acta, undefined, { numeric: true });
  });

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />

      {!showPrint && (
        <>
          <h2>REGISTRO DE ACTAS</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', justifyContent: 'center', marginBottom: '20px' }}>
            {['libro', 'folio', 'acta', 'causal', 'nombre', 'asignatura', 'anio'].map(f => (
              <input key={f} placeholder={f.replace('_', ' ').toUpperCase()} value={filters[f]} onChange={e => setFilters({ ...filters, [f]: e.target.value })} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
            <button onClick={() => { setModalMode("create"); setFormData(initialForm); setAutoFill(false); setShowModal(true); }} style={{ backgroundColor: 'blue', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>NUEVO</button>
            <button onClick={() => { if (!selectedId) return alert("Seleccione registro"); setModalMode("edit"); setShowModal(true); }} style={{ backgroundColor: 'green', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>MODIFICAR</button>
            <button onClick={async () => { if (!selectedId) return alert("Seleccione registro"); if (window.confirm("¿Eliminar?")) { await supabase.from('registro_docentes_actas').delete().eq('id', selectedId); fetchData(); setSelectedId(null); } }} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>ELIMINAR</button>
            <button onClick={() => { setPrintMode("table"); setShowPrint(true); }} style={{ backgroundColor: 'yellow', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>IMPRIMIR</button>
          </div>

          <div className="contenido-submenu" style={{ width: '98%', maxWidth: '98%', padding: '15px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#333', color: 'white' }}>
                  <th>LIBRO</th><th>ACTA</th><th>FOLIO</th><th>FECHA</th><th>CAUSAL</th><th>APELLIDO Y NOMBRE</th><th>ASIGNATURA</th><th>VISTA</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(d => (
                  <tr key={d.id} onClick={() => { setSelectedId(d.id); setFormData(d); }} style={{ backgroundColor: selectedId === d.id ? '#e3f2fd' : 'transparent', cursor: 'pointer' }}>
                    <td style={{ textAlign: 'center' }}>{d.libro}</td>
                    <td style={{ textAlign: 'center' }}>{d.acta}</td>
                    <td style={{ textAlign: 'center' }}>{d.folios?.join(', ')}</td>
                    <td style={{ textAlign: 'center' }}>{d.fecha || '---'}</td>
                    <td>{d.causal}</td>
                    <td>{requiresDocente.includes(d.causal) ? `${d.apellido_docente}, ${d.nombre_docente}` : '---'}</td>
                    <td>{requiresDocente.includes(d.causal) ? d.asignaturas?.join(' | ') : '---'}</td>
                    <td>
                      <button onClick={() => { setFormData(d); setModalMode("view"); setShowModal(true); }} style={{ backgroundColor: 'skyblue', border: 'none', padding: '3px 8px', marginRight: '5px', cursor: 'pointer' }}>VER</button>
                      <button onClick={() => { setFormData(d); setPrintMode("single"); setShowPrint(true); }} style={{ backgroundColor: 'yellow', border: 'none', padding: '3px 8px', cursor: 'pointer' }}>IMPRIMIR</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ textAlign: 'center' }}>{modalMode === 'view' ? 'VISTA REGISTRO' : 'FORMULARIO DE ACTA'}</h2>
            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <label>LIBRO: <input name="libro" value={formData.libro} onChange={handleInputChange} disabled={modalMode === 'view'} required /></label>
              <label>ACTA: <input name="acta" value={formData.acta} onChange={handleInputChange} disabled={modalMode === 'view'} required /></label>
              <div style={{ gridColumn: '1 / -1', border: '1px solid #ddd', padding: '10px' }}>
                <strong>FOLIOS:</strong>
                {formData.folios.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                    <input value={f} onChange={e => handleArrayChange('folios', i, e.target.value)} disabled={modalMode === 'view'} />
                    {i > 0 && modalMode !== 'view' && <button type="button" onClick={() => setFormData({ ...formData, folios: formData.folios.filter((_, idx) => idx !== i) })}>X</button>}
                  </div>
                ))}
                {modalMode !== 'view' && <button type="button" onClick={() => setFormData({ ...formData, folios: [...formData.folios, ""] })}>+ Agregar Folio</button>}
              </div>
              <label>FECHA: <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} disabled={modalMode === 'view'} /></label>
              <label>CAUSAL:
                <select name="causal" value={formData.causal} onChange={handleInputChange} disabled={modalMode === 'view'} required>
                  <option value="">Seleccione...</option>
                  {causalesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              {requiresDocente.includes(formData.causal) && (
                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', backgroundColor: '#f9f9f9', padding: '15px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ flex: 1 }}>DNI: <input name="dni_docente" value={formData.dni_docente} onChange={handleInputChange} disabled={modalMode === 'view'} /></label>
                    {modalMode !== 'view' && <label style={{ fontSize: '12px', color: 'blue', fontWeight: 'bold' }}><input type="checkbox" checked={autoFill} onChange={e => setAutoFill(e.target.checked)} /> AUTOCOMPLETAR</label>}
                  </div>
                  <label>APELLIDO: <input name="apellido_docente" value={formData.apellido_docente} onChange={handleInputChange} disabled={modalMode === 'view'} /></label>
                  <label>NOMBRE: <input name="nombre_docente" value={formData.nombre_docente} onChange={handleInputChange} disabled={modalMode === 'view'} /></label>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>ASIGNATURAS:</strong>
                    {formData.asignaturas.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                        <input value={a} onChange={e => handleArrayChange('asignaturas', i, e.target.value)} disabled={modalMode === 'view'} style={{ width: '100%' }} />
                        {i > 0 && modalMode !== 'view' && <button type="button" onClick={() => setFormData({ ...formData, asignaturas: formData.asignaturas.filter((_, idx) => idx !== i) })}>X</button>}
                      </div>
                    ))}
                    {modalMode !== 'view' && <button type="button" onClick={() => setFormData({ ...formData, asignaturas: [...formData.asignaturas, ""] })}>+ Agregar Asignatura</button>}
                  </div>
                </div>
              )}

              <label style={{ gridColumn: '1 / -1' }}>OBSERVACIONES: <textarea name="observaciones" value={formData.observaciones} onChange={handleInputChange} disabled={modalMode === 'view'} rows="3" style={{ width: '100%' }} /></label>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                {modalMode !== 'view' && <button type="submit" style={{ padding: '10px 40px', backgroundColor: 'blue', color: 'white' }}>GUARDAR</button>}
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 40px', backgroundColor: 'gray', color: 'white' }}>{modalMode === 'view' ? 'CERRAR' : 'CANCELAR'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPrint && (
        <div className="print-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#eee', zIndex: 2000, overflowY: 'auto' }}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="print-page" style={{ width: printMode === 'table' ? '297mm' : '210mm', minHeight: '100px', backgroundColor: 'white', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '15px' }}>
                <img src={logo} alt="Logo" style={{ width: '60px', marginRight: '20px' }} />
                <div style={{ color: 'black' }}>
                  <h1 style={{ fontSize: '18px', margin: 0 }}>Escuela Secundaria Gobernador Garmendia</h1>
                  <p style={{ fontSize: '12px', margin: 0 }}>CUE: 9001717/00 - Av. de la Soja S/N°</p>
                  <p style={{ fontWeight: 'bold' }}>{printMode === 'table' ? 'Reporte General de Actas' : 'Detalle de Acta Individual'}</p>
                </div>
              </div>
              {printMode === 'table' ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#eee', border: '1px solid black' }}>
                      <th>LIBRO</th><th>ACTA</th><th>FOLIO</th><th>FECHA</th><th>CAUSAL</th><th>DOCENTE</th><th>ASIGNATURAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(d => (
                      <tr key={d.id} style={{ border: '1px solid black' }}>
                        <td style={{ textAlign: 'center' }}>{d.libro}</td>
                        <td style={{ textAlign: 'center' }}>{d.acta}</td>
                        <td style={{ textAlign: 'center' }}>{d.folios?.join(', ')}</td>
                        <td style={{ textAlign: 'center' }}>{d.fecha}</td>
                        <td>{d.causal}</td>
                        <td>{requiresDocente.includes(d.causal) ? `${d.apellido_docente}, ${d.nombre_docente}` : ''}</td>
                        <td>{d.asignaturas?.join(' | ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ color: 'black', lineHeight: '2' }}>
                  <p><strong>LIBRO:</strong> {formData.libro} <strong>ACTA:</strong> {formData.acta} <strong>FOLIO(S):</strong> {formData.folios?.join(', ')}</p>
                  <p><strong>FECHA:</strong> {formData.fecha || '---'} <strong>CAUSAL:</strong> {formData.causal}</p>
                  {requiresDocente.includes(formData.causal) && (
                    <>
                      <p><strong>DOCENTE:</strong> {formData.apellido_docente}, {formData.nombre_docente} (DNI: {formData.dni_docente})</p>
                      <p><strong>ASIGNATURAS:</strong> {formData.asignaturas?.join(', ')}</p>
                    </>
                  )}
                  <p><strong>OBSERVACIONES:</strong> {formData.observaciones}</p>
                </div>
              )}
            </div>
            <div className="no-print" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button onClick={() => window.print()} style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white' }}>GUARDAR COMO PDF</button>
              <button onClick={() => window.print()} style={{ padding: '10px 20px', backgroundColor: 'green', color: 'white' }}>IMPRIMIR</button>
              <button onClick={() => setShowPrint(false)} style={{ padding: '10px 20px', backgroundColor: 'red', color: 'white' }}>CANCELAR</button>
            </div>
          </div>
          <style>{`
            @media print {
              .no-print { display: none !important; }
              body { background: white !important; }
              .print-overlay { position: static; background: white; }
              .print-page { box-shadow: none !important; width: 100% !important; margin: 0 !important; }
              @page { margin: 1cm; size: ${printMode === 'table' ? 'A4 landscape' : 'A4 portrait'}; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default RegistroDocentesActas;
