// src/authConfig.js

// Definimos a qué secciones principales (del menú) tiene acceso cada rol
export const roleAccess = {
  "ADMINISTRADOR": ["NuestraInstitucion", "Administracion", "Preceptoria", "Gabinete", "Alumnos", "DocentesPortal", "Biblioteca", "DocentesUsuarios", "UsuariosPersonal", "UsuariosAlumnos"],
  "DIRECTOR/A": ["NuestraInstitucion", "Administracion", "Preceptoria", "Gabinete", "Alumnos", "DocentesPortal", "Biblioteca", "DocentesUsuarios", "UsuariosPersonal", "UsuariosAlumnos"],
  "SECRETARIO": ["NuestraInstitucion", "Administracion", "Preceptoria", "Gabinete", "Alumnos", "DocentesPortal", "Biblioteca", "DocentesUsuarios", "UsuariosPersonal", "UsuariosAlumnos"],
  "AYUDANTE DE SECRETARIA": ["NuestraInstitucion", "Administracion", "Preceptoria", "Gabinete", "Alumnos", "DocentesPortal", "Biblioteca", "DocentesUsuarios", "UsuariosPersonal", "UsuariosAlumnos"],
  
  "PRECEPTOR": ["NuestraInstitucion", "Preceptoria"],
  
  "ASESOR PED.": ["NuestraInstitucion", "Gabinete", "DocentesPortal"],
  
  "DOCENTE": ["NuestraInstitucion", "DocentesPortal"],
  
  "BIBLIOTECARIO/A": ["NuestraInstitucion", "DocentesPortal", "Biblioteca"],
  
  "AYUDANTE CLASES PRACTICAS (TECN/INFORM)": ["NuestraInstitucion", "DocentesPortal"],
  "AYUDANTE CLASES PRACTICAS (FISICA)": ["NuestraInstitucion", "DocentesPortal"],
  
  "PERSONAL AUXILIAR (CAT. 18)": ["NuestraInstitucion", "DocentesPortal"],
  "PERSONAL AUXILIAR (CAT. 15)": ["NuestraInstitucion", "DocentesPortal"],
  
  "ALUMNO": ["NuestraInstitucion", "Alumnos"],
};

// Secciones que son públicas (se pueden ver sin iniciar sesión)
// "Home" es la pantalla de los botones, "NuestraInstitucion" es la única sección pública según tu pedido.
export const publicSections = ["Home", "NuestraInstitucion"];