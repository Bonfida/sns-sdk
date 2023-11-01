import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div
      style={{
        backgroundColor: "grey",
        height: "100vh",
        width: "100vw",
      }}
    >
      <App />
    </div>
  </React.StrictMode>,
);
