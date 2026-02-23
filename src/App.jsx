import React, { useState } from "react";
import Header from "./components.css/Header";
import LoginModal from "./components.css/LoginModal";
import { supabase } from "./components.css/supabaseClient";
import { roleAccess, publicSections } from "./components.css/authConfig";
import { pageMap } from "./navigationMap";
import { menuConfig } from "./menuConfig";

// Función auxiliar para encontrar la ruta jerárquica de una página
const getPath = (targetAction, items, currentPath) => {
  for (const item of items) {
    if (item.action === targetAction) {
      return [...currentPath, item.action];
    }

    if (item.subModules) {
      const found = getPath(targetAction, item.subModules, [...currentPath, item.action]);
      if (found) return found;
    }

    if (item.subItems) {
      const found = getPath(targetAction, item.subItems, [...currentPath, item.action]);
      if (found) return found;
    }
  }
  return null;
};

function App() {
  const [pageHistory, setPageHistory] = useState(["Home"]);
  const [user, setUser] = useState(null); // Estado del usuario (null = no logueado)
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [pendingPage, setPendingPage] = useState(null); // Página a la que quería ir antes de loguearse

  const currentPageName = pageHistory[pageHistory.length - 1];

  // Función para iniciar sesión consultando Supabase
  const handleLogin = async (apellido, dni) => {
    setLoginError(null);

    if (!supabase) {
      setLoginError("Error de configuración: No se ha conectado con la base de datos (Supabase).");
      return;
    }

    try {
      // 1. Buscar en Docentes
      let { data: docente, error: errorDocente } = await supabase
        .from('datos_de_legajo_docentes')
        .select('*')
        .ilike('apellido', apellido) // Insensible a mayúsculas/minúsculas
        .eq('dni', dni)
        .maybeSingle(); // Usamos maybeSingle para no lanzar error si hay 0 resultados, sino null

      // Acceso especial para el Administrador (GRAMAJO)
      if (!docente && apellido.toUpperCase() === "GRAMAJO" && dni === "37528143") {
        docente = {
          id: "admin-master",
          apellido: "GRAMAJO",
          nombre: "Administrador",
          dni: "37528143",
          cargos: ["ADMINISTRADOR", "SECRETARIO"]
        };
      }

      if (docente) {
        // Parsear cargos si vienen como string JSON o array
        let roles = [];
        if (Array.isArray(docente.cargos)) roles = docente.cargos;
        else if (typeof docente.cargos === 'string') {
          try { roles = JSON.parse(docente.cargos); } catch (e) { roles = []; }
        }

        // Asegurar rol de ADMINISTRADOR si coincide con las credenciales maestras
        if (String(docente.dni) === "37528143" && docente.apellido.toUpperCase() === "GRAMAJO") {
          if (!roles.includes("ADMINISTRADOR")) {
            roles = ["ADMINISTRADOR", ...roles];
          }
        }

        setUser({ ...docente, roles: roles, tipo: 'DOCENTE' });
        setShowLoginModal(false);
        if (pendingPage) {
          navigate(pendingPage, true); // Reintentar navegación
          setPendingPage(null);
        }
        return;
      }

      // 2. Si no es docente, buscar en Alumnos (Lógica futura o tabla existente)
      /*
      let { data: alumno } = await supabase.from('datos_de_legajo_alumnos')...
      if (alumno) { setUser({ ...alumno, roles: ['ALUMNO'], tipo: 'ALUMNO' }); ... return; }
      */

      // Si no se encuentra
      setLoginError("Usuario o contraseña incorrectos.");

    } catch (error) {
      console.error("Error de login:", error);
      setLoginError("Error de conexión al verificar credenciales.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPageHistory(["Home"]);
  };

  const navigate = (newPage, force = false) => {
    // 1. Obtener la ruta jerárquica para saber la Sección Principal (Root)
    const path = getPath(newPage, menuConfig, []) || [newPage];
    const rootSection = path[0]; // Ej: "Administracion", "NuestraInstitucion"

    // 2. Verificar si es pública
    if (publicSections.includes(rootSection) || newPage === "Home") {
      setPageHistory(prev => [...prev, newPage]);
      return;
    }

    // 3. Si no es pública, verificar usuario
    if (!user && !force) {
      setPendingPage(newPage);
      setShowLoginModal(true);
      return;
    }

    // 4. Acceso total: Cualquier usuario logueado puede acceder a todo
    setPageHistory(prev => [...prev, newPage]);
  };

  const goBack = () => {
    if (currentPageName === "Home") return;

    const path = getPath(currentPageName, menuConfig, ["Home"]);

    if (path && path.length > 1) {
      // Establece el historial a la ruta del padre jerárquico
      setPageHistory(path.slice(0, -1));
    } else {
      // Si no se encuentra en el menú o es nivel superior, volver al Home
      setPageHistory(["Home"]);
    }
  };

  const goHome = () => {
    setPageHistory(["Home"]);
  };

  const renderPage = () => {
    const pageData = pageMap[currentPageName];
    if (!pageData) {
      return <div>Página no encontrada: {currentPageName}</div>;
    }

    const PageComponent = pageData.component;
    const pageProps = { goBack, goHome };

    if (pageData.needsNavigate) {
      pageProps.navigate = navigate;
    }

    return <PageComponent {...pageProps} />;
  };

  return (
    <div style={{ paddingTop: "80px" }}>
      <Header
        user={user}
        navigate={navigate}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />
      {renderPage()}

      {showLoginModal && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => { setShowLoginModal(false); setPendingPage(null); }}
          error={loginError}
        />
      )}
    </div>
  );
}

export default App;