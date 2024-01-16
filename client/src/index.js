import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MetaMaskProvider } from '@metamask/sdk-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>

        <MetaMaskProvider debug={false} sdkOptions={{
              dappMetadata: {
                  name: "Example React Dapp",
                  url: window.location.host,
              }
            }}>

            <App />

        </MetaMaskProvider>

  </React.StrictMode>
);

reportWebVitals();
