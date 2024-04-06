import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const App = () => {
  const [points, setPoints] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = () => {
    fetch('http://localhost:8080/points/get-all-points')
      .then(response => response.json())
      .then(data => setPoints(data))
      .catch(error => console.error('Error fetching points:', error));
  };

  const savePoint = () => {
    if (!mapRef.current) return;

    const center = mapRef.current.getCenter();
    const datetime = new Date().toISOString();

    const newPoint = {
      lat: center.lat.toFixed(5),
      lng: center.lng.toFixed(5),
      datetime: datetime
    };

    fetch('http://localhost:8080/points/save-point', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPoint)
    })
    .then(response => response.json())
    .then(data => {
      setPoints([...points, data]);
    })
    .catch(error => console.error('Error saving point:', error));
  };

  const deletePoint = (id) => {
    fetch(`http://localhost:8080/points/delete/${id}`, {
      method: 'DELETE'
    })
    .then(() => {
      setPoints(points.filter(point => point.id !== id));
    })
    .catch(error => console.error('Error deleting point:', error));
  };

  return (
    <div>
      <div style={{ height: '400px', width: '50%', float: 'left' }}>
        <MapContainer center={[37.05612, 29.10999]} zoom={13} style={{ height: '100%', width: '100%' }} ref={mapRef}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {points.map(point => (
            <Marker key={point.id} position={[point.lat, point.lng]}>
              <Popup>
                ID: {point.id}, Lat: {point.lat}, Lng: {point.lng}, Date: {point.datetime}
                <br />
                <button onClick={() => deletePoint(point.id)}>Sil</button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div style={{ height: '400px', width: '50%', float: 'right', overflowY: 'auto' }}>
        {points.map(point => (
          <div key={point.id}>
            ID: {point.id}, Lat: {point.lat}, Lng: {point.lng}, Date: {point.datetime}
            <button onClick={() => deletePoint(point.id)}>Sil</button>
          </div>
        ))}
      </div>
      <button onClick={savePoint}>Noktayı Kaydet</button>
    </div>
  );
};

export default App;
