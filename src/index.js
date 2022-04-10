import React from 'react';
import ReactDOM from 'react-dom';
import { CookiesProvider } from "react-cookie";
import App from './App';
import { AuthContextProvider } from "util"
import "./css/index.css"

ReactDOM.render(
  <React.StrictMode>
    <CookiesProvider>
      <AuthContextProvider>
        <App /> 
      </AuthContextProvider>
    </CookiesProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
