import React from 'react';
export default function LeftList({ list, onToggle }){
  return (
    <div className="left-list">
      <ol>
        {list.map((item, idx)=> (
          <li key={item.id} className="left-item">
            <span className="left-index">{idx+1}.</span>
            <span className="left-id">{item.id}</span>
            <label className="mini-switch">
              <input type="checkbox" checked={item.status===1} onChange={()=>onToggle(item.id)} />
              <span className="mini-slider"></span>
            </label>
          </li>
        ))}
      </ol>
    </div>
  );
}
