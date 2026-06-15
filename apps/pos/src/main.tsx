import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { LockScreen } from "./app/LockScreen";
import { useSession } from "./app/store";
import "./index.css";

function App() {
  const user = useSession((s) => s.currentUser);
  return user ? <RouterProvider router={router} /> : <LockScreen />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
