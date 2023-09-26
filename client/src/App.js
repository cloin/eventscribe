import React, { useState, useEffect } from 'react';
import './App.css';

const PayloadDisplay = ({ obj, onKeyClick }) => {
  const displayJSON = (obj, prevKey = '') => 
    Object.keys(obj).map((key, index) => {
      const value = obj[key];
      const newKey = prevKey ? `${prevKey}.${key}` : key;

      if (typeof value === 'object') {
        return (
          <div key={index}>
            <span>{key}: {'{'}</span>
            <div style={{ marginLeft: '20px' }}>{displayJSON(value, newKey)}</div>
            <span>{'}'}</span>
          </div>
        );
      }
      return (
        <div 
          key={index} 
          onClick={() => onKeyClick(newKey, value)}
        >
          {key}: {JSON.stringify(value)}
        </div>
      );
    });

  return <>{displayJSON(obj)}</>;
}

const RuleCreator = ({ path, ruleName, condition, ruleValue, onGenerate, onChange }) => {
  return (
    <div className="rule-creator">
      <input type="text" placeholder="Rule Name" value={ruleName} onChange={(e) => onChange('ruleName', e.target.value)} />
      <input type="text" placeholder="Path" value={path} onChange={(e) => onChange('path', e.target.value)} />
      <select value={condition} onChange={(e) => onChange('condition', e.target.value)}>
        <option value="==">==</option>
        <option value="!=">!=</option>
      </select>
      <input type="text" placeholder="Value" value={ruleValue} onChange={(e) => onChange('ruleValue', e.target.value)} />
      <button onClick={onGenerate}>Generate Rule</button>
    </div>
  );
}

function App() {
  const [payloads, setPayloads] = useState([]);
  const [selectedPayload, setSelectedPayload] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [addEventKey, setAddEventKey] = useState(true);
  const [ruleName, setRuleName] = useState("");
  const [condition, setCondition] = useState("==");
  const [ruleValue, setRuleValue] = useState("");
  const [generatedRule, setGeneratedRule] = useState("");
  const [isLeftPaneVisible, setIsLeftPaneVisible] = useState(true);
  const [path, setPath] = useState('');

  useEffect(() => {
    const fetchPayloads = () => {
      fetch('http://localhost:3331/payloads')
        .then((res) => res.json())
        .then((data) => setPayloads(data))
        .catch((err) => console.error(err));
    };

    fetchPayloads();
    const intervalId = setInterval(fetchPayloads, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleKeyClick = (newKey, value) => {
    setSelectedPath(newKey);
    setPath(newKey);
    setRuleValue(JSON.stringify(value));
  }

  const handleChange = (field, value) => {
    switch (field) {
      case 'path':
        setPath(value);
        break;
      case 'ruleName':
        setRuleName(value);
        break;
      case 'condition':
        setCondition(value);
        break;
      case 'ruleValue':
        setRuleValue(value);
        break;
      default:
        break;
    }
  };

  const generateRule = () => {
    const ruleTemplate = `
- name: ${ruleName}
  condition: event.${path} ${condition} ${ruleValue}
  action:
    debug:
    `;
    setGeneratedRule(ruleTemplate);
  };

  const handleCopyRule = () => {
    navigator.clipboard.writeText(generatedRule);
  }

  return (
    <div className="App">
      {isLeftPaneVisible && (
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
      )}
      <div className="toggle-pane-button" onClick={() => setIsLeftPaneVisible(!isLeftPaneVisible)}>
        {isLeftPaneVisible ? 'Hide' : 'Show'}
      </div>
      <div className="middle-pane">
        {/* <div className="clipboard-section">
          <input 
            type="text" 
            readOnly 
            value={selectedPath ? `event.${selectedPath}` : 'Select JSON key/value...'} 
          />
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={addEventKey} 
              onChange={() => setAddEventKey(!addEventKey)} 
            />
            Prepend event
          </label>
          <button onClick={() => navigator.clipboard.writeText(`event.${selectedPath}`)}>📋 Copy</button>
        </div> */}
        {selectedPayload && <PayloadDisplay obj={selectedPayload} onKeyClick={handleKeyClick} />}
      </div>
      <div className="right-pane">
        <RuleCreator 
          path={path}
          ruleName={ruleName}
          condition={condition}
          ruleValue={ruleValue}
          onGenerate={generateRule}
          onChange={handleChange}
        />
        <textarea readOnly value={generatedRule} />
        <button onClick={handleCopyRule}>Copy Rule</button>
      </div>
    </div>
  );
}

export default App;
