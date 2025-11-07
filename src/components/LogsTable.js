import React from 'react';
function statusText(status){
  if(status === null || status === undefined) return 'FRID NOT FOUND';
  return status === 1 ? '1' : '0';
}
export default function LogsTable({ logs }){
  return (
    <div className="logs-box">
      <table className="logs-table">
        <thead>
          <tr>
            <th>RFID</th>
            <th>Status</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.length===0 ? (
            <tr><td colSpan="3" style={{textAlign:'center'}}>No logs yet</td></tr>
          ) : logs.map((l,i)=>(
            <tr key={i}>
              <td>{l.id}</td>
              <td>{statusText(l.status)}</td>
              <td>{l.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
