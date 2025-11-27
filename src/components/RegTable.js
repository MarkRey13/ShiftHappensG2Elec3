import React from 'react';
import '../styles/app.css';

export default function RegTable({ list }) {
  return (
    <table className="reg-table">
      <thead>
        <tr>
          <th></th>
          <th>RFID ID</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {list.length > 0 ? (
          list.map((user, index) => (
            <tr key={user.rfid_id}>
              <td>{index + 1}</td>
              <td>{user.rfid_id}</td>
              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={Number(user.rfid_status) === 1}
                    readOnly
                  />
                  <span className="slider round"></span>
                </label>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3">No registered users</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
