import React from "react";
import "./GameOverModal.css";

interface GameOverModalProps {
  isOpen: boolean;
  isWinner: boolean;
  onClose: () => void;
  wordKey: string;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ 
  isOpen, 
  isWinner, 
  onClose, 
  wordKey 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isWinner ? "Você ganhou! 🎉" : "Você perdeu! 😢"}</h2>
        {!isWinner && <p>A palavra correta era: <strong>{wordKey}</strong></p>}
        <button 
          onClick={onClose}
          className="modal-button"
        >
          {isWinner ? "Continuar" : "Tentar novamente"}
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;