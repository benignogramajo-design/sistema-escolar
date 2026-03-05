import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets/logos/Logo.png";

const AsignarResponsableCurso = ({ goBack, goHome }) => {
  // Data states
  const [asignaciones, setAsignaciones] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [codigos, setCodigos] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("view"); // 'view', 'create', 'edit', 'delete'
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Form state
  const initialFormState = {
    cargo: "",
    docente_id: "",
    curso: "",
    division: "",
    turno: "",
    dia: "",
    asignatura: "",
    estado: "HABILITADO",
  };
  const [formData, setFormData] = useState(initialFormState);

  // Form-dependent options
  const [availableDivisions, setAvailableDivisions] = useState([]);
  const [availableAsignaturas, setAvailableAsignaturas] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    cargo: "",
    docente_nombre: "",
    curso: "",
    division: "",
    turno: "",
    dia: "",
    asignatura: "",
    estado: "",
  });

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const cargosList = [
    "DIRECTOR/A", "SECRETARIO", "AYUDANTE DE SECRETARIA", "PRECEPTOR",
    "ASESOR PED.", "DOCENTE", "BIBLIOTECARIO/A",
    "AYUDANTE CLASES PRACTICAS (TECN/INFORM)", "AYUDANTE CLASES PRACTICAS (FISICA)",
    "PERSONAL AUXILIAR (CAT. 18)", "PERSONAL AUXILIAR (CAT. 15)"
  ];

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: asignacionesData, error: asignacionesError },
        { data: docentesData, error: docentesError },
        { data: codigosData, error: codigosError },
      ] = await Promise.all([
        supabase.from('responsables_de_curso').select('*').order('curso').order('division'),
        supabase.from('datos_de_legajo_docentes').select('id, apellido, nombre').order('apellido'),
        supabase.from('codigos').select('cargo, curso, division, turno, asignatura'),
      ]);

      if (asignacionesError) throw asignacionesError;
      if (docentesError) throw docentesError;
      if (codigosError) throw codigosError;

      setAsignaciones(asignacionesData || []);
      setDocentes(docentesData.map(d => ({ id: d.id, nombre: `${d.apellido}, ${d.nombre}` })) || []);
      setCodigos(codigosData || []);

    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- FORM LOGIC & DEPENDENCIES ---
  useEffect(() => {
    if (formData.curso) {
      const uniqueDivisions = [...new Set(codigos.filter(c => c.curso === formData.curso).map(c => c.division))].sort();
      setAvailableDivisions(uniqueDivisions);
    } else {
      setAvailableDivisions([]);
    }
    setFormData(prev => ({ ...prev, division: "", asignatura: "", turno: "" }));
  }, [formData.curso, codigos]);

  useEffect(() => {
    if (formData.curso && formData.division) {
      const match = codigos.find(c => c.curso === formData.curso && c.division === formData.division);
      const uniqueAsignaturas = [...new Set(codigos.filter(c => c.curso === formData.curso && c.division === formData.division).map(c => c.asignatura))].sort();
      
      setAvailableAsignaturas(uniqueAsignaturas);
      if (match) {
        setFormData(prev => ({ ...prev, turno: match.turno || "" }));
      }
    } else {
      setAvailableAsignaturas([]);
    }
  }, [formData.curso, formData.division, codigos]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    setFormData({
      cargo: item.cargo || "",
      docente_id: item.docente_id || "",
      curso: item.curso || "",
      division: item.division || "",
      turno: item.turno || "",
      dia: item.dia || "",
      asignatura: item.asignatura || "",
      estado: item.estado || "HABILITADO",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta asignación?")) {
      try {
        const { error } = await supabase.from('responsables_de_curso').delete().eq('id', id);
        if (error) throw error;
        setAsignaciones(asignaciones.filter(r => r.id !== id));
      } catch (err) {
        setError(err.message);
        alert("Error al eliminar: " + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const docente = docentes.find(d => d.id === parseInt(formData.docente_id));
    if (!docente) {
      alert("Docente no válido.");
      return;
    }

    const payload = {
      ...formData,
      docente_nombre: docente.nombre,
      asignatura: formData.cargo === 'DOCENTE' ? formData.asignatura : null,
      dia: formData.cargo === 'DOCENTE' ? formData.dia : null,
    };
    // If not a teacher, set fields to '---' for display consistency
    if (payload.cargo !== 'DOCENTE') {
        payload.asignatura = '---';
        payload.dia = '---';
    }


    try {
      let error;
      if (mode === 'edit') {
        ({ error } = await supabase.from('responsables_de_curso').update(payload).eq('id', selectedId));
      } else {
        ({ error } = await supabase.from('responsables_de_curso').insert([payload]));
      }

      if (error) throw error;

      await fetchData();
      setShowForm(false);
      setMode('view');

    } catch (err) {
      setError(err.message);
      alert("Error al guardar: " + err.message);
    }
  };

  const handleRowClick = (item) => {
    if (mode === 'edit') {
      handleEdit(item);
    } else if (mode === 'delete') {
      handleDelete(item.id);
    }
  };
  
  const handlePrint = () => {
    const fullLogoUrl = new URL(logo, window.location.href).href;
    
    const rowsHtml = filteredData.map(item => `
      <tr>
        <td style="border: 1px solid #000; padding: 8px; font-size: 11px;">${item.cargo || ''}</td>
        <td style="border: 1px solid #000; padding: 8px; font-size: 11px;">${item.docente_nombre || ''}</td>
        <td style="border: 1px solid #000; padding: 8px; font-size: 11px; text-align: center;">${item.curso || ''}</td>
        <td style="border: 1px solid #000; padding: 8px; font-size: 11px; text-align: center;">${item.division || ''}</td>
        <td style="border: 1px solid #000; padding: 8px; font-size: 11px;">${item.turno || ''}</td>
        <td style="border: 1px solid #000; padding: 8px; font-size: 11px;">${item.dia || ''}</td>
        <td style="border: 1px solid #000; padding: 8px; font-size: 11px;">${item.asignatura || ''}</td>
        <td style="border: 1px solid #000; padding: 8px; font-size: 11px;">${item.estado || ''}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vista Previa - Responsables de Curso</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #f2f2f2; border: 1px solid #000; padding: 8px; font-size: 12px; }
          td { border: 1px solid #000; padding: 8px; font-size: 11px; }
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
              <th colspan="8" style="border: none; background: none; text-align: left; padding: 0 0 10px 0;">
                <div class="header-container">
                  <img src="${fullLogoUrl}" class="logo" alt="Logo" />
                  <div class="school-info">
                    <h1>Escuela Secundaria Gobernador Garmendia</h1>
                    <p>CUE: 9001717/00 - Av. de la Soja S/N° - Gobernador Garmendia - Burruyacu</p>
                    <p>escuelasecgarmendia@gmail.com</p>
                    <p style="font-weight: bold; font-size: 14px; margin-top: 5px;">RESPONSABLES DE CURSO</p>
                  </div>
                </div>
              </th>
            </tr>
            <tr>
                <th>CARGO</th>
                <th>APELLIDO Y NOMBRE</th>
                <th>CURSO</th>
                <th>DIVISION</th>
                <th>TURNO</th>
                <th>DIA</th>
                <th>ASIGNATURA</th>
                <th>ESTADO</th>
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

  // --- FILTERING & DERIVED DATA ---
  const filteredData = asignaciones.filter(item => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      return item[key]?.toString().toLowerCase().includes(filters[key].toLowerCase());
    });
  });

  const getUniqueOptions = (field) => {
    return [...new Set(asignaciones.map(item => item[field]).filter(Boolean))].sort();
  };

  // --- RENDER ---
  const renderEstado = (estado) => {
    const isHabilitado = estado === 'HABILITADO';
    const style = {
      fontWeight: 'bold',
      color: isHabilitado ? 'green' : 'red',
    };
    return <span style={style}>{estado}</span>;
  };

  if (loading) return <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}><NavBar goBack={goBack} goHome={goHome} /> <p>Cargando...</p></div>;
  if (error) return <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}><NavBar goBack={goBack} goHome={goHome} /><p>Error: {error}</p></div>;

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>ASIGNAR RESPONSABLE DE CURSO</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
        {Object.keys(filters).map(key => (
          <select key={key} name={key} value={filters[key]} onChange={handleFilterChange} style={{ padding: '5px' }}>
            <option value="">{`Todos los ${key.replace('_', ' ')}`}</option>
            {getUniqueOptions(key).map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0' }}>
        <button onClick={handleNew} style={{ backgroundColor: 'blue', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>NUEVO</button>
        <button onClick={() => setMode('edit')} style={{ backgroundColor: 'green', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>MODIFICAR</button>
        <button onClick={() => setMode('delete')} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>ELIMINAR</button>
        <button onClick={handlePrint} style={{ backgroundColor: 'yellow', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>IMPRIMIR</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', position: 'relative' }}>
            <h3 style={{ textAlign: 'center' }}>{mode === 'create' ? 'Nueva Asignación' : 'Modificar Asignación'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <label>CARGO:
                <select name="cargo" value={formData.cargo} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }}>
                  <option value="">Seleccione...</option>
                  {cargosList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>APELLIDO Y NOMBRE:
                <select name="docente_id" value={formData.docente_id} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }}>
                  <option value="">Seleccione...</option>
                  {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </label>
              <label>CURSO:
                <select name="curso" value={formData.curso} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}>
                  <option value="">Seleccione...</option>
                  {[...new Set(codigos.map(c => c.curso))].sort().map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>DIVISION:
                <select name="division" value={formData.division} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} disabled={!formData.curso}>
                  <option value="">Seleccione...</option>
                  {availableDivisions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label>TURNO:
                <input name="turno" value={formData.turno} readOnly style={{ width: '100%', padding: '8px', backgroundColor: '#eee' }} />
              </label>
              <label>ESTADO:
                <select name="estado" value={formData.estado} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }}>
                  <option value="HABILITADO">HABILITADO</option>
                  <option value="NO HABILITADO">NO HABILITADO</option>
                </select>
              </label>
              {formData.cargo === 'DOCENTE' && (
                <>
                  <label>DIA:
                    <select name="dia" value={formData.dia} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}>
                      <option value="">Seleccione...</option>
                      {diasSemana.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>
                  <label>ASIGNATURA:
                    <select name="asignatura" value={formData.asignatura} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} disabled={!formData.division}>
                      <option value="">Seleccione...</option>
                      {availableAsignaturas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </label>
                </>
              )}
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px' }}>Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%" }}>
        {mode === 'edit' && <div style={{ backgroundColor: '#e6fffa', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid green', borderRadius: '5px' }}>Seleccione un registro para modificar.</div>}
        {mode === 'delete' && <div style={{ backgroundColor: '#fff5f5', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid red', borderRadius: '5px' }}>Seleccione un registro para eliminar.</div>}
        
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)" }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th>CARGO</th>
              <th>APELLIDO Y NOMBRE</th>
              <th>CURSO</th>
              <th>DIVISION</th>
              <th>TURNO</th>
              <th>DIA</th>
              <th>ASIGNATURA</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)} style={{ cursor: (mode === 'edit' || mode === 'delete') ? 'pointer' : 'default' }}>
                <td>{item.cargo}</td>
                <td>{item.docente_nombre}</td>
                <td>{item.curso}</td>
                <td>{item.division}</td>
                <td>{item.turno}</td>
                <td>{item.dia}</td>
                <td>{item.asignatura}</td>
                <td>{renderEstado(item.estado)}</td>
              </tr>
            )) : (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron registros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AsignarResponsableCurso;