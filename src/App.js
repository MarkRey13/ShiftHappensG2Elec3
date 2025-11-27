import { useEffect, useState, useCallback } from 'react';
import RegTable from './components/RegTable';
import LogsTable from './components/LogsTable';
import Header from './components/Header';
import { initMQTT, sendToggleMessage } from './mqtt/mqttClient';
import './styles/app.css';

export default function App() {
  const [rfidList, setRfidList] = useState([]);
  const [logs, setLogs] = useState([]);

  const fetchData = useCallback(() => {
    fetch('http://10.142.232.22/esp32/insert.php', { method: 'GET' })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setRfidList(data.reg || []); 
          setLogs(data.logs || []);    
        } else {
          console.error('Error fetching data:', data.message);
        }
      })
      .catch((err) => console.error('Error fetching data:', err));
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const updateStatusFromMQTT = useCallback(
    (msgStr) => {
      try {
        const payload = JSON.parse(msgStr);
        if (!payload?.id) return;
        const { id, status } = payload;

        setRfidList((prev) => {
          const found = prev.find((p) => p.rfid_id === id);
          if (found) return prev.map((p) => (p.rfid_id === id ? { ...p, rfid_status: status } : p));
          return [...prev, { rfid_id: id, rfid_status: status }];
        });

        setLogs((prev) => [{ rfid_id: id, rfid_status: status, time_log: new Date().toISOString() }, ...prev]);
      } catch (e) {
        console.warn('Invalid MQTT message', e);
      }
    },
    []
  );

  useEffect(() => {
    const { client } = initMQTT(updateStatusFromMQTT);
    return () => client && typeof client.end === 'function' && client.end();
  }, [updateStatusFromMQTT]);

  const handleToggle = useCallback((id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;

    setRfidList((prev) => prev.map((p) => (p.rfid_id === id ? { ...p, rfid_status: newStatus } : p)));
    setLogs((prev) => [{ rfid_id: id, rfid_status: newStatus, time_log: new Date().toISOString() }, ...prev]);

    fetch('http://10.142.232.22/esp32/insert.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfid_data: id, rfid_status: newStatus }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status !== 'success') console.error('Error updating status:', data.message);
      })
      .catch((err) => console.error('Error updating status:', err));

    sendToggleMessage(id, newStatus);
  }, []);

  return (
    <div className="app">
      <Header />
      <main className="content">
        <section className="panel devices-panel">
          <h2>Registered Users</h2>
          <RegTable list={rfidList} onToggle={handleToggle} />
        </section>

        <section className="panel logs-panel">
          <h2>Activity Logs</h2>
          <LogsTable logs={logs} />
        </section>
      </main>
    </div>
  );
}
