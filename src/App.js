import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from './assets/marker-icon.png';
import L from 'leaflet';
import './styles/styles.css';
import ListComponent from './components/ListComponent';

const App = () => {
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = () => {
    fetch(`${process.env.REACT_APP_BASE_URL}/points/get-all-points`)
      .then(response => response.json())
      .then(data => {
        const sortedPoints = data.sort((a, b) => b.id - a.id);
        setPoints(sortedPoints);
      })
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

    fetch(`${process.env.REACT_APP_BASE_URL}/points/save-point`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPoint)
    })
    .then(response => response.json())
    .then(data => {
      setPoints([data, ...points]);
    })
    .catch(error => console.error('Error saving point:', error));
  };

  const deletePoint = (id) => {
    fetch(`${process.env.REACT_APP_BASE_URL}/points/delete/${id}`, {
      method: 'DELETE'
    })
    .then(() => {
      setPoints(points.filter(point => point.id !== id));
      setSelectedPoint(null); // Seçilen noktayı temizle
    })
    .then(() => mapRef.current.leafletElement.closePopup()) // Popup'ı kapat
    .then(() => mapRef.current.leafletElement.invalidateSize()) // Haritayı yenile
    .catch(error => console.error('Error deleting point:', error));
  };

  const downloadPointsAsJson = () => {
    const json = JSON.stringify(points, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'points.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePointClick = (point) => {
    setSelectedPoint(point);
    mapRef.current.panTo([point.lat, point.lng]);
  };

  const icon = L.icon({
    iconUrl: iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null
  });

  return (
    <div className="container">
      <div className="map-container">
        <MapContainer center={[37.05612, 29.10999]} zoom={13} className="map" ref={mapRef}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {points.map(point => (
            <Marker 
              icon={icon}
              key={point.id} 
              position={[point.lat, point.lng]} 
              eventHandlers={{ click: () => handlePointClick(point) }}
            >
              <Popup>
                ID: {point.id}, Lat: {point.lat}, Lng: {point.lng}, Date: {point.datetime}
                <br />
                <button onClick={() => deletePoint(point.id)}>Sil</button>
              </Popup>
            </Marker>
          ))}
          {selectedPoint && <Marker position={[selectedPoint.lat, selectedPoint.lng]} />}
        </MapContainer>
        <div className="map-buttons">
          <button onClick={savePoint}>Noktayı Kaydet</button>
          <button onClick={downloadPointsAsJson}>Konumları İndir</button>
        </div>
      </div>
      <div className="list-container">
        <ListComponent points={points} handlePointClick={handlePointClick} deletePoint={deletePoint} />
      </div>
    </div>
  );
};

export default App;
