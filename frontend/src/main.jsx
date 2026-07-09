import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.jsx";

import { CallRequestProvider } from "./callRequests/context/CallRequestContext";
import { NotificationProvider } from "./notification/context/NotificationContext";

createRoot(document.getElementById("root")).render(

  <StrictMode>

    <NotificationProvider>

      <CallRequestProvider>

        <App />

      </CallRequestProvider>

    </NotificationProvider>

  </StrictMode>

);