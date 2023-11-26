import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// CSS & JS
import "bootstrap/dist/css/bootstrap.min.css";
import "@adminkit/core/dist/css/app.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "react-toastify/dist/ReactToastify.css";
import "react-quill/dist/quill.snow.css";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <ToastContainer closeOnClick={false} autoClose={3000} />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
