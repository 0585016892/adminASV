import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./assets/Container.css";
import { BrowserRouter } from "react-router-dom"; // Chỉ cần BrowserRouter ở đây
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux"; // Đảm bảo import đúng
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./contexts/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      {/* Chỉ bao bọc BrowserRouter ở đây */}
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>
);
