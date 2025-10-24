import React, { useEffect, useState } from "react";

export const Toast: React.FC<{
  message?: string;
  kind?: "success" | "warning" | "error";
}> = ({ message, kind = "error" }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!message) return;
    setOpen(true);
    const t = setTimeout(() => setOpen(false), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const color =
    kind === "success" ? "#64ff64" : kind === "warning" ? "#ffc864" : "#ff6464";
  const border =
    kind === "success"
      ? "rgba(100,255,100,.5)"
      : kind === "warning"
      ? "rgba(255,200,100,.5)"
      : "rgba(255,100,100,.5)";

  return (
    <div
      className={`toast ${open && message ? "open" : ""}`}
      style={{ color, borderColor: border }}
    >
      {message}
    </div>
  );
};
