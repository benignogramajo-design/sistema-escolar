import React, { useState } from "react";
import Header from "./components.css/Header";
import { pageMap } from "./navigationMap";
import { menuConfig } from "./menuConfig";

import PlanillasCompendios from "./pages.css/submenu/PlanillasCompendios";
import CompendiosHabilitar from "./pages.css/submenu/CompendiosHabilitar";
import CompendiosCargados from "./pages.css/submenu/CompendiosCargados";

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

  const user = { nombre: "Benigno", apellido: "Gramajo", rol: "Administrador" };

  const currentPageName = pageHistory[pageHistory.length - 1];

  const navigate = (newPage) => {
    setPageHistory([...pageHistory, newPage]);
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
    // Extendemos el mapa de navegación con las nuevas páginas
    const fullPageMap = {
      ...pageMap,
      PlanillasCompendios: { component: PlanillasCompendios, needsNavigate: true },
      CompendiosHabilitar: { component: CompendiosHabilitar },
      CompendiosCargados: { component: CompendiosCargados },
    };

    const pageData = fullPageMap[currentPageName];
    if (!pageData) {
      // Opcional: mostrar una página de error 404 si la ruta no existe
      return <div>Página no encontrada</div>;
    }

    const PageComponent = pageData.component;
    const pageProps = { goBack, goHome };

    // Las páginas que pueden navegar a subpáginas necesitan la función `navigate`
    if (pageData.needsNavigate) {
      pageProps.navigate = navigate;
    }

    return <PageComponent {...pageProps} />;
  };

  return (
    <div style={{ paddingTop: "80px" }}>
      <Header user={user} navigate={navigate} />
      {renderPage()}
    </div>
  );
}

export default App;
