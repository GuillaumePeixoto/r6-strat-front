// success = green
// error = red
// warning = yellow

function Toast({ message, type = "error", onClose }) {
  return (
    <div className={`toast toast-${type}`} role="alert">
      <span>{message}</span>
      <button onClick={onClose} aria-label="Fermer" className="cursor-pointer">
        ×
      </button>
    </div>
  );
}

export default Toast;