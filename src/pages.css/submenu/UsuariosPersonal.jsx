import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";

const UsuariosPersonal = ({ goBack, goHome }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ cargo: "", apellido_nombre: "", estado: "" });
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ username: "", password: "", is_active: true, is_blocked: false });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all teachers from the main legajo table
      const { data: docentes, error: docentesError } = await supabase
        .from('datos_de_legajo_docentes')
        .select('id, apellido, nombre, cargos, dni')
        .order('apellido');
      if (docentesError) throw docentesError;

      // 2. Fetch all custom user accounts
      const { data: userAccounts, error: accountsError } = await supabase
        .from('usuarios_personal')
        .select('*');
      if (accountsError) throw accountsError;

      // Create a map for quick lookups
      const accountsMap = new Map(userAccounts.map(acc => [acc.docente_id, acc]));

      // 3. Combine the data
      const combinedUsers = docentes.map(doc => {
        const account = accountsMap.get(doc.id);
        const nombreCompleto = `${doc.apellido}, ${doc.nombre}`;
        
        let cargos = [];
        if (Array.isArray(doc.cargos)) cargos = doc.cargos;
        else if (typeof doc.cargos === 'string') {
          try { cargos = JSON.parse(doc.cargos); } catch (e) { cargos = []; }
        }

        if (account) {
          // User has a custom account
          return {
            docente_id: doc.id,
            apellido_nombre: nombreCompleto,
            cargos: cargos.join(', '),
            username: account.username,
            password: account.password, // Note: Displaying password is not secure
            is_active: account.is_active,
            is_blocked: account.is_blocked,
            has_custom_account: true,
            account_id: account.id
          };
        } else {
          // User uses default credentials
          return {
            docente_id: doc.id,
            apellido_nombre: nombreCompleto,
            cargos: cargos.join(', '),
            username: doc.apellido,
            password: doc.dni,
            is_active: true, // Default assumption
            is_blocked: false, // Default assumption
            has_custom_account: false,
            account_id: null
          };
        }
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Error al cargar los datos de usuarios: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleModifyClick = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      is_active: user.is_active,
      is_blocked: user.is_blocked
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const payload = {
      docente_id: currentUser.docente_id,
      username: formData.username,
      password: formData.password,
      is_active: formData.is_active,
      is_blocked: formData.is_blocked,
    };

    try {
      let error;
      if (currentUser.has_custom_account) {
        // Update existing account
        ({ error } = await supabase
          .from('usuarios_personal')
          .update(payload)
          .eq('id', currentUser.account_id));
      } else {
        // Insert new account
        ({ error } = await supabase
          .from('usuarios_personal')
          .insert([payload]));
      }

      if (error) throw error;

      alert("Usuario actualizado correctamente.");
      setShowModal(false);
      setCurrentUser(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("Error al guardar los cambios: " + error.message);
    }
  };

  // Filter logic
  const filteredUsers = users.filter(user => {
    const f = filters;
    const matchCargo = !f.cargo || (user.cargos || "").toLowerCase().includes(f.cargo.toLowerCase());
    const matchNombre = !f.apellido_nombre || (user.apellido_nombre || "").toLowerCase().includes(f.apellido_nombre.toLowerCase());
    
    let matchEstado = true;
    if (f.estado === "ACTIVO") {
      matchEstado = user.is_active && !user.is_blocked;
    } else if (f.estado === "BLOQUEADO") {
      matchEstado = user.is_blocked;
    }

    return matchCargo && matchNombre && matchEstado;
  });

  const uniqueCargos = [...new Set(users.flatMap(u => (u.cargos || "").split(', ')).filter(Boolean))].sort();

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>USUARIO DEL PERSONAL</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
        <select value={filters.cargo} onChange={e => setFilters({...filters, cargo: e.target.value})} style={{ padding: '5px' }}>
          <option value="">CARGO</option>
          {uniqueCargos.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="APELLIDO Y NOMBRE" value={filters.apellido_nombre} onChange={e => setFilters({...filters, apellido_nombre: e.target.value})} style={{ padding: '5px' }} />
        <select value={filters.estado} onChange={e => setFilters({...filters, estado: e.target.value})} style={{ padding: '5px' }}>
          <option value="">ESTADO</option>
          <option value="ACTIVO">ACTIVO</option>
          <option value="BLOQUEADO">BLOQUEADO</option>
        </select>
      </div>

      {/* Table */}
      <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%", overflowX: 'auto' }}>
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)", fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>CARGO</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>APELLIDO Y NOMBRE</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>USUARIO</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>CONTRASEÑA</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>ACTIVO</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>BLOQUEADO</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>MODIFICAR</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.docente_id}>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{user.cargos}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{user.apellido_nombre}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{user.username}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{user.password}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: 'center' }}>
                    {user.is_active && <strong style={{ color: 'green' }}>ACTIVO</strong>}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: 'center' }}>
                    {user.is_blocked && <strong style={{ color: 'red' }}>BLOQUEADO</strong>}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: 'center' }}>
                    <button 
                      onClick={() => handleModifyClick(user)}
                      style={{ backgroundColor: 'green', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                    >
                      MODIFICAR
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron usuarios.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Editing */}
      {showModal && currentUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px', position: 'relative' }}>
            <h3 style={{ textAlign: 'center', marginTop: 0 }}>Modificar Usuario</h3>
            <p style={{ textAlign: 'center', fontWeight: 'bold' }}>{currentUser.apellido_nombre}</p>
            <p style={{ textAlign: 'center', color: '#555', fontSize: '14px' }}>Cargo: {currentUser.cargos}</p>
            
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '15px' }}>
                <label>Usuario:</label>
                <input 
                  type="text" 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Contraseña:</label>
                <input 
                  type="text" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  /> Activo
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={formData.is_blocked}
                    onChange={e => setFormData({...formData, is_blocked: e.target.checked})}
                  /> Bloqueado
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Guardar Cambios</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPersonal;