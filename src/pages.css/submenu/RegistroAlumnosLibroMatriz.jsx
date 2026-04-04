import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo REGISTRO ALUMNOS1.jpg";
import logo from "../../assets/logos/Logo.png";
import { supabase } from "../../components.css/supabaseClient";

const RegistroAlumnosLibroMatriz = ({ goBack, goHome }) => {
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
    nombre: "",
    dni: "",
    libro: "",
    folio: "",
    anio_ingreso: "",
    ciclo_lectivo: "",
    fecha_egreso: ""
  });

  // --- Formulario ---
  const initialForm = {
    dni: "",
    apellido: "",
    nombre: "",
    fecha_nacimiento: "",
    lugar_nacimiento: "",
    libros_folios: [{ libro: "", folio: "" }],
    anio_ingreso: "",
    ciclo_lectivo: "",
    estado: "",
    fecha_egreso: "",
    estado_titulo: "",
    titulo_data: { copiador: "", folio: "", serie: "", numero: "", fecha_retiro: "" },
    materias_adeudadas: [], // [{ curso: "", materia: "" }]
    plan_estudio: ""
  };
  const [formData, setFormData] = useState(initialForm);

  // --- Listas ---
  const estadosList = ["SALIDO CON LIBRO MATRIZ", "SALIDO CON PASE", "PENDIENTE DE EGRESO", "EGRESADO"];
  const estadosTituloList = ["FALTA CARGAR", "FALTA PRESENTAR", "PRESENTADO", "TITULO DISPONIBLE", "TITULO RETIRADO"];
  const cursosList = ["1ER AÑO", "2DO AÑO", "3ER AÑO", "4TO AÑO", "5TO AÑO", "6TO AÑO"];
  const planesEstudio = [
    "POLIMODAL EN ECONOMIA Y GESTION DE LAS ORGANIZACIONES (3357/5 (SE)",
    "POLIMODAL EN ECONOMIA Y GESTION DE LAS ORGANIZACIONES (2358/5 SE))",
    "POLIMODAL EN ECONOMIA Y GESTION DE LAS ORGANIZACIONES (2358/5 (SE) - 3357/5 (SE)",
    "EGB 3 Y POLIMODAL EN ECONOMÍA Y GESTIÓN DE LAS ORGANIZACIONES 1115/5 - 3357/5",
    "BACHILLER EN ECONOMIA Y ADMINISTRACION 297/5 REC872 Y 82/5",
    "BACHILLER EN INFORMATICA 300/5 REC414 Y 81/5"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.from('registro_alumnos_libro_matriz').select('*');
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
    if (!formData.dni) return;
    
    // 1. Buscar en PreceptoriaCargarDatos
    let { data: alumnoPreceptoria } = await supabase
      .from('registro_alumnos')
      .select('apellido, nombre, fecha_nacimiento, lugar_nacimiento')
      .eq('dni', formData.dni)
      .maybeSingle();

    if (alumnoPreceptoria) {
      setFormData(prev => ({
        ...prev,
        apellido: alumnoPreceptoria.apellido,
        nombre: alumnoPreceptoria.nombre,
        fecha_nacimiento: alumnoPreceptoria.fecha_nacimiento,
        lugar_nacimiento: alumnoPreceptoria.lugar_nacimiento
      }));
      return;
    }

    // 2. Buscar en tabla local Libro Matriz
    const localRecord = data.find(d => d.dni === formData.dni);
    if (localRecord) {
      setFormData(prev => ({
        ...prev,
        apellido: localRecord.apellido,
        nombre: localRecord.nombre,
        fecha_nacimiento: localRecord.fecha_nacimiento,
        lugar_nacimiento: localRecord.lugar_nacimiento
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        apellido: "—SIN DATOS ENCONTRADOS—",
        nombre: "—SIN DATOS ENCONTRADOS—",
        lugar_nacimiento: "—SIN DATOS ENCONTRADOS—"
      }));
    }
  };

  useEffect(() => {
    if (autoFill) handleAutocomplete();
  }, [autoFill]);

  // --- Handlers CRUD ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (objName, field, value) => {
    setFormData(prev => ({
      ...prev,
      [objName]: { ...prev[objName], [field]: value }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await supabase.from('registro_alumnos_libro_matriz').insert([formData]);
      } else {
        await supabase.from('registro_alumnos_libro_matriz').update(formData).eq('id', selectedId);
      }
      setShowModal(false);
      fetchData();
    } catch (e) { alert("Error al guardar"); }
  };

  const handleDelete = async () => {
    if (!selectedId) return alert("Seleccione un registro.");
    if (window.confirm("¿Eliminar registro?")) {
      await supabase.from('registro_alumnos_libro_matriz').delete().eq('id', selectedId);
      fetchData();
      setSelectedId(null);
    }
  };

  // --- Filtrado y Ordenamiento ---
  const filteredData = data.filter(d => {
    const fullName = `${d.apellido} ${d.nombre}`.toLowerCase();
    // Verificamos si alguno de los libros/folios coincide
    const hasLibroMatch = d.libros_folios?.some(lf => lf.libro.includes(filters.libro));
    const hasFolioMatch = d.libros_folios?.some(lf => lf.folio.includes(filters.folio));

    return (
      (!filters.nombre || fullName.includes(filters.nombre.toLowerCase())) &&
      (!filters.dni || d.dni.includes(filters.dni)) &&
      (!filters.libro || hasLibroMatch) &&
      (!filters.folio || hasFolioMatch) &&
      (!filters.anio_ingreso || d.anio_ingreso.includes(filters.anio_ingreso)) &&
      (!filters.ciclo_lectivo || d.ciclo_lectivo.includes(filters.ciclo_lectivo)) &&
      (!filters.fecha_egreso || d.fecha_egreso === filters.fecha_egreso)
    );
  }).sort((a, b) => {
    // Ordenar por el primer Libro y luego el primer Folio
    const lA = a.libros_folios?.[0]?.libro || "";
    const lB = b.libros_folios?.[0]?.libro || "";
    if (lA !== lB) return lA.localeCompare(lB, undefined, { numeric: true });
    
    const fA = a.libros_folios?.[0]?.folio || "";
    const fB = b.libros_folios?.[0]?.folio || "";
    return fA.localeCompare(fB, undefined, { numeric: true });
  });

  // --- Render Componente ---
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      
      {!showPrint && (
        <>
          <h2>LIBRO MATRIZ</h2>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', justifyContent: 'center', marginBottom: '20px' }}>
            <input placeholder="APELLIDO Y NOMBRE" value={filters.nombre} onChange={e => setFilters({...filters, nombre: e.target.value})} />
            <input placeholder="DNI" value={filters.dni} onChange={e => setFilters({...filters, dni: e.target.value})} />
            <input placeholder="LIBRO" value={filters.libro} onChange={e => setFilters({...filters, libro: e.target.value})} style={{width: '100px'}}/>
            <input placeholder="FOLIO" value={filters.folio} onChange={e => setFilters({...filters, folio: e.target.value})} style={{width: '100px'}}/>
            <input placeholder="AÑO DE INGRESO" value={filters.anio_ingreso} onChange={e => setFilters({...filters, anio_ingreso: e.target.value})} />
            <input placeholder="CICLO LECTIVO" value={filters.ciclo_lectivo} onChange={e => setFilters({...filters, ciclo_lectivo: e.target.value})} />
            <input type="date" value={filters.fecha_egreso} onChange={e => setFilters({...filters, fecha_egreso: e.target.value})} />
          </div>

          {/* Botones de Acción */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
            <button onClick={() => { setModalMode("create"); setFormData(initialForm); setAutoFill(false); setShowModal(true); }} style={{ backgroundColor: 'blue', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>NUEVO</button>
            <button onClick={() => { if(!selectedId) return alert("Seleccione registro"); setModalMode("edit"); setAutoFill(false); setShowModal(true); }} style={{ backgroundColor: 'green', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>MODIFICAR</button>
            <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>ELIMINAR</button>
            <button onClick={() => { setPrintMode("table"); setShowPrint(true); }} style={{ backgroundColor: 'yellow', color: 'black', fontWeight: 'bold', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>IMPRIMIR</button>
          </div>

          {/* Tabla */}
          <div className="contenido-submenu" style={{ width: '98%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#333', color: 'white' }}>
                  <th>LIBRO</th><th>FOLIO</th><th>DNI</th><th>APELLIDO Y NOMBRE</th><th>AÑO INGRESO</th><th>CICLO LECTIVO</th><th>ESTADO</th><th>FECHA EGRESO</th><th>ESTADO TITULO</th><th>MATERIAS ADEUDADAS</th><th>VISTA</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(d => (
                  <tr key={d.id} onClick={() => { setSelectedId(d.id); setFormData(d); }} style={{ backgroundColor: selectedId === d.id ? '#e3f2fd' : 'transparent', cursor: 'pointer' }}>
                    <td style={{textAlign: 'center'}}>{d.libros_folios?.[0]?.libro}</td>
                    <td style={{textAlign: 'center'}}>{d.libros_folios?.[0]?.folio}</td>
                    <td>{d.dni}</td>
                    <td>{d.apellido}, {d.nombre}</td>
                    <td style={{textAlign: 'center'}}>{d.anio_ingreso}</td>
                    <td style={{textAlign: 'center'}}>{d.ciclo_lectivo}</td>
                    <td>{d.estado}</td>
                    <td style={{textAlign: 'center'}}>{d.fecha_egreso || '---'}</td>
                    <td>{d.estado_titulo || '---'}</td>
                    <td style={{textAlign: 'center'}}>{d.estado === 'EGRESADO' ? '---' : (d.materias_adeudadas?.length || '---')}</td>
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
            <h2 style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
              {modalMode === 'view' ? 'VISTA DE REGISTRO' : (modalMode === 'create' ? 'NUEVO REGISTRO' : 'MODIFICAR REGISTRO')}
            </h2>
            
            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ flex: 1 }}>DNI DEL ALUMNO: <input name="dni" value={formData.dni} onChange={handleInputChange} required disabled={modalMode==='view'} /></label>
                {modalMode !== 'view' && (
                  <label style={{ fontSize: '12px', color: 'blue', fontWeight: 'bold', cursor: 'pointer' }}>
                    <input type="checkbox" checked={autoFill} onChange={e => setAutoFill(e.target.checked)} /> AUTOCOMPLETAR
                  </label>
                )}
              </div>
              <label>APELLIDO DEL ALUMNO: <input name="apellido" value={formData.apellido} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>NOMBRE DEL ALUMNO: <input name="nombre" value={formData.nombre} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>FECHA DE NACIMIENTO: <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>LUGAR DE NACIMIENTO: <input name="lugar_nacimiento" value={formData.lugar_nacimiento} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              
              {/* Libros y Folios */}
              <div style={{ gridColumn: '1 / -1', border: '1px solid #ddd', padding: '10px' }}>
                <strong>LIBROS Y FOLIOS:</strong>
                {formData.libros_folios.map((lf, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <input placeholder="Libro" value={lf.libro} onChange={e => {
                      const newList = [...formData.libros_folios];
                      newList[idx].libro = e.target.value;
                      setFormData({...formData, libros_folios: newList});
                    }} disabled={modalMode==='view'} />
                    <input placeholder="Folio" value={lf.folio} onChange={e => {
                      const newList = [...formData.libros_folios];
                      newList[idx].folio = e.target.value;
                      setFormData({...formData, libros_folios: newList});
                    }} disabled={modalMode==='view'} />
                    {idx > 0 && modalMode !== 'view' && <button type="button" onClick={() => setFormData({...formData, libros_folios: formData.libros_folios.filter((_, i) => i !== idx)})}>Eliminar</button>}
                  </div>
                ))}
                {modalMode !== 'view' && <button type="button" onClick={() => setFormData({...formData, libros_folios: [...formData.libros_folios, {libro: "", folio: ""}]})} style={{marginTop: '5px'}}>+ Agregar Libro/Folio</button>}
              </div>

              <label>AÑO DE INGRESO: <input name="anio_ingreso" value={formData.anio_ingreso} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              <label>CICLO LECTIVO: <input name="ciclo_lectivo" value={formData.ciclo_lectivo} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
              
              <label>ESTADO:
                <select name="estado" value={formData.estado} onChange={handleInputChange} disabled={modalMode==='view'}>
                  <option value="">Seleccione...</option>
                  {estadosList.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </label>

              {formData.estado === "EGRESADO" && (
                <>
                  <label>FECHA DE EGRESO: <input type="date" name="fecha_egreso" value={formData.fecha_egreso} onChange={handleInputChange} disabled={modalMode==='view'} /></label>
                  <label>ESTADO DE TITULO:
                    <select name="estado_titulo" value={formData.estado_titulo} onChange={handleInputChange} disabled={modalMode==='view'}>
                      <option value="">Seleccione...</option>
                      {estadosTituloList.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </label>
                </>
              )}

              {formData.estado_titulo === "TITULO RETIRADO" && (
                <div style={{ gridColumn: '1 / -1', backgroundColor: '#f9f9f9', padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <label>COPIADOR: <input value={formData.titulo_data.copiador} onChange={e => handleNestedChange("titulo_data", "copiador", e.target.value)} disabled={modalMode==='view'} /></label>
                  <label>FOLIO: <input value={formData.titulo_data.folio} onChange={e => handleNestedChange("titulo_data", "folio", e.target.value)} disabled={modalMode==='view'} /></label>
                  <label>SERIE: <input value={formData.titulo_data.serie} onChange={e => handleNestedChange("titulo_data", "serie", e.target.value)} disabled={modalMode==='view'} /></label>
                  <label>NUMERO: <input value={formData.titulo_data.numero} onChange={e => handleNestedChange("titulo_data", "numero", e.target.value)} disabled={modalMode==='view'} /></label>
                  <label>FECHA RETIRO: <input type="date" value={formData.titulo_data.fecha_retiro} onChange={e => handleNestedChange("titulo_data", "fecha_retiro", e.target.value)} disabled={modalMode==='view'} /></label>
                </div>
              )}

              {/* Materias Adeudadas */}
              <div style={{ gridColumn: '1 / -1', border: '1px solid #ddd', padding: '10px' }}>
                <strong>MATERIAS ADEUDADAS:</strong>
                {formData.estado === "EGRESADO" ? (
                  <p style={{ color: 'green', fontWeight: 'bold' }}>SIN MATERIAS ADEUDADAS</p>
                ) : (
                  <>
                    {formData.materias_adeudadas.map((ma, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                        <select value={ma.curso} onChange={e => {
                          const newList = [...formData.materias_adeudadas];
                          newList[idx].curso = e.target.value;
                          setFormData({...formData, materias_adeudadas: newList});
                        }} disabled={modalMode==='view'}>
                          <option value="">Curso...</option>
                          {cursosList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input placeholder="Asignatura" value={ma.materia} onChange={e => {
                          const newList = [...formData.materias_adeudadas];
                          newList[idx].materia = e.target.value;
                          setFormData({...formData, materias_adeudadas: newList});
                        }} disabled={modalMode==='view'} style={{flex: 1}} />
                        {modalMode !== 'view' && <button type="button" onClick={() => setFormData({...formData, materias_adeudadas: formData.materias_adeudadas.filter((_, i) => i !== idx)})}>X</button>}
                      </div>
                    ))}
                    {modalMode !== 'view' && <button type="button" onClick={() => setFormData({...formData, materias_adeudadas: [...formData.materias_adeudadas, {curso: "", materia: ""}]})} style={{marginTop: '5px'}}>+ Agregar Materia</button>}
                  </>
                )}
              </div>

              <label style={{ gridColumn: '1 / -1' }}>PLAN DE ESTUDIO:
                <select name="plan_estudio" value={formData.plan_estudio} onChange={handleInputChange} disabled={modalMode==='view'} style={{width: '100%'}}>
                  <option value="">Seleccione...</option>
                  {planesEstudio.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>

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
            <div className="print-page" style={{ width: printMode === 'table' ? '297mm' : '210mm', minHeight: '100px', backgroundColor: 'white', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '15px' }}>
                <img src={logo} alt="Logo" style={{ width: '60px', marginRight: '20px' }} />
                <div style={{ color: 'black' }}>
                  <h1 style={{ fontSize: '18px', margin: 0 }}>Escuela Secundaria Gobernador Garmendia</h1>
                  <p style={{ fontSize: '12px', margin: 0 }}>CUE: 9001717/00 - Av. de la Soja S/N°</p>
                  <p style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{printMode === 'table' ? 'Reporte General Libro Matriz' : 'Ficha Individual Libro Matriz'}</p>
                </div>
              </div>

              {printMode === 'table' ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#eee', border: '1px solid black' }}>
                      <th>LIBRO</th><th>FOLIO</th><th>DNI</th><th>ALUMNO</th><th>AÑO ING.</th><th>ESTADO</th><th>EGRESO</th><th>TITULO</th><th>ADEUDA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(d => (
                      <tr key={d.id} style={{ border: '1px solid black' }}>
                        <td style={{ textAlign: 'center' }}>{d.libros_folios?.[0]?.libro}</td>
                        <td style={{ textAlign: 'center' }}>{d.libros_folios?.[0]?.folio}</td>
                        <td>{d.dni}</td>
                        <td>{d.apellido}, {d.nombre}</td>
                        <td style={{ textAlign: 'center' }}>{d.anio_ingreso}</td>
                        <td>{d.estado}</td>
                        <td style={{ textAlign: 'center' }}>{d.fecha_egreso || '---'}</td>
                        <td>{d.estado_titulo}</td>
                        <td style={{ textAlign: 'center' }}>{d.estado === 'EGRESADO' ? '---' : d.materias_adeudadas?.length || '---'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ color: 'black', fontSize: '13px', lineHeight: '2' }}>
                   <p><strong>ALUMNO:</strong> {formData.apellido}, {formData.nombre} <strong>DNI:</strong> {formData.dni}</p>
                   <p><strong>FECHA NAC.:</strong> {formData.fecha_nacimiento} <strong>LUGAR:</strong> {formData.lugar_nacimiento}</p>
                   <p><strong>PLAN DE ESTUDIO:</strong> {formData.plan_estudio}</p>
                   <p><strong>LIBROS / FOLIOS:</strong> {formData.libros_folios.map(lf => `Libro: ${lf.libro} - Folio: ${lf.folio}`).join(' | ')}</p>
                   <p><strong>CICLO LECTIVO:</strong> {formData.ciclo_lectivo} <strong>AÑO INGRESO:</strong> {formData.anio_ingreso}</p>
                   <p><strong>ESTADO:</strong> {formData.estado} {formData.fecha_egreso && `(Fecha: ${formData.fecha_egreso})`}</p>
                   {formData.estado_titulo && <p><strong>ESTADO DE TÍTULO:</strong> {formData.estado_titulo}</p>}
                   {formData.estado_titulo === "TITULO RETIRADO" && (
                     <p style={{marginLeft: '20px'}}>Copiador: {formData.titulo_data.copiador} | Folio: {formData.titulo_data.folio} | Serie: {formData.titulo_data.serie} | Nº: {formData.titulo_data.numero} | Retiro: {formData.titulo_data.fecha_retiro}</p>
                   )}
                   <p><strong>MATERIAS ADEUDADAS:</strong> {formData.estado === 'EGRESADO' ? 'NINGUNA' : (formData.materias_adeudadas.length > 0 ? formData.materias_adeudadas.map(ma => `${ma.curso}: ${ma.materia}`).join(', ') : '---')}</p>
                </div>
              )}
            </div>

            <div className="no-print" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button onClick={() => window.print()} style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px' }}>GUARDAR COMO PDF</button>
              <button onClick={() => window.print()} style={{ padding: '10px 20px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px' }}>IMPRIMIR</button>
              <button onClick={() => setShowPrint(false)} style={{ padding: '10px 20px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px' }}>CANCELAR</button>
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
