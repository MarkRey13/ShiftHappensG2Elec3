import React, { useEffect, useState } from 'react';
import LeftList from './components/LeftList';
import LogsTable from './components/LogsTable';
import { initMQTT, sendToggleMessage } from './mqtt/mqttClient';

export default function App(){
  const [rfidList, setRfidList] = useState([
    { id: '88697684', status: 1 },
    { id: '09780647', status: 1 },
    { id: '75834600', status: 0 },
    { id: '90875490', status: null }
  ]);
  const [logs, setLogs] = useState([]);
  const [simulating, setSimulating] = useState(false);

  useEffect(()=>{
    const { client } = initMQTT((msgStr)=>{
      try {
        const payload = JSON.parse(msgStr);
        updateStatusFromMQTT(payload.id, payload.status);
      } catch(e){
        console.warn('Invalid MQTT message', e);
      }
    });
    return ()=> client && client.end();
  }, []);

  const formatDate = () => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const updateStatusFromMQTT = (id, status) => {
    setRfidList(prev => {
      const found = prev.find(p=>p.id===id);
      if(found){
        return prev.map(p=> p.id===id ? { ...p, status } : p);
      } else {
        return [...prev, { id, status }];
      }
    });
    setLogs(prev => [{ id, status, time: formatDate() }, ...prev]);
  };

  const toggleLocal = (id) => {
    const current = rfidList.find(r=>r.id===id)?.status;
    const newStatus = current===1?0:1;
    setRfidList(prev => prev.map(p=> p.id===id ? { ...p, status: newStatus } : p));
    sendToggleMessage(id, newStatus);
    setLogs(prev => [{ id, status: newStatus, time: formatDate() }, ...prev]);
  };

  useEffect(()=>{
    let interval;
    if(simulating){
      interval = setInterval(()=>{
        const idx = Math.floor(Math.random()*rfidList.length);
        const id = rfidList[idx]?.id || null;
        if(!id) return;
        const newStatus = Math.random()>0.5?1:0;
        updateStatusFromMQTT(id, newStatus);
      }, 5000);
    }
    return ()=> clearInterval(interval);
  }, [simulating, rfidList]);

  return (
    <div className="layout">
      <div className="left-panel">
        <h3>RFID</h3>
        <LeftList list={rfidList} onToggle={toggleLocal} />
      </div>
      <div className="right-panel">
        <LogsTable logs={logs} />
      </div>
    </div>
  );
}
