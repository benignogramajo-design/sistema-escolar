import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets/logos/Logo.png";

const CronogramaMesasExamen = ({ goBack, goHome }) => {
  // --- Estados de Datos ---
  const [cronogramas, setCronogramas] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [estructura, setEstructura] = useState([]);

  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("view"); // 'view', 'create', 'edit', 'delete'
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // --- Estado del Formulario ---
  const initialFormState = {
    docente_id: "",
    apellido_nombre: "",
    dni: "",
    turno: "",
    cursos_asignaturas: [], // Array para selección múltiple
    fecha_mesa: "",
    dia_semana: "",
    horario_desde: "",
    horario_hasta: ""
  };
  const [formData, setFormData] = useState(initialFormState);
  const [availableSubjects, setAvailableSubjects] = useState([]); // Materias filtradas por docente y turno

  // --- Estado de Filtros ---
  const [filters, setFilters] = useState({
    apellido_nombre: "",
    fecha: "",
    mes: "",
    anio: ""
  });

  // --- Carga de Datos ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: cronoData, error: cronoError },
        { data: docData, error: docError },
        { data: estData, error: estError }
      ] = await Promise.all([
        supabase.from('cronograma_mesas_examen').select('*').order('fecha_mesa', { ascending: true }),
        supabase.from('datos_de_legajo_docentes').select('id, apellido, nombre, dni').order('apellido'),
        supabase.from('estructura_horario').select('*')
      ]);

      if (cronoError) throw cronoError;
      if (docError) throw docError;
      // estError puede ser ignorado si la tabla no existe, pero asumimos que sí por el contexto
      
      setCronogramas(cronoData || []);
      setDocentes(docData || []);
      
      // Procesar estructura para asegurar que los campos JSON sean objetos
      const parsedEstructura = (estData || []).map(item => ({
        ...item,
        docente_titular: typeof item.docente_titular === 'string' ? JSON.parse(item.docente_titular) : item.docente_titular,
        docente_interino: typeof item.docente_interino === 'string' ? JSON.parse(item.docente_interino) : item.docente_interino,
        docentes_suplentes: typeof item.docentes_suplentes === 'string' ? JSON.parse(item.docentes_suplentes) : (item.docentes_suplentes || [])
      }));
      setEstructura(parsedEstructura);

    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica del Formulario ---

  // 1. Autocompletar DNI al seleccionar Docente
  useEffect(() => {
    if (formData.docente_id) {
      const doc = docentes.find(d => d.id === parseInt(formData.docente_id));
      if (doc) {
        setFormData(prev => ({
          ...prev,
          apellido_nombre: `${doc.apellido}, ${doc.nombre}`,
          dni: doc.dni
        }));
      }
    }
  }, [formData.docente_id, docentes]);

  // 2. Filtrar Materias (Cursos) según Docente y Turno
  useEffect(() => {
    if (formData.apellido_nombre && formData.turno) {
      const nombreDocente = formData.apellido_nombre;
      const turnoSeleccionado = formData.turno.toLowerCase();

      const materiasFiltradas = estructura.filter(item => {
        // Verificar si el docente está activo en este item
        const isTitular = item.docente_titular?.nombre === nombreDocente && item.docente_titular?.estado === 'ACTIVO';
        const isInterino = item.docente_interino?.nombre === nombreDocente && item.docente_interino?.estado === 'ACTIVO';
        const isSuplente = Array.isArray(item.docentes_suplentes) && item.docentes_suplentes.some(s => s.nombre === nombreDocente && s.estado === 'ACTIVO');
        
        const isActive = isTitular || isInterino || isSuplente;
        
        // Verificar turno (ignorando mayúsculas/minúsculas)
        const itemTurno = (item.turno || "").toLowerCase();
        const isTurnoMatch = itemTurno.includes(turnoSeleccionado);

        return isActive && isTurnoMatch;
      }).map(item => `${item.curso} ${item.division} - ${item.asignatura}`);

      // Eliminar duplicados y ordenar
      setAvailableSubjects([...new Set(materiasFiltradas)].sort());
    } else {
      setAvailableSubjects([]);
    }
  }, [formData.apellido_nombre, formData.turno, estructura]);

  // 3. Autocompletar Día según Fecha
  useEffect(() => {
    if (formData.fecha_mesa) {
      // Crear fecha asegurando zona horaria local para evitar errores de día
      const date = new Date(formData.fecha_mesa + 'T00:00:00');
      const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const diaSemana = dias[date.getDay()];
      setFormData(prev => ({ ...prev, dia_semana: diaSemana }));
    } else {
      setFormData(prev => ({ ...prev, dia_semana: "" }));
    }
  }, [formData.fecha_mesa]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const current = prev.cursos_asignaturas || [];
      const updated = checked 
        ? [...current, value] 
        : current.filter(item => item !== value);
      return { ...prev, cursos_asignaturas: updated };
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleNew = () => {
    setMode('create');
    setSelectedId(null);
    setFormData(initialFormState);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setMode('edit');
    setSelectedId(item.id);
    // Buscar el ID del docente basado en el nombre guardado para preseleccionar el dropdown
    const doc = docentes.find(d => `${d.apellido}, ${d.nombre}` === item.apellido_nombre);
    
    setFormData({
      docente_id: doc ? doc.id : "",
      apellido_nombre: item.apellido_nombre || "",
      dni: item.dni || "",
      turno: item.turno || "",
      cursos_asignaturas: item.cursos_asignaturas || [],
      fecha_mesa: item.fecha_mesa || "",
      dia_semana: item.dia_semana || "",
      horario_desde: item.horario_desde || "",
      horario_hasta: item.horario_hasta || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este registro?")) {
      try {
        const { error } = await supabase.from('cronograma_mesas_examen').delete().eq('id', id);
        if (error) throw error;
        fetchData();
      } catch (err) {
        alert("Error al eliminar: " + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        // Si no hay fecha, guardar null (se mostrará --- en tabla)
        fecha_mesa: formData.fecha_mesa || null,
        dia_semana: formData.fecha_mesa ? formData.dia_semana : "---"
      };

      let error;
      if (mode === 'edit') {
        ({ error } = await supabase.from('cronograma_mesas_examen').update(payload).eq('id', selectedId));
      } else {
        ({ error } = await supabase.from('cronograma_mesas_examen').insert([payload]));
      }

      if (error) throw error;

      await fetchData();
      setShowForm(false);
      setMode('view');
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  };

  const handlePrint = () => {
    const fullLogoUrl = new URL(logo, window.location.href).href;
    
    const rowsHtml = filteredData.map(item => `
      <tr>
        <td style="border: 1px solid #000; padding: 5px;">${item.apellido_nombre || ''}</td>
        <td style="border: 1px solid #000; padding: 5px;">${item.dni || ''}</td>
        <td style="border: 1px solid #000; padding: 5px;">${item.turno || ''}</td>
        <td style="border: 1px solid #000; padding: 5px;">
          ${(item.cursos_asignaturas || []).map(c => `<div>${c}</div>`).join('')}
        </td>
        <td style="border: 1px solid #000; padding: 5px;">${item.dia_semana || ''}</td>
        <td style="border: 1px solid #000; padding: 5px;">${formatDate(item.fecha_mesa)}</td>
        <td style="border: 1px solid #000; padding: 5px;">
          <div>Desde ${item.horario_desde || '--:--'}</div>
          <div>Hasta ${item.horario_hasta || '--:--'}</div>
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vista Previa - Cronograma Mesas de Examen</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th { background-color: #f2f2f2; border: 1px solid #000; padding: 8px; font-size: 12px; }
          td { border: 1px solid #000; padding: 8px; vertical-align: top; }
          .header-container { display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
          .logo { width: 60px; height: auto; margin-right: 20px; }
          .school-info h1 { font-size: 16px; margin: 0; }
          .school-info p { font-size: 12px; margin: 2px 0; }
          
          @media print {
            .no-print { display: none !important; }
            thead { display: table-header-group; } 
            tr { page-break-inside: avoid; }
            @page { size: A4 landscape; margin: 15mm; }
          }

          .preview-controls {
            position: fixed; bottom: 0; left: 0; width: 100%;
            background: #333; padding: 15px; text-align: center;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
          }
          .btn { padding: 10px 20px; margin: 0 10px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px; }
          .btn-print { background-color: yellow; color: black; }
          .btn-save { background-color: #fff; color: #333; }
          .btn-close { background-color: red; color: white; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th colspan="7" style="border: none; background: none; text-align: left; padding: 0 0 10px 0;">
                <div class="header-container">
                  <img src="${fullLogoUrl}" class="logo" alt="Logo" />
                  <div class="school-info">
                    <h1>Escuela Secundaria Gobernador Garmendia</h1>
                    <p>CUE: 9001717/00 - Av. de la Soja S/N° - Gobernador Garmendia - Burruyacu</p>
                    <p>escuelasecgarmendia@gmail.com</p>
                    <p style="font-weight: bold; font-size: 14px; margin-top: 5px;">CRONOGRAMA MESAS DE EXAMEN</p>
                  </div>
                </div>
              </th>
            </tr>
            <tr>
                <th>APELLIDO Y NOMBRE</th>
                <th>DNI</th>
                <th>TURNO</th>
                <th>CURSOS</th>
                <th>DIA</th>
                <th>FECHA</th>
                <th>HORARIO</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="preview-controls no-print">
          <button class="btn btn-save" onclick="window.print()">GUARDAR COMO PDF</button>
          <button class="btn btn-print" onclick="window.print()">IMPRIMIR</button>
          <button class="btn btn-close" onclick="window.close()">CERRAR</button>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  // --- Filtrado y Ordenamiento ---
  const filteredData = cronogramas.filter(item => {
    const itemDate = item.fecha_mesa ? new Date(item.fecha_mesa + 'T00:00:00') : null;
    const itemMes = itemDate ? (itemDate.getMonth() + 1).toString() : "";
    const itemAnio = itemDate ? itemDate.getFullYear().toString() : "";

    return (
      (!filters.apellido_nombre || (item.apellido_nombre || "").toLowerCase().includes(filters.apellido_nombre.toLowerCase())) &&
      (!filters.fecha || item.fecha_mesa === filters.fecha) &&
      (!filters.mes || itemMes === filters.mes) &&
      (!filters.anio || itemAnio === filters.anio)
    );
  }).sort((a, b) => {
    // Ordenar por fecha primero
    const dateA = a.fecha_mesa ? new Date(a.fecha_mesa) : new Date(0);
    const dateB = b.fecha_mesa ? new Date(b.fecha_mesa) : new Date(0);
    if (dateA - dateB !== 0) return dateA - dateB;
    
    // Luego por turno
    return (a.turno || "").localeCompare(b.turno || "");
  });

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-AR');
  };

  if (loading) return <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}><NavBar goBack={goBack} goHome={goHome} /><p>Cargando...</p></div>;
  if (error) return <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}><NavBar goBack={goBack} goHome={goHome} /><p>Error: {error}</p></div>;

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>CRONOGRAMA MESAS DE EXAMEN</h2>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
        <input type="text" name="apellido_nombre" placeholder="APELLIDO Y NOMBRE" value={filters.apellido_nombre} onChange={handleFilterChange} style={{ padding: '5px' }} />
        <input type="date" name="fecha" value={filters.fecha} onChange={handleFilterChange} style={{ padding: '5px' }} />
        <select name="mes" value={filters.mes} onChange={handleFilterChange} style={{ padding: '5px' }}>
          <option value="">MES</option>
          {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
        </select>
        <input type="number" name="anio" placeholder="AÑO" value={filters.anio} onChange={handleFilterChange} style={{ padding: '5px', width: '80px' }} />
      </div>

      {/* Botones de Acción */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0' }}>
        <button onClick={handleNew} style={{ backgroundColor: 'blue', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>NUEVO</button>
        <button onClick={() => setMode(prev => prev === 'edit' ? 'view' : 'edit')} style={{ backgroundColor: 'green', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>MODIFICAR</button>
        <button onClick={() => setMode(prev => prev === 'delete' ? 'view' : 'delete')} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>ELIMINAR</button>
        <button onClick={handlePrint} style={{ backgroundColor: 'yellow', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>IMPRIMIR</button>
      </div>

      {/* Formulario Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ textAlign: 'center' }}>{mode === 'create' ? 'Nueva Mesa de Examen' : 'Modificar Mesa'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              
              <label style={{ gridColumn: '1 / -1' }}>APELLIDO Y NOMBRE:
                <select name="docente_id" value={formData.docente_id} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }}>
                  <option value="">Seleccione...</option>
                  {docentes.map(d => <option key={d.id} value={d.id}>{d.apellido}, {d.nombre}</option>)}
                </select>
              </label>

              <label>DNI:
                <input name="dni" value={formData.dni} readOnly style={{ width: '100%', padding: '8px', backgroundColor: '#eee' }} />
              </label>

              <label>TURNO:
                <select name="turno" value={formData.turno} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }}>
                  <option value="">Seleccione...</option>
                  <option value="Mañana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                </select>
              </label>

              <div style={{ gridColumn: '1 / -1', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>CURSO QUE POSEE EL DOCENTE:</label>
                {availableSubjects.length > 0 ? (
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {availableSubjects.map((subj, idx) => (
                      <div key={idx} style={{ marginBottom: '5px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                          <input 
                            type="checkbox" 
                            value={subj} 
                            checked={formData.cursos_asignaturas.includes(subj)} 
                            onChange={handleCheckboxChange}
                            style={{ marginRight: '8px' }}
                          />
                          {subj}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: 'red' }}>Seleccione un docente y turno para ver materias activas.</p>
                )}
              </div>

              <label>FECHA:
                <input type="date" name="fecha_mesa" value={formData.fecha_mesa} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} />
              </label>

              <label>DIA:
                <input name="dia_semana" value={formData.dia_semana} readOnly style={{ width: '100%', padding: '8px', backgroundColor: '#eee' }} />
              </label>

              <label>HORARIO DESDE:
                <input type="time" name="horario_desde" value={formData.horario_desde} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} />
              </label>

              <label>HORARIO HASTA:
                <input type="time" name="horario_hasta" value={formData.horario_hasta} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} />
              </label>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px' }}>Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla Principal */}
      <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%", overflowX: 'auto' }}>
        {mode === 'edit' && <div style={{ backgroundColor: '#e6fffa', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid green', borderRadius: '5px' }}>Seleccione un registro para modificar.</div>}
        {mode === 'delete' && <div style={{ backgroundColor: '#fff5f5', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid red', borderRadius: '5px' }}>Seleccione un registro para eliminar.</div>}
        
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)", fontSize: '11px' }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th>APELLIDO Y NOMBRE</th>
              <th>DNI</th>
              <th>TURNO</th>
              <th>CURSOS</th>
              <th>DIA</th>
              <th>FECHA</th>
              <th>HORARIO</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map(item => (
              <tr key={item.id} onClick={() => (mode === 'edit' ? handleEdit(item) : (mode === 'delete' ? handleDelete(item.id) : null))} style={{ cursor: (mode === 'edit' || mode === 'delete') ? 'pointer' : 'default' }}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.apellido_nombre}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.dni}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.turno}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {(item.cursos_asignaturas || []).map((c, i) => <div key={i}>{c}</div>)}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.dia_semana || '---'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatDate(item.fecha_mesa)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <div>Desde {item.horario_desde || '--:--'}</div>
                  <div>Hasta {item.horario_hasta || '--:--'}</div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron registros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CronogramaMesasExamen;
