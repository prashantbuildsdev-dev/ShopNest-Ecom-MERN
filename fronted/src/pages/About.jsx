import React from 'react';

const About = () => (
  <section style={{ maxWidth: '900px', margin: '0 auto', padding: '40px', background: '#18181b', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', textAlign: 'center' }}>
    <img src="/prashantkumar-profile.jpeg" alt="Prashant Kumar" style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f97316', margin: '20px', boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)' }} />
    <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#fff' }}>About Me</h2>
    <h3 style={{ fontSize: '1.5rem', color: '#f97316', marginBottom: '15px' }}>Prashant Kumar (@prashantkumar)</h3>
    <p style={{ color: '#a1a1aa', fontSize: '1.2rem', lineHeight: '1.8', maxWidth: '600px', margin: '0 auto 30px' }}><strong>Join the community and grow together.</strong> Welcome to my platform, where we build, deploy, and scale thoughtfully engineered systems.</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
      <a href="https://prashantkumar.com" target="_blank" rel="noreferrer" style={linkStyle}>Website</a>
      <a href="https://youtube.com/@prashantkumar" target="_blank" rel="noreferrer" style={{ ...linkStyle, borderColor: '#ef4444', color: '#ef4444' }}>YouTube</a>
      <a href="https://instagram.com/prashant.nova" target="_blank" rel="noreferrer" style={{ ...linkStyle, borderColor: '#ec4899', color: '#ec4899' }}>Instagram</a>
      <a href="https://whatsapp.com/channel/0029vbMGE5IVfcjjKTAS0B" target="_blank" rel="noreferrer" style={{ ...linkStyle, borderColor: '#10b981', color: '#10b981' }}>WhatsApp</a>
      <a href="https://linktr.ee/prashantkumar" target="_blank" rel="noreferrer" style={linkStyle}>Linktree</a>
    </div>
  </section>
);

const linkStyle = { display: 'inline-block', padding: '10px 20px', background: '#27272a', color: '#fff', borderRadius: '8px', textDecoration: 'none', border: '1px solid rgba(255, 255, 255, 0.1)' };

export default About;
