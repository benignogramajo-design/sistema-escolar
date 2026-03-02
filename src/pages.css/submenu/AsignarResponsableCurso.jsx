import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";

const AsignarResponsableCurso = ({ goBack, goHome }) => {
  const [responsables, setResponsables] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [selectedCurso, setSelectedCurso] = useState("");
  const [selectedDocente, setSelectedDocente] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch current assignments
        const { data: responsablesData, error: responsablesError } = await supabase
          .from('responsables_de_curso')
          .select('*')
          .order('curso', { ascending: true })
          .order('division', { ascending: true });
        if (responsablesError) throw responsablesError;
        setResponsables(responsablesData || []);

        // 2. Fetch teachers
        const { data: docentesData, error: docentesError } = await supabase
          .from('datos_de_legajo_docentes')
          .select('id, apellido, nombre')
          .order('apellido', { ascending: true });
        if (docentesError) throw docentesError;
        setDocentes(docentesData.map(d => ({ id: d.id, nombre: `${d.apellido}, ${d.nombre}` })) || []);

        // 3. Fetch courses from 'codigos' table
        const { data: codigosData, error: codigosError } = await supabase
          .from('codigos')
          .select('curso, division');
        if (codigosError) throw codigosError;
        
        const uniqueCursos = codigosData
          .filter(c => c.curso && c.division)
          .map(c => `${c.curso}° ${c.division}`)
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        setCursos(uniqueCursos);

      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCurso || !selectedDocente) {
      alert("Por favor, seleccione un curso y un docente.");
      return;
    }

    const [curso, division] = selectedCurso.split('° ');
    const docente = docentes.find(d => d.id === parseInt(selectedDocente));

    const payload = {
      curso: curso,
      division: division,
      docente_id: docente.id,
      docente_nombre: docente.nombre,
    };

    try {
      let error;
      if (editingId) {
        ({ error } = await supabase.from('responsables_de_curso').update(payload).eq('id', editingId));
      } else {
        ({ error } = await supabase.from('responsables_de_curso').insert([payload]));
      }

      if (error) throw error;

      const { data } = await supabase.from('responsables_de_curso').select('*').order('curso').order('division');
      setResponsables(data || []);
      handleCancelEdit();

    } catch (err) {
      setError(err.message);
      alert("Error al guardar la asignación: " + err.message);
    }
  };

  const handleEdit = (responsable) => {
    setEditingId(responsable.id);
    setSelectedCurso(`${responsable.curso}° ${responsable.division}`);
    setSelectedDocente(responsable.docente_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta asignación?")) {
      try {
        const { error } = await supabase.from('responsables_de_curso').delete().eq('id', id);
        if (error) throw error;
        setResponsables(responsables.filter(r => r.id !== id));
      } catch (err) {
        setError(err.message);
        alert("Error al eliminar la asignación: " + err.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSelectedCurso("");
    setSelectedDocente("");
  };

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>ASIGNAR RESPONSABLE DE CURSO</h2>
      <div className="contenido-submenu" style={{ maxWidth: '900px' }}>
        
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3 style={{ textAlign: 'center', marginTop: 0 }}>{editingId ? 'Modificar Asignación' : 'Nueva Asignación'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
            <div>
              <label htmlFor="curso-select">Curso y División</label>
              <select id="curso-select" value={selectedCurso} onChange={(e) => setSelectedCurso(e.target.value)} required style={{ width: '100%', padding: '8px' }}>
                <option value="">Seleccione un curso...</option>
                {cursos.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="docente-select">Docente Responsable</label>
              <select id="docente-select" value={selectedDocente} onChange={(e) => setSelectedDocente(e.target.value)} required style={{ width: '100%', padding: '8px' }}>
                <option value="">Seleccione un docente...</option>
                {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '8px 20px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} style={{ padding: '8px 20px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </form>

        {loading && <p>Cargando asignaciones...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        {!loading && !error && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#333', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Curso</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Docente Responsable</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {responsables.length > 0 ? (
                responsables.map(r => (
                  <tr key={r.id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{r.curso}° {r.division}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{r.docente_nombre}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <button onClick={() => handleEdit(r)} style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => handleDelete(r.id)} style={{ padding: '5px 10px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Eliminar</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>No hay responsables asignados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AsignarResponsableCurso;