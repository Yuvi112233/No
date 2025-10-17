import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { keepAliveService } from "./services/keepAlive";

// Start keep-alive service to prevent backend cold starts
keepAliveService.start();

createRoot(document.getElementById("root")!).render(<App />);
