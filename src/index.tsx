import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./slices";
import { AuthProvider } from 'pages/Authentication/useAuth';
import { LoadingProvider } from 'pages/Components/Loadingcontext';

const store = configureStore({ reducer: rootReducer, devTools: true });

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <React.Fragment>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <LoadingProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LoadingProvider>
      </BrowserRouter>
    </React.Fragment>
  </Provider>
);

reportWebVitals();