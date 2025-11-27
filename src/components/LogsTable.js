import React from 'react';
import '../styles/app.css';

export default function LogsTable({ logs }) {
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatStatus = (status) => {
    if (status === null || status === undefined) return 'RFID NOT FOUND';
    const s = Number(status);
    if (s === 1) return '1';
    if (s === 0) return '0';
    return 'RFID NOT FOUND';
  };

  const sortedLogs = [...logs].sort((a, b) => new Date(b.time_log) - new Date(a.time_log));

  return (
    <table className="logs-table">
      <thead>
        <tr>
          <th></th>
          <th>RFID ID</th>
          <th>Status</th>
          <th>Time & Date</th>
        </tr>
      </thead>
      <tbody>
        {sortedLogs.length > 0 ? (
          sortedLogs.map((log, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{log.rfid_id || 'RFID NOT FOUND'}</td>
              <td>{formatStatus(log.rfid_status)}</td>
              <td>{formatTime(log.time_log)}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4">No logs yet</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
