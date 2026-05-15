import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initSentry } from "./lib/sentry";

// Inicializa o Sentry antes de renderizar o app
initSentry();

createRoot(document.getElementById("root")!).render(<App />);
