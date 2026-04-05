import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo REGISTRO DOCENTES1.jpg";
import logo from "../../assets/logos/Logo.png";
import logoMinisterio from "../../assets/logos/Logo MINISTERIO DE EDUCACION.png";
import logoEscuela from "../../assets/logos/Logo ESC. GDIA.png";
import { supabase } from "../../components.css/supabaseClient";

const RegistroDocentesConstanciasAfectaciones = ({ goBack, goHome }) => {
  // --- Estados ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit' | 'view'
  const [autoFill, setAutoFill] = useState(false);
  const [unicoDia, setUnicoDia] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [printMode, setPrintMode] = useState("table"); // 'table' | 'single'

  // --- Filtros ---
  const [filters, setFilters] = useState({
    dni: "", nombre: "", afectacion: "", destino: "", mes: "", anio: ""
  });

  // --- Formulario ---
  const initialForm = {
    fecha_emision: new Date().toISOString().split('T')[0],
    dni_docente: "",
    apellido_docente: "",
    nombre_docente: "",
    afectacion: "",
    fecha_inicio: "",
    fecha_fin: "",
    sede: "",
    sita: "",
    localidad: "",
    departamento: "",
    provincia: "",
    horario_inicio: "",
    horario_fin: "",
    destino: ""
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.from('registro_docentes_constancias_afectaciones').select('*');
      if (error) throw error;
      setData(result || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // --- Lógica Autocompletar ---
  const handleAutocomplete = async () => {
    if (!formData.dni_docente) return;
    
    // 1. Buscar en Legajos
    let { data: legajo } = await supabase
      .from('datos_de_legajo_docentes')
      .select('apellido, nombre')
      .eq('dni', formData.dni_docente)
      .maybeSingle();

    if (legajo) {
      setFormData(prev => ({ ...prev, apellido_docente: legajo.apellido, nombre_docente: legajo.nombre }));
      return;
    }

    // 2. Buscar en tabla local
    const localRecord = data.find(d => d.dni_docente === formData.dni_docente);
    if (localRecord) {
      setFormData(prev => ({ ...prev, apellido_docente: localRecord.apellido_docente, nombre_docente: localRecord.nombre_docente }));
    } else {
      setFormData(prev => ({ ...prev, apellido_docente: "—SIN DATOS ENCONTRADOS—", nombre_docente: "—SIN DATOS ENCONTRADOS—" }));
    }
  };

  useEffect(() => { if (autoFill) handleAutocomplete(); }, [autoFill]);

  // Sincronizar fecha única
  useEffect(() => {
    if (unicoDia && formData.fecha_inicio) {
      setFormData(prev => ({ ...prev, fecha_fin: prev.fecha_inicio }));
    }
  }, [unicoDia, formData.fecha_inicio]);

  // --- CRUD Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { id, created_at, ...payload } = formData;
      // Sanitizar fechas
      if (payload.fecha_emision === "") payload.fecha_emision = null;
      if (payload.fecha_inicio === "") payload.fecha_inicio = null;
      if (payload.fecha_fin === "") payload.fecha_fin = null;

      const { error } = modalMode === "create" 
        ? await supabase.from('registro_docentes_constancias_afectaciones').insert([payload])
        : await supabase.from('registro_docentes_constancias_afectaciones').update(payload).eq('id', selectedId);
      
      if (error) throw error;
      setShowModal(false);
      fetchData();
    } catch (err) { alert("Error al guardar: " + err.message); }
  };

  // --- Helpers de Fecha para Impresión ---
  const getLongDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + 'T12:00:00'); // Evitar problemas de zona horaria
    const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    return `${days[date.getDay()]} ${date.getDate().toString().padStart(2, '0')} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const getMonthName = (monthNum) => {
    const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    return months[parseInt(monthNum) - 1];
  };

  // --- Filtrado ---
  const filteredData = data.filter(d => {
    const fullName = `${d.apellido_docente} ${d.nombre_docente}`.toLowerCase();
    const date = new Date(d.fecha_inicio + 'T12:00:00');
    const itemMes = (date.getMonth() + 1).toString();
    const itemAnio = date.getFullYear().toString();

    return (
      (!filters.dni || d.dni_docente.includes(filters.dni)) &&
      (!filters.nombre || fullName.includes(filters.nombre.toLowerCase())) &&
      (!filters.afectacion || d.afectacion.toLowerCase().includes(filters.afectacion.toLowerCase())) &&
      (!filters.destino || d.destino.toLowerCase().includes(filters.destino.toLowerCase())) &&
      (!filters.mes || itemMes === filters.mes) &&
      (!filters.anio || itemAnio === filters.anio)
    );
  });

  const uniqueMonths = [...new Set(data.map(d => (new Date(d.fecha_inicio + 'T12:00:00').getMonth() + 1).toString()))].sort((a,b) => a-b);
  const uniqueYears = [...new Set(data.map(d => new Date(d.fecha_inicio + 'T12:00:00').getFullYear().toString()))].sort();

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      
      {!showPrint && (
        <>
          <h2>CONSTANCIAS DE AFECTACIONES</h2>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', justifyContent: 'center', marginBottom: '20px' }}>
            <input placeholder="DNI DEL DOCENTE" value={filters.dni} onChange={e => setFilters({...filters, dni: e.target.value})} />
            <input placeholder="APELLIDO Y NOMBRE" value={filters.nombre} onChange={e => setFilters({...filters, nombre: e.target.value})} style={{width: '250px'}} />
            <input placeholder="AFECTACIÓN" value={filters.afectacion} onChange={e => setFilters({...filters, afectacion: e.target.value})} />
            <input placeholder="DESTINO A PRESENTAR" value={filters.destino} onChange={e => setFilters({...filters, destino: e.target.value})} />
            <select value={filters.mes} onChange={e => setFilters({...filters, mes: e.target.value})}>
              <option value="">MES</option>
              {uniqueMonths.map(m => <option key={m} value={m}>{getMonthName(m).toUpperCase()}</option>)}
            </select>
            <select value={filters.anio} onChange={e => setFilters({...filters, anio: e.target.value})}>
              <option value="">AÑO</option>
              {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
            <button onClick={() => { setModalMode("create"); setFormData(initialForm); setAutoFill(false); setUnicoDia(false); setShowModal(true); }} style={{ backgroundColor: 'blue', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>NUEVO</button>
            <button onClick={() => { if(!selectedId) return alert("Seleccione un registro"); setModalMode("edit"); setShowModal(true); }} style={{ backgroundColor: 'green', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>MODIFICAR</button>
            <button onClick={async () => { if(!selectedId) return alert("Seleccione un registro"); if(window.confirm("¿Eliminar?")) { await supabase.from('registro_docentes_constancias_afectaciones').delete().eq('id', selectedId); fetchData(); setSelectedId(null); } }} style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>ELIMINAR</button>
            <button onClick={() => { setPrintMode("table"); setShowPrint(true); }} style={{ backgroundColor: 'yellow', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>IMPRIMIR</button>
          </div>

          {/* Tabla */}
          <div className="contenido-submenu" style={{ width: '98%', maxWidth: '98%', padding: '15px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#333', color: 'white' }}>
                  <th>DNI DEL DOCENTE</th><th>APELLIDO Y NOMBRE DEL DOCENTE</th><th>AFECTACIÓN</th><th>FECHA DE EVENTO</th><th>DESTINO A PRESENTAR</th><th>VISTA</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(d => (
                  <tr key={d.id} onClick={() => { setSelectedId(d.id); setFormData(d); }} style={{ backgroundColor: selectedId === d.id ? '#e3f2fd' : 'transparent', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                    <td style={{textAlign: 'center', padding: '8px'}}>{d.dni_docente}</td>
                    <td>{d.apellido_docente}, {d.nombre_docente}</td>
                    <td>{d.afectacion}</td>
                    <td style={{textAlign: 'center'}}>{d.fecha_inicio === d.fecha_fin ? d.fecha_inicio : `${d.fecha_inicio} al ${d.fecha_fin}`}</td>
                    <td>{d.destino}</td>
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

      {/* Modal Formulario */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', width: '90%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ textAlign: 'center' }}>{modalMode === 'view' ? 'VISTA REGISTRO' : 'FORMULARIO DE AFECTACIÓN'}</h2>
            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
              <label>FECHA DE EMISIÓN: <input type="date" name="fecha_emision" value={formData.fecha_emision} onChange={handleInputChange} disabled={modalMode==='view'} required /></label>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ flex: 1 }}>DNI DEL DOCENTE: <input name="dni_docente" value={formData.dni_docente} onChange={handleInputChange} disabled={modalMode==='view'} required /></label>
                {modalMode !== 'view' && <label style={{ fontSize: '12px', color: 'blue', fontWeight: 'bold', cursor: 'pointer' }}><input type="checkbox" checked={autoFill} onChange={e => setAutoFill(e.target.checked)} /> AUTOCOMPLETAR</label>}
              </div>
              
              <label>APELLIDO: <input name="apellido_docente" value={formData.apellido_docente} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>NOMBRE: <input name="nombre_docente" value={formData.nombre_docente} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label style={{gridColumn: 'span 2'}}>AFECTACIÓN/EVENTO: <input name="afectacion" value={formData.afectacion} onChange={handleInputChange} disabled={modalMode==='view'} style={{width: '100%'}} /></label>
              
              <label>INICIO EVENTO: <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleInputChange} disabled={modalMode==='view'} required /></label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ flex: 1 }}>FIN EVENTO: <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleInputChange} disabled={modalMode==='view' || unicoDia} required /></label>
                {modalMode !== 'view' && <label style={{ fontSize: '12px', fontWeight: 'bold' }}><input type="checkbox" checked={unicoDia} onChange={e => setUnicoDia(e.target.checked)} /> ÚNICO DÍA</label>}
              </div>

              <label>SEDE: <input name="sede" value={formData.sede} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>SITA (DIRECCIÓN): <input name="sita" value={formData.sita} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>LOCALIDAD: <input name="localidad" value={formData.localidad} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>DEPARTAMENTO: <input name="departamento" value={formData.departamento} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>PROVINCIA: <input name="provincia" value={formData.provincia} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{flex: 1}}>HORARIO INICIO: <input type="time" name="horario_inicio" value={formData.horario_inicio} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
                <label style={{flex: 1}}>HORARIO FIN: <input type="time" name="horario_fin" value={formData.horario_fin} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              </div>

              <label style={{gridColumn: 'span 2'}}>DESTINO A PRESENTAR: <input name="destino" value={formData.destino} onChange={handleInputChange} disabled={modalMode==='view'} style={{width: '100%'}} /></label>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
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
            
            <div className="print-page" style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white', padding: '1cm', boxShadow: '0 0 10px rgba(0,0,0,0.5)', boxSizing: 'border-box' }}>
              
              {printMode === 'table' ? (
                <div style={{ color: 'black' }}>
                  <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                    <img src={logo} alt="Logo" style={{ width: '60px', marginRight: '20px' }} />
                    <div>
                      <h1 style={{ fontSize: '18px', margin: 0 }}>Escuela Secundaria Gobernador Garmendia</h1>
                      <p style={{ fontSize: '12px', margin: 0 }}>CUE: 9001717/00 - Av. de la Soja S/N°</p>
                      <p style={{ fontWeight: 'bold' }}>Reporte de Constancias de Afectaciones</p>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#eee', border: '1px solid black' }}>
                        <th>DNI</th><th>DOCENTE</th><th>AFECTACIÓN</th><th>FECHA EVENTO</th><th>DESTINO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map(d => (
                        <tr key={d.id} style={{ border: '1px solid black' }}>
                          <td style={{textAlign: 'center', padding: '5px'}}>{d.dni_docente}</td>
                          <td>{d.apellido_docente}, {d.nombre_docente}</td>
                          <td>{d.afectacion}</td>
                          <td style={{textAlign: 'center'}}>{d.fecha_inicio} al {d.fecha_fin}</td>
                          <td>{d.destino}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ color: 'black', fontFamily: 'Arial', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1cm' }}>
                    <img src={logoMinisterio} alt="Min" style={{ width: '7cm', height: '4cm', objectFit: 'contain' }} />
                    <img src={logoEscuela} alt="Esc" style={{ width: '8cm', height: '4cm', objectFit: 'contain' }} />
                  </div>

                  <div style={{ textAlign: 'left', marginBottom: '1cm', fontSize: '12pt' }}>
                    {(() => {
                      const [y, m, d] = formData.fecha_emision.split('-');
                      return `GOBERNADOR GARMENDIA, ${d} de ${getMonthName(m)} de ${y}`;
                    })()}
                  </div>

                  <h1 style={{ textAlign: 'center', fontSize: '18pt', fontWeight: 'bold', margin: '1cm 0', color: 'black', display: 'block' }}>CONSTANCIA DE AFECTACIÓN</h1>

                  <div style={{ fontSize: '12pt', textAlign: 'justify', lineHeight: '1.15' }}>
                    <p style={{ textIndent: '1.5cm', marginBottom: '1.2em' }}>
                      Por la presente, la DIRECCION DE LA ESCUELA SECUNDARIA GOBERNADOR GARMENDIA, deja constancia que el/la profesor/a <strong>{(formData.apellido_docente + ' ' + formData.nombre_docente).toUpperCase()}</strong>, DNI N° <strong>{formData.dni_docente}</strong>, se encuentra afectado/a a <strong>{formData.afectacion.toUpperCase()}</strong> que se realizará 
                      {formData.fecha_inicio === formData.fecha_fin ? (
                        <> el día <strong>{getLongDate(formData.fecha_inicio)}</strong></>
                      ) : (
                        <> del <strong>{getLongDate(formData.fecha_inicio)}</strong> al <strong>{getLongDate(formData.fecha_fin)}</strong></>
                      )}, en sede <strong>{formData.sede?.toUpperCase()}</strong>, sita <strong>{formData.sita?.toUpperCase()}</strong>, Localidad <strong>{formData.localidad?.toUpperCase()}</strong>, Departamento <strong>{formData.departamento?.toUpperCase()}</strong>, Provincia <strong>{formData.provincia?.toUpperCase()}</strong>, de <strong>{formData.horario_inicio}</strong> a <strong>{formData.horario_fin}</strong> hs.
                    </p>

                    <p style={{ textIndent: '1.5cm' }}>
                      Se extiende la presente constancia en la Localidad de Gobernador Garmendia – Departamento Burruyacu – Provincia de Tucumán, para ser presentada ante <strong>{formData.destino.toUpperCase()}</strong>, a los {(() => {
                        const [y, m, d] = formData.fecha_emision.split('-');
                        return `${d} días del mes de ${getMonthName(m)} del año ${y}`;
                      })()}. –
                    </p>
                  </div>

                  <div style={{ marginTop: '5cm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10pt' }}>
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

            <div className="no-print" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button onClick={() => window.print()} style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>GUARDAR COMO PDF</button>
              <button onClick={() => window.print()} style={{ padding: '10px 20px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>IMPRIMIR</button>
              <button onClick={() => setShowPrint(false)} style={{ padding: '10px 20px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>CANCELAR</button>
            </div>
          </div>

          <style>{`
            @media print {
              /* Ocultar barra de navegación, fondos y elementos de la interfaz de la web */
              .navbar, .no-print, h2, .contenido-submenu { display: none !important; }
              .pagina-submenu { background-image: none !important; padding: 0 !important; margin: 0 !important; }

              /* Ocultar todo el contenido del body y mostrar solo el overlay */
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
                width: 210mm !important; 
                padding: 1cm 1.5cm !important; 
                box-sizing: border-box !important;
              }
              
              html, body { height: 100% !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; background: white !important; }
              @page { margin: 0; size: ${printMode === 'table' ? 'A4 landscape' : 'A4 portrait'}; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default RegistroDocentesConstanciasAfectaciones;