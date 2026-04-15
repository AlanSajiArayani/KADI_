import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const [bakeries, setBakeries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBakeries = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/bakeries?lat=0&lng=0');
        setBakeries(res.data);
      } catch (err) {
        setBakeries([
            { 
              _id: 'b1', 
              name: "Liquid Glass Patisserie", 
              description: "Premium artisanal pastries with a modern touch, baked fresh every morning to bring you the finest flavors.",
              images: ["https://images.unsplash.com/photo-1555507036-ab1f40ce88ca?auto=format&fit=crop&q=80&w=800"],
              rating: 4.8, 
              phone: "+1 234 567 890" 
            },
            { 
              _id: 'b2', 
              name: "Neumorphic Bakes", 
              description: "The ultimate blending of traditional baking with cutting edge aesthetic flavors. Try our signature series.",
              images: ["https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&q=80&w=800"],
              rating: 4.5, 
              phone: "+1 987 654 321" 
            }
        ]);
      }
    };
    fetchBakeries();
  }, []);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', zIndex: -1 }}></div>
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 700, textShadow: 'var(--glow)' }}>Premium Bakery Showcase</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '1rem' }}>Discover the finest liquid glass inspired treats.</p>
      </motion.div>

      <div className="bakery-catalog-grid">
        {bakeries.map((bakery, idx) => (
          <motion.div 
            key={bakery._id}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
            className="bakery-showcase-card glass-panel"
          >
            <div className="bakery-info">
              <h2 className="bakery-name">{bakery.name}</h2>
              <div className="bakery-desc-box glass-panel">
                <p>{bakery.description || "A wonderful premium bakery offering exquisite treats."}</p>
              </div>
              <div className="bakery-actions">
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '30px', padding: '0.8rem 2rem', fontSize: '1.1rem' }} onClick={() => navigate(`/bakery/${bakery._id}`)}>
                  Order Now <ArrowRight size={20} />
                </button>
                <div className="icon-btn-glass" title={bakery.phone || "Contact"}>
                  <Phone size={22} style={{ color: 'var(--primary)' }} />
                </div>
              </div>
            </div>
            <div className="bakery-image-container">
              <img 
                src={(bakery.images && bakery.images.length > 0) ? bakery.images[0] : "https://images.unsplash.com/photo-1555507036-ab1f40ce88ca?auto=format&fit=crop&q=80&w=800"} 
                alt={bakery.name} 
                className="bakery-image" 
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
