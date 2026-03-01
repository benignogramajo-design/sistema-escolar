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
      // --- NUEVA LÓGICA DE LOGIN ---

      // 1. Intentar iniciar sesión con la tabla de usuarios_personal (método principal)
      const { data: userAccount, error: accountError } = await supabase
        .from('usuarios_personal')
        .select('*, docente:datos_de_legajo_docentes(id, apellido, nombre, cargos)')
        .eq('username', apellido) // 'apellido' del form es el 'username'
        .eq('password', dni)      // 'dni' del form es la 'password'
        .maybeSingle();

      if (accountError) throw accountError;

      if (userAccount) {
        if (userAccount.is_blocked) {
          setLoginError("Su cuenta se encuentra bloqueada. Contacte al administrador.");
          return;
        }
        if (!userAccount.is_active) {
          setLoginError("Su cuenta no está activa. Contacte al administrador.");
          return;
        }

        // Usuario encontrado y válido, obtener datos del docente asociado
        const { data: docenteData, error: docenteError } = await supabase
          .from('datos_de_legajo_docentes')
          .select('*')
          .eq('id', userAccount.docente_id)
          .single();
        
        if (docenteError) throw docenteError;

        let roles = [];
        if (Array.isArray(docenteData.cargos)) {
          roles = docenteData.cargos;
        } else if (typeof docenteData.cargos === 'string') {
          try { roles = JSON.parse(docenteData.cargos); } catch (e) { roles = []; }
        }
        setUser({ ...docenteData, roles, tipo: 'DOCENTE' });
        setShowLoginModal(false);
        if (pendingPage) navigate(pendingPage, true);
        setPendingPage(null);
        return;
      }

      // 2. Si no se encontró en usuarios_personal, intentar método de fallback (apellido/dni)
      const { data: docenteFallback, error: fallbackError } = await supabase
        .from('datos_de_legajo_docentes')
        .select('*')
        .ilike('apellido', apellido)
        .eq('dni', dni)
        .maybeSingle();

      if (fallbackError) throw fallbackError;

      if (docenteFallback) {
        // Se encontró un docente con apellido/dni. VERIFICAR que no tenga una cuenta custom.
        const { data: existingAccount, error: checkError } = await supabase.from('usuarios_personal').select('id').eq('docente_id', docenteFallback.id).maybeSingle();
        if (checkError) throw checkError;

        if (existingAccount) {
          setLoginError("Sus credenciales han sido actualizadas. Por favor, use su nuevo usuario y contraseña.");
          return;
        }

        // No tiene cuenta custom, puede loguear con el método antiguo.
        let roles = [];
        if (Array.isArray(docenteFallback.cargos)) {
          roles = docenteFallback.cargos;
        } else if (typeof docenteFallback.cargos === 'string') {
          try { roles = JSON.parse(docenteFallback.cargos); } catch (e) { roles = []; }
        }
        setUser({ ...docenteFallback, roles, tipo: 'DOCENTE' });
        setShowLoginModal(false);
        if (pendingPage) navigate(pendingPage, true);
        setPendingPage(null);
        return;
      }

      // 3. Si ninguna de las dos formas funciona
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

    // 4. Verificar permisos del rol
    const userRoles = user?.roles || [];
    // Verificamos si ALGUNO de los roles del usuario tiene permiso para esta sección
    const hasAccess = userRoles.some(rol => roleAccess[rol]?.includes(rootSection));

    if (hasAccess || force) {
      setPageHistory(prev => [...prev, newPage]);
    } else {
      alert("No tiene permisos para acceder a esta sección.");
    }
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