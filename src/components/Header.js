import React from 'react';

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">SH</div>
        <div className="logo-text">
          <h1>Shift Happens</h1>
          <span>RFID Monitor</span>
        </div>
      </div>
      <div className="header-right">
        <span className="version">v1.0</span>
      </div>
    </header>
  );
}