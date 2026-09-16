import { createContext, useState } from "react";

const ToastContext = createContext();

function ToastWrapper({ children }) {
  const [toast, setToast] = useState([]);

  const showNotif = (message, type = "error") => {
    if (!message) {
      return;
    }

    const id = Date.now();
    setToast((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeNotif(id);
    }, 3000);
  };

  const removeNotif = (id) => {
    setToast((prev) => prev.filter((t) => t.id !== id));
  }

  const passedContext = {
    toast,
    setToast,
    showNotif,
    removeNotif
  };

  return (
    <ToastContext.Provider value={passedContext}>
      {children}
    </ToastContext.Provider>
  );
}

export { ToastContext, ToastWrapper };
