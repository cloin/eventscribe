import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [payloads, setPayloads] = useState([]);
  const [selectedPayload, setSelectedPayload] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [addEventKey, setAddEventKey] = useState(true);

  // grab payloads from the server
  useEffect(() => {
    const fetchPayloads = () => {
      fetch('http://localhost:3331/payloads')
        .then((res) => res.json())
        .then((data) => setPayloads(data))
        .catch((err) => console.error(err));
    };

    fetchPayloads();  // fetch once initially
    const intervalId = setInterval(fetchPayloads, 5000);  // fetch every 5 seconds

    return () => clearInterval(intervalId);  // cleanup interval on component unmount
  }, []);

  // display JSON payload and its dot-notation path with search highlighting
  const displayJSON = (obj, prevKey = '') => {
    return Object.keys(obj).map((key, index) => {
      const value = obj[key];
      const newKey = prevKey ? `${prevKey}.${key}` : key;

      const highlight = (text) => {
        if (searchTerm && text.toLowerCase().includes(searchTerm.toLowerCase())) {
          return <span className="highlight">{text}</span>;
        }
        return text;
      };

      if (typeof value === 'object') {
        return (
          <div key={index}>
            <span>{highlight(key)}: {'{'}</span>
            <div style={{ marginLeft: '20px' }}>{displayJSON(value, newKey)}</div>
            <span>{'}'}</span>
          </div>
        );
      }
      return (
        <div key={index} onClick={() => setSelectedPath(newKey)}>
          {highlight(key)}: {highlight(JSON.stringify(value))}
        </div>
      );
    });
  };

  const handleCopyClick = () => {
    const finalPath = addEventKey ? `event.${selectedPath}` : selectedPath;
    navigator.clipboard.writeText(finalPath);
  };

  const displayedPath = addEventKey && selectedPath ? `event.${selectedPath}` : selectedPath;

  return (
    <div className="App">
      <div className="left-pane">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search payloads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => setSearchTerm('')}>Clear</button>
        </div>
        {payloads
          .filter((payloadWrapper) => JSON.stringify(payloadWrapper.payload).toLowerCase().includes(searchTerm.toLowerCase()))
          .map((payloadWrapper, index) => (
            <div
              key={index}
              className="payload-item"
              onClick={() => setSelectedPayload(payloadWrapper.payload)}
            >
              {index + 1}. {payloadWrapper.timestamp}
            </div>
          ))}
      </div>
      <div className="right-pane">
        <div className="clipboard-section">
          <input 
            type="text" 
            readOnly 
            value={displayedPath || 'Select JSON key/value...'} 
          />
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={addEventKey} 
              onChange={() => setAddEventKey(!addEventKey)} 
            />
            Prepend event
          </label>
          <button onClick={handleCopyClick}>📋 Copy</button>
        </div>
        {selectedPayload && displayJSON(selectedPayload)}
      </div>
    </div>
  );
}

export default App;
