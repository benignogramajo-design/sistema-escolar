// src/components/MenuDrawer.jsx
import React, { useState } from "react";
import "../styles/menu.css";
import { menuConfig } from "../menuConfig";

const MenuDrawer = ({ user, navigate, onClose }) => {
  const [openState, setOpenState] = useState({});

  const handleSubItemClick = (subItem) => {
    navigate(subItem.action);
    if (onClose) onClose();
  };

  return (
    <div className="menu-drawer">
      {menuConfig.map((item, level1Index) => (
        <div key={level1Index} className="menu-container">
          <div
            className="menu-item"
            onClick={() =>
              setOpenState((prev) => ({
                ...prev,
                [level1Index]: !prev[level1Index],
              }))
            }
          >
            <span>{item.title}</span>
            <span className={`arrow ${openState[level1Index] ? "open" : ""}`}>
              ▸
            </span>
          </div>
          {openState[level1Index] && (
            <div className="submenu">
              {/* Si tiene sub-módulos (caso Administración) */}
              {item.subModules &&
                item.subModules.map((subModule, level2Index) => (
                  <div key={`${level1Index}-${level2Index}`} className="menu-container nested">
                    <div
                      className="menu-item sub-module-item"
                      onClick={() =>
                        setOpenState((prev) => ({
                          ...prev,
                          [`${level1Index}-${level2Index}`]: !prev[`${level1Index}-${level2Index}`],
                        }))
                      }
                    >
                      <span>{subModule.title}</span>
                      <span className={`arrow ${openState[`${level1Index}-${level2Index}`] ? "open" : ""}`}>
                        ▸
                      </span>
                    </div>
                    {openState[`${level1Index}-${level2Index}`] && (
                      <div className="submenu">
                        {subModule.subItems.map((subItem, i) => (
                          <button key={i} className="submenu-item" onClick={() => handleSubItemClick(subItem)}>
                            {subItem.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              {/* Si tiene sub-items directos (caso normal) */}
              {item.subItems &&
                item.subItems.map((sub, i) => (
                  <button
                    key={i}
                    className="submenu-item"
                    onClick={() => handleSubItemClick(sub)}
                  >
                    {sub.name}
                  </button>
                ))}
            </div>
          )}
        </div>
      ))}

      <div className="menu-footer">
        <span>{user.apellido + " " + user.nombre}</span>
        <small>{user.rol}</small>
        <button className="btn-logout">Cerrar sesión</button>
      </div>
    </div>
  );
};

export default MenuDrawer;
