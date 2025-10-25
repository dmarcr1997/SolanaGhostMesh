import React, { useEffect } from "react";

export const Modal: React.FC<{
  open: boolean;
  imgUrl?: string;
  hash?: string;
  onClose(): void;
}> = ({ open, imgUrl, hash, onClose }) => {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className={`modal ${open ? "open" : ""}`} onClick={onClose}>
      <div className="modal__inner" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>
          Close [ESC]
        </button>
        {imgUrl && <img src={imgUrl} alt="IPFS" />}
        <div className="info">
          <div className="hash">IPFS Hash: {hash}</div>
        </div>
      </div>
    </div>
  );
};
