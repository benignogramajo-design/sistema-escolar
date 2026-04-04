import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo REGISTRO ALUMNOS1.jpg";
import logo from "../../assets/logos/Logo.png";
import logoMinisterio from "../../assets/logos/Logo MINISTERIO DE EDUCACION.png";
import { supabase } from "../../components.css/supabaseClient";

const RegistroAlumnosBoletoEstudiantil = ({ goBack, goHome }) => {
  // --- Estados ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit' | 'view'
  const [autoFill, setAutoFill] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [printMode, setPrintMode] = useState("table"); // 'table' | 'single'

  // --- Filtros ---
  const [filters, setFilters] = useState({
    alumno: "",
    dni: "",
    curso: "",
    division: "",
    inicio_trayecto: ""
  });

  // --- Formulario ---
  const initialForm = {
    fecha_emision: new Date().toISOString().split('T')[0],
    emitido_por_cargo: "",
    emitido_por_nombre: "",
    dni_alumno: "",
    apellido_alumno: "",
    nombre_alumno: "",
    fecha_nacimiento_alumno: "",
    edad_alumno: "",
    domicilio_alumno: "",
    localidad_alumno: "",
    lugar_nacimiento_alumno: "",
    curso: "",
    division: "",
    inicio_recorrido: "",
    localidad_inicio_recorrido: "",
    linea_colectivo: ""
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from('registro_alumnos_boleto_estudiantil')
        .select('*')
        .order('fecha_emision', { ascending: false });
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica Autocompletar y Edad ---
  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleAutocomplete = async () => {
    if (!formData.dni_alumno) return;
    const { data: alumno } = await supabase
      .from('registro_alumnos')
      .select('*')
      .eq('dni', formData.dni_alumno)
      .maybeSingle();

    if (alumno) {
      setFormData(prev => ({
        ...prev,
        apellido_alumno: alumno.apellido || "",
        nombre_alumno: alumno.nombre || "",
        fecha_nacimiento_alumno: alumno.fecha_nacimiento || "",
        edad_alumno: calculateAge(alumno.fecha_nacimiento),
        domicilio_alumno: alumno.domicilio || "",
        localidad_alumno: alumno.localidad || "",
        lugar_nacimiento_alumno: alumno.lugar_nacimiento || "",
        curso: alumno.curso || "",
        division: alumno.division || ""
      }));
    } else {
      const fields = ["apellido_alumno", "nombre_alumno", "domicilio_alumno", "localidad_alumno", "lugar_nacimiento_alumno"];
      const updates = {};
      fields.forEach(f => updates[f] = "—SIN DATOS ENCONTRADOS—");
      setFormData(prev => ({ ...prev, ...updates, edad_alumno: "", curso: "", division: "" }));
    }
  };

  useEffect(() => { if (autoFill) handleAutocomplete(); }, [autoFill]);
  useEffect(() => {
    if (formData.fecha_nacimiento_alumno) {
      setFormData(prev => ({ ...prev, edad_alumno: calculateAge(prev.fecha_nacimiento_alumno) }));
    }
  }, [formData.fecha_nacimiento_alumno]);

  // --- CRUD Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { id, created_at, ...payload } = formData;
      if (payload.fecha_emision === "") payload.fecha_emision = null;
      if (payload.fecha_nacimiento_alumno === "") payload.fecha_nacimiento_alumno = null;

      const { error } = modalMode === "create" 
        ? await supabase.from('registro_alumnos_boleto_estudiantil').insert([payload])
        : await supabase.from('registro_alumnos_boleto_estudiantil').update(payload).eq('id', selectedId);
      
      if (error) throw error;
      setShowModal(false);
      fetchData();
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleDelete = async () => {
    if (!selectedId) return alert("Seleccione un registro.");
    if (window.confirm("¿Eliminar registro?")) {
      await supabase.from('registro_alumnos_boleto_estudiantil').delete().eq('id', selectedId);
      fetchData();
      setSelectedId(null);
    }
  };

  // --- Filtros y Helpers ---
  const filteredData = data.filter(d => {
    const fullName = `${d.apellido_alumno} ${d.nombre_alumno}`.toLowerCase();
    return (
      (!filters.alumno || fullName.includes(filters.alumno.toLowerCase())) &&
      (!filters.dni || d.dni_alumno.includes(filters.dni)) &&
      (!filters.curso || d.curso.includes(filters.curso)) &&
      (!filters.division || d.division.toLowerCase().includes(filters.division.toLowerCase())) &&
      (!filters.inicio_trayecto || d.inicio_recorrido.toLowerCase().includes(filters.inicio_trayecto.toLowerCase()))
    );
  });

  const getMonthName = (month) => {
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    return meses[parseInt(month) - 1];
  };

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      
      {!showPrint && (
        <>
          <h2>BOLETO ESTUDIANTIL</h2>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', justifyContent: 'center', marginBottom: '20px' }}>
            <input placeholder="APELLIDO Y NOMBRE DEL ALUMNO" value={filters.alumno} onChange={e => setFilters({...filters, alumno: e.target.value})} style={{width: '250px'}} />
            <input placeholder="DNI DEL ALUMNO" value={filters.dni} onChange={e => setFilters({...filters, dni: e.target.value})} />
            <input placeholder="CURSO" value={filters.curso} onChange={e => setFilters({...filters, curso: e.target.value})} style={{width: '80px'}} />
            <input placeholder="DIVISIÓN" value={filters.division} onChange={e => setFilters({...filters, division: e.target.value})} style={{width: '80px'}} />
            <input placeholder="INICIO DEL TRAYECTO" value={filters.inicio_trayecto} onChange={e => setFilters({...filters, inicio_trayecto: e.target.value})} />
          </div>

          {/* Botones de Acción */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
            <button onClick={() => { setModalMode("create"); setFormData(initialForm); setAutoFill(false); setShowModal(true); }} style={{ backgroundColor: 'blue', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>NUEVO</button>
            <button onClick={() => { if(!selectedId) return alert("Seleccione registro"); setModalMode("edit"); setShowModal(true); }} style={{ backgroundColor: 'green', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>MODIFICAR</button>
            <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>ELIMINAR</button>
            <button onClick={() => { setPrintMode("table"); setShowPrint(true); }} style={{ backgroundColor: 'yellow', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>IMPRIMIR</button>
          </div>

          {/* Tabla */}
          <div className="contenido-submenu" style={{ width: '98%', maxWidth: '98%', padding: '15px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#333', color: 'white' }}>
                  <th>FECHA EMISIÓN</th><th>EMITIDO POR</th><th>EMISOR</th><th>DNI ALUMNO</th><th>ALUMNO</th><th>CURSO/DIV</th><th>INICIO RECORRIDO</th><th>LÍNEA</th><th>VISTA</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(d => (
                  <tr key={d.id} onClick={() => { setSelectedId(d.id); setFormData(d); }} style={{ backgroundColor: selectedId === d.id ? '#e3f2fd' : 'transparent', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                    <td style={{textAlign: 'center'}}>{d.fecha_emision}</td>
                    <td>{d.emitido_por_cargo}</td>
                    <td>{d.emitido_por_nombre}</td>
                    <td style={{textAlign: 'center'}}>{d.dni_alumno}</td>
                    <td>{d.apellido_alumno}, {d.nombre_alumno}</td>
                    <td style={{textAlign: 'center'}}>{d.curso}° "{d.division}"</td>
                    <td>{d.localidad_inicio_recorrido}</td>
                    <td>{d.linea_colectivo}</td>
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
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>{modalMode === 'view' ? 'VISTA REGISTRO' : 'FORMULARIO BOLETO ESTUDIANTIL'}</h2>
            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
              <label>FECHA DE EMISIÓN: <input type="date" name="fecha_emision" value={formData.fecha_emision} onChange={handleInputChange} disabled={modalMode==='view'} required /></label>
              <label>EMITIDO POR (CARGO): <input name="emitido_por_cargo" value={formData.emitido_por_cargo} onChange={handleInputChange} disabled={modalMode==='view'} placeholder="Ej: DIRECTOR/A" /></label>
              <label style={{ gridColumn: 'span 2' }}>APELLIDO Y NOMBRE EMISOR: <input name="emitido_por_nombre" value={formData.emitido_por_nombre} onChange={handleInputChange} disabled={modalMode==='view'} style={{width: '100%'}} /></label>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ flex: 1 }}>DNI DEL ALUMNO: <input name="dni_alumno" value={formData.dni_alumno} onChange={handleInputChange} disabled={modalMode==='view'} required /></label>
                {modalMode !== 'view' && <label style={{ fontSize: '12px', color: 'blue', fontWeight: 'bold', cursor: 'pointer' }}><input type="checkbox" checked={autoFill} onChange={e => setAutoFill(e.target.checked)} /> AUTOCOMPLETAR</label>}
              </div>
              <label>EDAD: <input name="edad_alumno" value={formData.edad_alumno} readOnly style={{backgroundColor: '#eee'}} /></label>
              
              <label>APELLIDO ALUMNO: <input name="apellido_alumno" value={formData.apellido_alumno} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>NOMBRE ALUMNO: <input name="nombre_alumno" value={formData.nombre_alumno} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>FECHA NACIMIENTO: <input type="date" name="fecha_nacimiento_alumno" value={formData.fecha_nacimiento_alumno} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>LUGAR NACIMIENTO: <input name="lugar_nacimiento_alumno" value={formData.lugar_nacimiento_alumno} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>DOMICILIO ALUMNO: <input name="domicilio_alumno" value={formData.domicilio_alumno} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>LOCALIDAD ALUMNO: <input name="localidad_alumno" value={formData.localidad_alumno} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              
              <label>CURSO: 
                <select name="curso" value={formData.curso} onChange={handleInputChange} disabled={modalMode==='view'}>
                  <option value="">Seleccione...</option>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label>DIVISIÓN: 
                <select name="division" value={formData.division} onChange={handleInputChange} disabled={modalMode==='view'}>
                  <option value="">Seleccione...</option>
                  {['A','B','C','D'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>

              <label>INICIO DEL RECORRIDO: <input name="inicio_recorrido" value={formData.inicio_recorrido} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>LOCALIDAD INICIO: <input name="localidad_inicio_recorrido" value={formData.localidad_inicio_recorrido} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label style={{ gridColumn: 'span 2' }}>LÍNEA DE COLECTIVO: <input name="linea_colectivo" value={formData.linea_colectivo} onChange={handleInputChange} disabled={modalMode==='view'} style={{width: '100%'}} /></label>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                {modalMode !== 'view' && <button type="submit" style={{ padding: '10px 40px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>GUARDAR</button>}
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 40px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{modalMode === 'view' ? 'CERRAR' : 'CANCELAR'}</button>
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
                <div style={{ color: 'black' }}>
                  <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                    <img src={logo} alt="Logo" style={{ width: '60px', marginRight: '20px' }} />
                    <div>
                      <h1 style={{ fontSize: '18px', margin: 0 }}>Escuela Secundaria Gobernador Garmendia</h1>
                      <p style={{ fontSize: '12px', margin: 0 }}>CUE: 9001717/00 - Av. de la Soja S/N°</p>
                      <p style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Reporte Boleto Estudiantil</p>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead><tr style={{ backgroundColor: '#eee', border: '1px solid black' }}><th>FECHA</th><th>DNI</th><th>ALUMNO</th><th>CURSO/DIV</th><th>LÍNEA</th></tr></thead>
                    <tbody>{filteredData.map(d => (<tr key={d.id} style={{ border: '1px solid black' }}><td style={{textAlign: 'center'}}>{d.fecha_emision}</td><td>{d.dni_alumno}</td><td>{d.apellido_alumno}, {d.nombre_alumno}</td><td style={{textAlign: 'center'}}>{d.curso}° "{d.division}"</td><td>{d.linea_colectivo}</td></tr>))}</tbody>
                  </table>
                </div>
              ) : (
                <div style={{ color: 'black', fontFamily: 'Arial', position: 'relative', height: '100%' }}>
                  <div style={{ textAlign: 'right', marginBottom: '20px' }}><img src={logoMinisterio} alt="Ministerio" style={{ width: '6cm', height: '3cm', objectFit: 'contain' }} /></div>
                  <h1 style={{ textAlign: 'center', fontSize: '18pt', fontWeight: 'bold', margin: '40px 0', textTransform: 'uppercase', color: 'black' }}>CERTIFICADO DE ESTUDIOS EN CURSO PARA BOLETO ESTUDIANTIL GRATUITO</h1>
                  
                  <div style={{ fontSize: '12pt', textAlign: 'justify', lineHeight: '1.15', marginBottom: '20px' }}>
                    <p style={{ textIndent: '1.5cm' }}>
                      Por medio de la presente, en mi calidad de <strong>{formData.emitido_por_cargo.toUpperCase()}</strong>, certifico que <strong>{formData.apellido_alumno.toUpperCase()} {formData.nombre_alumno.toUpperCase()}</strong>, DNI N° <strong>{formData.dni_alumno}</strong>, de <strong>{formData.edad_alumno}</strong> años de edad, domiciliado en <strong>{(formData.domicilio_alumno || "").toUpperCase()}</strong>, de la localidad de <strong>{(formData.localidad_alumno || "").toUpperCase()}</strong> es alumno regular de la <strong>ESCUELA SECUNDARIA GOBERNADOR GARMENDIA</strong>, ubicada en <strong>AV. DE LA SOJA S/N º</strong> de la localidad de <strong>GOBERNADOR GARMENDIA</strong>, CUE: <strong>9001717/00</strong>.
                    </p>
                    <p style={{ textIndent: '1.5cm' }}>
                      El mismo, inicia su recorrido en <strong>{(formData.inicio_recorrido || "").toUpperCase()}</strong>, de la localidad de <strong>{(formData.localidad_inicio_recorrido || "").toUpperCase()}</strong>, con destino a la correspondiente institución.
                    </p>
                    <p style={{ textIndent: '1.5cm' }}>
                      Para realizar el recorrido el alumno utiliza la línea de colectivo <strong>{(formData.linea_colectivo || "").toUpperCase()}</strong>.
                    </p>
                  </div>

                  <div style={{ marginTop: '5cm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10pt' }}>
                    <div style={{ width: '6cm', textAlign: 'left' }}>
                      <div style={{ borderTop: '1px dotted black', width: '100%', marginBottom: '5px' }}></div>
                      Fecha: {(() => {
                        const [y, m, d] = formData.fecha_emision.split('-');
                        return `${d} de ${getMonthName(m)} de ${y}`;
                      })()}
                    </div>
                    <div style={{ width: '7cm', textAlign: 'center' }}>
                      <div style={{ borderTop: '1px dotted black', width: '100%', marginBottom: '5px' }}></div>
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
              .no-print { display: none !important; }
              body { background: white !important; }
              .print-overlay { position: static; background: white; }
              .print-page { box-shadow: none !important; width: 100% !important; margin: 0 !important; }
              @page { margin: 1.27cm; size: ${printMode === 'table' ? 'A4 landscape' : 'A4 portrait'}; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default RegistroAlumnosBoletoEstudiantil;
