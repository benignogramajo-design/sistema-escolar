import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PRECEPTORIA1.jpg";
import logo from "../../assets/logos/Logo.png";
import { supabase } from "../../components.css/supabaseClient";
import * as XLSX from 'xlsx';

const PreceptoriaCargarDatos = ({ goBack, goHome }) => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [selectedId, setSelectedId] = useState(null);
  const [showPrint, setShowPrint] = useState(false);

  // --- Estado Inicial del Formulario ---
  const initialTutor = {
    parentesco: "", parentesco_otro: "", apellido: "", nombre: "",
    dni: "", celular: "", ocupacion: ""
  };

  const initialForm = {
    estado_alumno: "REGULAR",
    curso: "", division: "", turno: "",
    apellido: "", nombre: "", dni: "", celular: "",
    fecha_nacimiento: "", edad: "",
    domicilio: "", localidad: "",
    discapacidad: "NO",
    tutores: [{ ...initialTutor }],
    fecha_egreso: null,
    ciclo_lectivo_pendiente: ""
  };

  const [formData, setFormData] = useState(initialForm);

  // --- Estado de Filtros ---
  const [filters, setFilters] = useState({
    curso: "", division: "", turno: "",
    apellido_nombre: "", dni: "", estado: []
  });

  // --- Constantes ---
  const cursosList = ["1", "2", "3", "4", "5", "6"];
  const divisionesList = ["A", "B", "C", "D"];
  const turnosList = ["MAÑANA", "TARDE"];

  // --- Carga de Datos ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('registro_alumnos')
        .select('*')
        .order('apellido', { ascending: true });
      
      if (error) throw error;
      setAlumnos(data || []);
    } catch (error) {
      console.error("Error fetching alumnos:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers ---
  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Auto-Turno
  useEffect(() => {
    if (formData.curso && formData.division) {
      const code = `${formData.curso}${formData.division}`;
      const mananaCodes = ["1A", "2A", "3A", "4A", "5A", "6A", "1B", "2B", "3B"];
      const newTurno = mananaCodes.includes(code) ? "MAÑANA" : "TARDE";
      setFormData(prev => ({ ...prev, turno: newTurno }));
    }
  }, [formData.curso, formData.division]);

  // Auto-Edad
  useEffect(() => {
    if (formData.fecha_nacimiento) {
      setFormData(prev => ({ ...prev, edad: calculateAge(formData.fecha_nacimiento) }));
    }
  }, [formData.fecha_nacimiento]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTutorChange = (index, field, value) => {
    const newTutores = [...formData.tutores];
    newTutores[index][field] = value;
    setFormData(prev => ({ ...prev, tutores: newTutores }));
  };

  const addTutor = () => {
    setFormData(prev => ({ ...prev, tutores: [...prev.tutores, { ...initialTutor }] }));
  };

  const removeTutor = (index) => {
    const newTutores = [...formData.tutores];
    newTutores.splice(index, 1);
    setFormData(prev => ({ ...prev, tutores: newTutores }));
  };

  // CRUD
  const handleNew = () => {
    setModalMode("create");
    setFormData(initialForm);
    setSelectedId(null);
    setShowModal(true);
  };

  const handleModify = () => {
    if (!selectedId) return alert("Seleccione un alumno para modificar.");
    const item = alumnos.find(a => a.id === selectedId);
    if (item) {
      setModalMode("edit");
      // Asegurar estructura de tutores
      const safeItem = {
        ...item,
        tutores: (item.tutores && Array.isArray(item.tutores) && item.tutores.length > 0) 
          ? item.tutores 
          : [{ ...initialTutor }]
      };
      setFormData(safeItem);
      setShowModal(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return alert("Seleccione un alumno para eliminar.");
    if (window.confirm("¿Está seguro de eliminar este alumno?")) {
      const { error } = await supabase.from('registro_alumnos').delete().eq('id', selectedId);
      if (error) alert("Error al eliminar: " + error.message);
      else {
        setSelectedId(null);
        fetchData();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        const { error } = await supabase.from('registro_alumnos').insert([formData]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('registro_alumnos').update(formData).eq('id', selectedId);
        if (error) throw error;
      }
      setShowModal(false);
      fetchData();
      setSelectedId(null);
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  // --- Filtrado ---
  const filteredAlumnos = alumnos.filter(a => {
    const f = filters;
    const fullName = `${a.apellido} ${a.nombre}`.toLowerCase();
    return (
      (!f.curso || a.curso === f.curso) &&
      (!f.division || a.division === f.division) &&
      (!f.turno || a.turno === f.turno) &&
      (!f.dni || String(a.dni).includes(f.dni)) &&
      (!f.estado || f.estado.length === 0 || f.estado.includes(a.estado_alumno)) &&
      (!f.apellido_nombre || fullName.includes(f.apellido_nombre.toLowerCase()))
    );
  }).sort((a, b) => {
    // 1. Ordenar por CURSO (numérico)
    const cursoA = parseInt(a.curso) || 0;
    const cursoB = parseInt(b.curso) || 0;
    if (cursoA !== cursoB) return cursoA - cursoB;

    // 2. Ordenar por DIVISIÓN
    const divA = (a.division || "").toUpperCase();
    const divB = (b.division || "").toUpperCase();
    if (divA !== divB) return divA.localeCompare(divB);

    // 3. Ordenar por APELLIDO Y NOMBRE
    const nameA = `${a.apellido} ${a.nombre}`.toLowerCase();
    const nameB = `${b.apellido} ${b.nombre}`.toLowerCase();
    if (nameA !== nameB) return nameA.localeCompare(nameB);

    // 4. Ordenar por ESTADO
    const estA = (a.estado_alumno || "").toLowerCase();
    const estB = (b.estado_alumno || "").toLowerCase();
    return estA.localeCompare(estB);
  });

  const estadosPosibles = ["REGULAR", "REPITENTE", "EGRESADO", "PENDIENTE DE EGRESO"];

  // --- Excel Export ---
  const handleExcelExport = () => {
    const dataToExport = filteredAlumnos.map(a => {
      const tutor = (a.tutores && a.tutores.length > 0) ? a.tutores[0] : {};
      return {
        "CURSO": a.curso,
        "DIVISION": a.division,
        "TURNO": a.turno,
        "APELLIDO": a.apellido,
        "NOMBRE": a.nombre,
        "DNI": a.dni,
        "CELULAR": a.celular,
        "ESTADO": a.estado_alumno,
        "DISCAPACIDAD": a.discapacidad,
        "TUTOR NOMBRE": tutor.apellido ? `${tutor.apellido} ${tutor.nombre}` : '',
        "TUTOR DNI": tutor.dni || '',
        "TUTOR CELULAR": tutor.celular || '',
        "PARENTESCO": tutor.parentesco || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Alumnos");
    XLSX.writeFile(workbook, "Datos_Alumnos.xlsx");
  };

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      
      {!showPrint && (
        <>
          <h2>CARGAR DATOS DE ALUMNOS</h2>

          {/* --- Filtros --- */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '15px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
            <select value={filters.curso} onChange={e => setFilters({...filters, curso: e.target.value})} style={{ padding: '8px' }}>
              <option value="">CURSO</option>
              {cursosList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.division} onChange={e => setFilters({...filters, division: e.target.value})} style={{ padding: '8px' }}>
              <option value="">DIVISIÓN</option>
              {divisionesList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filters.turno} onChange={e => setFilters({...filters, turno: e.target.value})} style={{ padding: '8px' }}>
              <option value="">TURNO</option>
              {turnosList.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="APELLIDO Y NOMBRE" value={filters.apellido_nombre} onChange={e => setFilters({...filters, apellido_nombre: e.target.value})} style={{ padding: '8px', width: '200px' }} />
            <input placeholder="DNI" value={filters.dni} onChange={e => setFilters({...filters, dni: e.target.value})} style={{ padding: '8px', width: '120px' }} />
            
            {/* Filtro de Estado Multi-selección */}
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '80px', overflowY: 'auto', border: '1px solid #ccc', padding: '5px', backgroundColor: 'white', borderRadius: '4px', minWidth: '150px' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>ESTADO (Múltiple):</span>
              {estadosPosibles.map(est => (
                <label key={est} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={filters.estado.includes(est)} 
                    onChange={e => setFilters({...filters, estado: e.target.checked ? [...filters.estado, est] : filters.estado.filter(s => s !== est)})} 
                  /> {est}
                </label>
              ))}
            </div>
          </div>

          {/* --- Botones de Acción --- */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0', flexWrap: 'wrap' }}>
            <button onClick={handleNew} style={{ backgroundColor: 'blue', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>NUEVO</button>
            <button onClick={handleModify} style={{ backgroundColor: 'green', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>MODIFICAR</button>
            <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>ELIMINAR</button>
            <button onClick={() => setShowPrint(true)} style={{ backgroundColor: 'yellow', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>IMPRIMIR</button>
            <button onClick={handleExcelExport} style={{ backgroundColor: '#ccff00', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>DESCARGAR EXCEL</button>
          </div>

          {/* --- Tabla --- */}
          <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%", overflowX: 'auto' }}>
            <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)", fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: "#333", color: "white" }}>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>CURSO Y DIVISIÓN</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>TURNO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>APELLIDO Y NOMBRE del ALUMNO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>DNI DEL ALUMNO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>CELULAR</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>ESTADO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>DISCAPACIDAD</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>APELLIDO Y NOMBRE DEL TUTOR</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>DNI DEL TUTOR</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>CELULAR DEL TUTOR</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>PARENTESCO</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
                ) : filteredAlumnos.length > 0 ? (
                  filteredAlumnos.map((a) => {
                    const tutor = (a.tutores && a.tutores.length > 0) ? a.tutores[0] : {};
                    return (
                      <tr 
                        key={a.id} 
                        onClick={() => setSelectedId(a.id)}
                        style={{ 
                          cursor: 'pointer', 
                          backgroundColor: selectedId === a.id ? '#fffbe6' : 'transparent',
                          fontWeight: selectedId === a.id ? 'bold' : 'normal'
                        }}
                      >
                        <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: 'center' }}>{a.curso} "{a.division}"</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: 'center' }}>{a.turno}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{a.apellido}, {a.nombre}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{a.dni}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{a.celular}</td>
                        <td style={{ 
                          padding: "8px", 
                          border: "1px solid #ddd", 
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: a.estado_alumno === 'REPITENTE' ? 'red' : 
                                 a.estado_alumno === 'EGRESADO' ? 'green' : 
                                 a.estado_alumno === 'PENDIENTE DE EGRESO' ? 'blue' : 'black'
                        }}>
                          {a.estado_alumno}
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: 'center' }}>{a.discapacidad}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{tutor.apellido ? `${tutor.apellido} ${tutor.nombre}` : '-'}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{tutor.dni || '-'}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{tutor.celular || '-'}</td>
                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{tutor.parentesco || '-'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>No hay registros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- Modal Formulario --- */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
              {modalMode === 'create' ? 'NUEVO ALUMNO' : 'MODIFICAR ALUMNO'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <label>Estado: <select name="estado_alumno" value={formData.estado_alumno} onChange={handleInputChange}>{estadosPosibles.map(e => <option key={e} value={e}>{e}</option>)}</select></label>
              <label>Curso: <select name="curso" value={formData.curso} onChange={handleInputChange}><option value="">-</option>{cursosList.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
              <label>División: <select name="division" value={formData.division} onChange={handleInputChange}><option value="">-</option>{divisionesList.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
              <label>Turno: <input name="turno" value={formData.turno} readOnly style={{backgroundColor:'#eee'}} /></label>
              <label>Apellido: <input name="apellido" value={formData.apellido} onChange={handleInputChange} required /></label>
              <label>Nombre: <input name="nombre" value={formData.nombre} onChange={handleInputChange} required /></label>
              <label>DNI: <input name="dni" value={formData.dni} onChange={handleInputChange} /></label>
              <label>Celular: <input name="celular" value={formData.celular} onChange={handleInputChange} /></label>
              <label>Fecha Nac: <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange} /></label>
              <label>Edad: <input name="edad" value={formData.edad} readOnly style={{backgroundColor:'#eee'}} /></label>
              <label>Discapacidad: <select name="discapacidad" value={formData.discapacidad} onChange={handleInputChange}><option value="NO">NO</option><option value="SI">SI</option></select></label>

              {/* Campos condicionales según Estado */}
              {formData.estado_alumno === 'EGRESADO' && (
                <label>FECHA DE EGRESO: 
                  <input type="date" name="fecha_egreso" value={formData.fecha_egreso || ""} onChange={handleInputChange} required />
                </label>
              )}
              {formData.estado_alumno === 'PENDIENTE DE EGRESO' && (
                <label>CICLO LECTIVO: 
                  <input type="text" name="ciclo_lectivo_pendiente" value={formData.ciclo_lectivo_pendiente || ""} onChange={handleInputChange} placeholder="Ej: 2025" required />
                </label>
              )}

              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                <h3>Tutores</h3>
                {formData.tutores.map((tutor, idx) => (
                  <div key={idx} style={{ border: '1px dashed #ccc', padding: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        <label>Parentesco: <input value={tutor.parentesco} onChange={e => handleTutorChange(idx, 'parentesco', e.target.value)} /></label>
                        <label>Apellido: <input value={tutor.apellido} onChange={e => handleTutorChange(idx, 'apellido', e.target.value)} /></label>
                        <label>Nombre: <input value={tutor.nombre} onChange={e => handleTutorChange(idx, 'nombre', e.target.value)} /></label>
                        <label>DNI: <input value={tutor.dni} onChange={e => handleTutorChange(idx, 'dni', e.target.value)} /></label>
                        <label>Celular: <input value={tutor.celular} onChange={e => handleTutorChange(idx, 'celular', e.target.value)} /></label>
                    </div>
                    {idx > 0 && <button type="button" onClick={() => removeTutor(idx)} style={{marginTop:'5px', color:'red'}}>Eliminar Tutor</button>}
                  </div>
                ))}
                <button type="button" onClick={addTutor}>+ Agregar Tutor</button>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                <button type="submit" style={{ padding: '10px 40px', backgroundColor: 'blue', color: 'white' }}>GUARDAR</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 40px' }}>CANCELAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Vista Previa Impresión --- */}
      {showPrint && (
        <div className="print-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#555', zIndex: 2000, overflowY: 'auto' }}>
          <div className="print-content" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="print-page">
              <div style={{ borderBottom: '2px solid black', marginBottom: '10px', paddingBottom: '5px', display: 'flex', alignItems: 'center' }}>
                 <img src={logo} alt="Logo" style={{ width: '60px', marginRight: '20px' }} />
                 <div>
                   <h1 style={{ fontSize: '18px', margin: 0, color: 'black' }}>Escuela Secundaria Gobernador Garmendia</h1>
                   <p style={{ fontWeight: 'bold' }}>LISTADO DE ALUMNOS</p>
                 </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: '10px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid black' }}>CURSO/DIV</th>
                    <th style={{ border: '1px solid black' }}>TURNO</th>
                    <th style={{ border: '1px solid black' }}>ALUMNO</th>
                    <th style={{ border: '1px solid black' }}>DNI</th>
                    <th style={{ border: '1px solid black' }}>CELULAR</th>
                    <th style={{ border: '1px solid black' }}>ESTADO</th>
                    <th style={{ border: '1px solid black' }}>DISC.</th>
                    <th style={{ border: '1px solid black' }}>TUTOR</th>
                    <th style={{ border: '1px solid black' }}>DNI TUTOR</th>
                    <th style={{ border: '1px solid black' }}>CEL. TUTOR</th>
                    <th style={{ border: '1px solid black' }}>PARENTESCO</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlumnos.map((a, i) => {
                    const tutor = (a.tutores && a.tutores.length > 0) ? a.tutores[0] : {};
                    return (
                      <tr key={i}>
                        <td style={{ border: '1px solid black', textAlign: 'center' }}>{a.curso} "{a.division}"</td>
                        <td style={{ border: '1px solid black', textAlign: 'center' }}>{a.turno}</td>
                        <td style={{ border: '1px solid black' }}>{a.apellido}, {a.nombre}</td>
                        <td style={{ border: '1px solid black' }}>{a.dni}</td>
                        <td style={{ border: '1px solid black' }}>{a.celular}</td>
                        <td style={{ border: '1px solid black', textAlign: 'center' }}>{a.estado_alumno}</td>
                        <td style={{ border: '1px solid black', textAlign: 'center' }}>{a.discapacidad}</td>
                        <td style={{ border: '1px solid black' }}>{tutor.apellido ? `${tutor.apellido} ${tutor.nombre}` : '-'}</td>
                        <td style={{ border: '1px solid black' }}>{tutor.dni || '-'}</td>
                        <td style={{ border: '1px solid black' }}>{tutor.celular || '-'}</td>
                        <td style={{ border: '1px solid black' }}>{tutor.parentesco || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="no-print" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', backgroundColor: '#333', padding: '15px', textAlign: 'center' }}>
            <button onClick={() => window.print()} style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', margin: '0 10px', borderRadius: '5px' }}>GUARDAR PDF / IMPRIMIR</button>
            <button onClick={() => setShowPrint(false)} style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', margin: '0 10px', borderRadius: '5px' }}>CANCELAR</button>
          </div>
          <style>{`
            .print-page { width: 297mm; min-height: 210mm; padding: 10mm; background: white; margin: 0 auto; }
            @media print {
              @page { size: landscape; }
              .no-print { display: none !important; }
              body * { visibility: hidden; }
              .print-overlay, .print-overlay * { visibility: visible; }
              .print-overlay { position: absolute; top: 0; left: 0; width: 100%; background: white; }
              .print-page { margin: 0; width: 100%; box-shadow: none; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default PreceptoriaCargarDatos;