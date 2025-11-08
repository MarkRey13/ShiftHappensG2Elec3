import React from 'react';

function StatusBadge({ status }) {
  if (status === 1) return <span className="status-badge one">1</span>;
  if (status === 0) return <span className="status-badge zero">0</span>;
  if (status === null) return <span className="status-badge not-found">RFID NOT FOUND</span>;
  return <span className="status-badge unknown">-</span>;
}

export default function LeftList({ list, onToggle, disabled }) {
  if (!list?.length) return <div className="empty-state">No devices found</div>;

  return (
    <div className="devices-grid">
      {list.map((device, index) => {
        const isDisabled = disabled[device.id];
        return (
          <div key={device.id} className="device-card">
            <div className="device-number">{index + 1}</div>
            <div className="device-info">
              <div className="device-id">{device.id}</div>
              {device.lastSeen && (
                <div className="device-seen">Last seen: {device.lastSeen}</div>
              )}
            </div>
            
            <div className="device-controls">
              <StatusBadge status={device.status} />
              <button
                className={`toggle-button ${device.status === 1 ? 'active' : ''}`}
                onClick={() => !isDisabled && onToggle(device.id, device.status === 1 ? 0 : 1)}
                disabled={isDisabled}
              >
                Toggle
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
