// App.js

import React, { useState } from 'react';
import logo from './logo.svg';
import Home from './components/Home.js';
import './App.css';

// export const App = () => {
export default function App() {

    const handleClick = async () => {
        const requestBody = JSON.stringify({
                  username: 'crayons'
              });

        fetch('http://localhost:8000/myapi', {
                method: 'POST',
                headers: {
                 'Accept': 'application/json',
                 'Content-Type': 'application/json',
                },
                body: requestBody
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error(error));
    };

    // <button onClick={handleClick}>Test Button</button>

    return (
        <div className="App">

            <Home />

        </div>
    );

// };
}

