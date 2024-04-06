// ListComponent.js

import React from 'react';

const ListComponent = ({ points, handlePointClick, deletePoint }) => {
  return (
    <div className="points-container">
      <h2 className="points-heading">Konumlar</h2>
      {points.map(point => (
        <div key={point.id} className="point-card" onClick={() => handlePointClick(point)}>
          <div>ID: {point.id}</div>
          <div>Lat: {point.lat}</div>
          <div>Lng: {point.lng}</div>
          <div>Date: {point.datetime}</div>
          <button onClick={() => deletePoint(point.id)}>Sil</button>
        </div>
      ))}
    </div>
  );
};

export default ListComponent;
