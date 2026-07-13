import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.jsx";

import { CallRequestProvider } from "./callRequests/context/CallRequestContext";
import { NotificationProvider } from "./notification/context/NotificationContext";
import { MeetingProvider } from "./meetings/context/MeetingContext";
createRoot(document.getElementById("root")).render(

  <StrictMode>

    <NotificationProvider>
      <CallRequestProvider>
        <MeetingProvider>
          <App />
        </MeetingProvider>
      </CallRequestProvider>
    </NotificationProvider>

  </StrictMode>

);