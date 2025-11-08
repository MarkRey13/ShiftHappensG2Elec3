import React, { useState, useMemo } from 'react';

export default function LogsTable({ logs }) {
  const [filter, setFilter] = useState('');

  const filteredLogs = useMemo(() => {
    const query = filter.toLowerCase().trim();
    if (!query) return logs;
    return logs.filter(log => 
      log.id.toLowerCase().includes(query) || 
      String(log.status).includes(query)
    );
  }, [logs, filter]);

  return (
    <div className="logs-container">
      <div className="logs-header">
        <input
          type="text"
          className="search-input"
          placeholder="Filter logs..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <span className="logs-count">{filteredLogs.length} entries</span>
      </div>

      <div className="logs-table-wrapper">
        {filteredLogs.length === 0 ? (
          <div className="empty-state">No logs found</div>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Device ID</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={index}>
                  <td className="log-number">{index + 1}</td>
                  <td>{log.id}</td>
                  <td>
                    <span className={`log-status ${log.status === 1 ? 's1' : log.status === 0 ? 's0' : 'not-found'}`}>
                      {log.status === 1 ? '1' : log.status === 0 ? '0' : 'RFID NOT FOUND'}
                    </span>
                  </td>
                  <td>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
