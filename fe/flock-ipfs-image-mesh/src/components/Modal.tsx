import React from "react";

export const Modal: React.FC<{
  open: boolean;
  imgUrl?: string;
  hash?: string;
  onClose(): void;
}> = ({ open, imgUrl, hash, onClose }) => {
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
