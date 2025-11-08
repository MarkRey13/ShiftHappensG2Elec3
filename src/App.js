import { useEffect, useState, useCallback, useRef } from 'react';
import LeftList from './components/LeftList';
import LogsTable from './components/LogsTable';
import Header from './components/Header';
import { initMQTT, sendToggleMessage } from './mqtt/mqttClient';
import './styles/app.css';

export default function App() {
  const [rfidList, setRfidList] = useState(() => {
    const saved = localStorage.getItem('rfidList');
    return saved ? JSON.parse(saved) : [
      { id: '88697684', status: 1, lastSeen: null },
      { id: '09780647', status: 1, lastSeen: null },
      { id: '75834600', status: 0, lastSeen: null },
      { id: '90875490', status: null, lastSeen: null }
    ];
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [simulating, setSimulating] = useState(false);
  const [cooldowns, setCooldowns] = useState({});
  
  const rfidRef = useRef(rfidList);
  useEffect(() => {
    rfidRef.current = rfidList;
    localStorage.setItem('rfidList', JSON.stringify(rfidList));
  }, [rfidList]);

  useEffect(() => {
    localStorage.setItem('logs', JSON.stringify(logs));
  }, [logs]);

  const formatDate = useCallback(() => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  const updateStatusFromMQTT = useCallback((id, status) => {
    const now = formatDate();
    setRfidList(prev => {
      const found = prev.find(p => p.id === id);
      if (found) {
        return prev.map(p => p.id === id ? { ...p, status, lastSeen: now } : p);
      }
      return [...prev, { id, status, lastSeen: now }];
    });
    setLogs(prev => [{ id, status, time: now }, ...prev]);
  }, [formatDate]);

  const toggleLocal = useCallback((id, status) => {
    if (cooldowns[id]) return;
    
    if (status === null) return; // Prevent toggling if status is null
    const newStatus = status === 1 ? 1 : 0;
    const now = formatDate();

    setRfidList(prev => 
      prev.map(p => p.id === id ? { ...p, status: newStatus, lastSeen: now } : p)
    );
    
    setLogs(prev => [{ id, status: newStatus, time: now }, ...prev]);
    sendToggleMessage(id, newStatus);

    setCooldowns(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCooldowns(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 800);
  }, [cooldowns, formatDate]);

  useEffect(() => {
    const { client } = initMQTT((msgStr) => {
      try {
        const payload = JSON.parse(msgStr);
        if (!payload?.id) return;
        const status = payload.status === 1 ? 1 : payload.status === 0 ? 0 : null;
        updateStatusFromMQTT(payload.id, status);
      } catch (e) {
        console.warn('Invalid MQTT message', e);
      }
    });
    return () => client && typeof client.end === 'function' && client.end();
  }, [updateStatusFromMQTT]);

  useEffect(() => {
    let interval;
    if (simulating) {
      interval = setInterval(() => {
        const list = rfidRef.current;
        if (list.length === 0) return;
        const idx = Math.floor(Math.random() * list.length);
        const id = list[idx]?.id;
        if (!id) return;
        updateStatusFromMQTT(id, Math.random() > 0.5 ? 1 : 0);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [simulating, updateStatusFromMQTT]);

  return (
    <div className="app">
      <Header />
      <main className="content">
        <section className="panel devices-panel">
          <div className="panel-header">
            <h2>RFID Devices</h2>
            <button 
              className={`sim-button ${simulating ? 'active' : ''}`}
              onClick={() => setSimulating(s => !s)}
            >
              {simulating ? 'Stop Simulation' : 'Start Simulation'}
            </button>
          </div>
          <LeftList 
            list={rfidList} 
            onToggle={toggleLocal} 
            disabled={cooldowns} 
          />
        </section>

        <section className="panel logs-panel">
          <div className="panel-header">
            <h2>Activity Logs</h2>
            <button 
              className="clear-button"
              onClick={() => setLogs([])}
            >
              Clear Logs
            </button>
          </div>
          <LogsTable logs={logs} />
        </section>
      </main>
    </div>
  );
}
