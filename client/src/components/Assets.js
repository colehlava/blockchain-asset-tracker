// Assets.js

import React, { useState, useEffect } from "react";

// <h1>Assets for {props.useraddress}</h1>

function Assets(props) {

  const [data, setData] = useState([]);

  useEffect(() => {
      const requestBody = JSON.stringify({ useraddress: props.useraddress });

      fetch('http://localhost:8000/assets', {
            method: 'POST',
            headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json',
            },
            body: requestBody
          })
          .then(response => response.json())
          .then(data => setData(data));

  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>My Data</h1>
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Assets;

