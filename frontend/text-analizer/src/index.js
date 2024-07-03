import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {createContext } from "react";

export const Server = createContext()
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     <Server.Provider value='http://127.0.0.1:8000/'>
        <App />
      </Server.Provider>
  </React.StrictMode>
);

reportWebVitals();
