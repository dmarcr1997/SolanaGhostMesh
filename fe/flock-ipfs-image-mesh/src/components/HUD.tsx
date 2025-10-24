import React from "react";

export const HUD: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="hud">
      <h2>👻 Ghost Mesh </h2>
      {children}
    </div>
  );
};
