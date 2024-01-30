// Home.js

import React, { useState } from 'react';
import Console from './Console.js';

function Home() {

    const [consoleReady, setConsoleReady] = useState(false);
    const [assetToSearch, setAssetToSearch] = useState('Asset address');

    const renderConsole = async () => {
        setConsoleReady(true);
    };

    // @TODO: implement search asset
    const handleSearchAsset = (event) => {
        event.preventDefault();
        alert('An asset was searched: ' + assetToSearch);
    };

    const handleTextInput = (event) => {
        setAssetToSearch(event.target.value);
    };

    const clearText = (event) => {
        setAssetToSearch('');
    };

    return (
        <>
            { !consoleReady && (
                <>
                    <h1>Home</h1>
                    <p></p>

                    <form onSubmit={ handleSearchAsset} >
                        <label>
                          Name:
                          <input type="text" value={ assetToSearch } onChange={handleTextInput} onFocus={clearText} />
                        </label>
                        <input type="submit" value="Submit" />
                    </form>
                    <p></p>

                    <button onClick={ renderConsole }>Console</button>
                </>
            )}

            { consoleReady && <Console /> }
        </>
    );
}

export default Home;

