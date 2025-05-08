import React from 'react';
import ReactDOM from 'react-dom';
import { CookiesProvider } from "react-cookie";
import App from './App';
import { AuthContextProvider } from "util"
import "./css/index.css"
import { MenuContextProvider } from 'util';

ReactDOM.render(
  <React.StrictMode>
    <CookiesProvider>
      <AuthContextProvider>
        <MenuContextProvider>
        <App /> 
        </MenuContextProvider>
      </AuthContextProvider>
    </CookiesProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
