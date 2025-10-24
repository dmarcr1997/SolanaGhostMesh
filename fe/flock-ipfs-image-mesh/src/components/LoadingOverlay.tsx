import React from "react";

export const LoadingOverlay: React.FC<{ open: boolean }> = ({ open }) => {
  return (
    <div className={`loading ${open ? "open" : ""}`}>
      <div>
        <div className="spinner" />
        <div style={{ textAlign: "center" }}>Loading image...</div>
      </div>
    </div>
  );
};
