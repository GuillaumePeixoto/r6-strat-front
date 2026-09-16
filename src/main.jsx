import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "./i18n";
import { AuthWrapper } from "./context/auth.context.jsx";
import { ToastWrapper } from "./context/toast.context.jsx";

createRoot(document.getElementById("root")).render(
  <AuthWrapper>
    <ToastWrapper>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ToastWrapper>
  </AuthWrapper>,
);
