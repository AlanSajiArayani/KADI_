import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { Search, MapPin, Star } from 'lucide-react';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const bakeryIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background:var(--primary); width:24px; height:24px; border-radius:50%; border:2px solid white; box-shadow:var(--glow);"></div>`,
  iconSize: [24, 24]
});

const userIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background:#3b82f6; width:24px; height:24px; border-radius:50%; border:2px solid white;"></div>`,
  iconSize: [24, 24]
});

function Recenter({lat, lng}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 1.5 });
  }, [lat, lng, map]);
  return null;
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [bakeries, setBakeries] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [location, setLocation] = useState(null);
  const [filters, setFilters] = useState({ name: '', category: '', rating: '' });
  const [selectedBakery, setSelectedBakery] = useState('');

  // Fetch location & data
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }, err => {
      setLocation({ lat: 37.77, lng: -122.41 }); // fallback
    });
  }, []);

  useEffect(() => {
    if (!location || !token) return;

    const fetchData = async () => {
      try {
        const [bakeryRes, snackRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/bakeries?lat=${location.lat}&lng=${location.lng}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/snacks', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setBakeries(bakeryRes.data);
        setSnacks(snackRes.data);
      } catch (err) {
        console.error("Using mock data as backend fetch failed/is missing.");
        // Mock fallback if api isn't ready
        setBakeries([
            { _id: 'b1', name: "Liquid Glass Patisserie", location: { lat: location.lat + 0.005, lng: location.lng + 0.004 }, rating: 4.8 },
            { _id: 'b2', name: "Neumorphic Bakes", location: { lat: location.lat - 0.008, lng: location.lng - 0.003 }, rating: 4.5 }
        ]);
      }
    };
    fetchData();
  }, [location, token]);

  // Apply frontend filtering on fallback data if API filtering isn't working/ready
  const filteredSnacks = snacks.filter(s => {
    if (filters.name && !s.title.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.category && s.category.toLowerCase() !== filters.category.toLowerCase()) return false;
    if (selectedBakery && s.bakeryId !== selectedBakery) return false;
    return true;
  });

  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <motion.div initial={{ opacity:0, x:-20}} animate={{opacity:1, x:0}}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 300 }}>
            {getGreeting()}, <span style={{ fontWeight: 700, color: 'var(--primary)', textShadow: 'var(--glow)' }}>{user?.firstName || 'Guest'}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Discover liquid glass treats near you.</p>
        </motion.div>
      </div>

      <div className="dashboard-content">
        {/* Main List Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
          {/* Filters */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
             <div className="filters-bar">
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    className="input-glass" 
                    placeholder="Search snacks..." 
                    style={{ paddingLeft: '2.5rem' }}
                    value={filters.name}
                    onChange={e => setFilters({...filters, name: e.target.value})}
                  />
                </div>
                <select className="input-glass" style={{ width: 'auto' }} value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
                  <option value="" style={{color: 'black'}}>All Categories</option>
                  <option value="Sweet" style={{color: 'black'}}>Sweet</option>
                  <option value="Savory" style={{color: 'black'}}>Savory</option>
                </select>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button className={`btn-glass ${!selectedBakery ? 'active' : ''}`} style={{ borderColor: !selectedBakery ? 'var(--primary)' : '' }} onClick={() => setSelectedBakery('')}>All Bakeries</button>
                   {bakeries.map(b => (
                     <button key={b._id} className="btn-glass" style={{ borderColor: selectedBakery === b._id ? 'var(--primary)' : '' }} onClick={() => setSelectedBakery(b._id)}>{b.name}</button>
                   ))}
                </div>
             </div>
          </div>

          {/* Snacks Grid */}
          <div className="snack-grid">
            {filteredSnacks.length > 0 ? filteredSnacks.map((snack, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={snack._id || idx} 
                className="snack-card glass-panel"
              >
                <img src={snack.image} alt={snack.title} className="snack-card-img" />
                <div className="snack-card-body">
                  <div className="snack-meta" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>{snack.category}</span>
                    <span className="snack-rating"><Star size={14} fill="#fbbf24"/> {snack.rating}</span>
                  </div>
                  <h3 className="snack-title">{snack.title}</h3>
                  <p className="snack-desc">{snack.description}</p>
                  <div className="snack-meta" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                     <span className="snack-price">${snack.price?.toFixed(2)}</span>
                     <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>View</button>
                  </div>
                </div>
              </motion.div>
            )) : <p>No treats found matching your filters.</p>}
          </div>
        </div>

        {/* Map Area */}
        <div className="map-container-glass glass-panel">
          {location ? (
             <MapContainer center={[location.lat, location.lng]} zoom={14} zoomControl={false} style={{ width: '100%', height: '100%' }}>
                {/* Switch to a lighter carto map if light mode is selected, default to dark_all */}
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; CARTO'
                />
                <Recenter lat={location.lat} lng={location.lng} />
                <Marker position={[location.lat, location.lng]} icon={userIcon}>
                  <Popup>You are here</Popup>
                </Marker>
                {bakeries.map(bakery => (
                  <Marker 
                    key={bakery._id} 
                    position={[bakery.location.lat, bakery.location.lng]}
                    icon={bakeryIcon}
                    eventHandlers={{ click: () => setSelectedBakery(bakery._id) }}
                  >
                    <Popup>
                      <strong style={{ color: 'black' }}>{bakery.name}</strong><br/>
                      <span style={{ color: 'gray' }}>⭐ {bakery.rating}</span>
                    </Popup>
                  </Marker>
                ))}
             </MapContainer>
          ) : <div style={{display:'flex', height:'100%', alignItems:'center', justifyContent:'center'}}>Loading Map...</div>}
        </div>
      </div>
    </div>
  );
}
