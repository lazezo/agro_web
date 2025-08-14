import React from 'react'

export default function Navbar({ user, onLogout }) {
  return (
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:'1px solid #eee'}}>
      <div style={{fontWeight:700}}>Regura</div>
      <nav style={{display:'flex',gap:12}}>
        <a href="#home">Home</a>
        <a href="#company">Company</a>
        <a href="#remote">Remote Sensing</a>
        <a href="#irrigation">Irrigation Mgmt</a>
        <a href="#water">Crop Water Needs</a>
        <a href="#contact">Contact</a>
      </nav>
      <div>
        {user ? (
          <>
            <span style={{marginRight:12}}>Hi, {user.name}</span>
            <button onClick={onLogout}>Log out</button>
          </>
        ) : (
          <>
            <a href="#login" style={{marginRight:12}}>Log in</a>
            <a href="#signup">Sign up</a>
          </>
        )}
      </div>
    </header>
  )
}