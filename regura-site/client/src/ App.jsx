import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Tabs from './components/Tabs'
import SignUp from './components/SignUp'
import Login from './components/Login'
import Home from './pages/Home'
import Company from './pages/Company'
import RemoteSensing from './pages/RemoteSensing'
import IrrigationMgmt from './pages/IrrigationMgmt'
import CropWaterNeeds from './pages/CropWaterNeeds'
import Contact from './pages/Contact'
import { me, logout, requestPasswordReset, resetPassword, adminUsers } from './api'

function useHash(){
  const [hash, setHash] = useState(window.location.hash || '#home')
  useEffect(()=>{
    const onHash = ()=> setHash(window.location.hash || '#home')
    window.addEventListener('hashchange', onHash)
    return ()=> window.removeEventListener('hashchange', onHash)
  },[])
  return [hash, (h)=>{window.location.hash=h}]
}

function ResetRequest(){
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  return (
    <form onSubmit={async e=>{e.preventDefault(); setMsg(''); const r = await requestPasswordReset(email); setMsg(r.message||'Check your email')}} style={{display:'grid',gap:8,maxWidth:360}}>
      <h2>Reset password</h2>
      <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
      <button>Send reset link</button>
      {msg && <div style={{color:'green'}}>{msg}</div>}
    </form>
  )
}

function ResetForm(){
  const [token, setToken] = useState(new URLSearchParams(window.location.search).get('token')||'')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  return (
    <form onSubmit={async e=>{e.preventDefault(); const r = await resetPassword(token,password); setMsg(r.message||r.error)}} style={{display:'grid',gap:8,maxWidth:360}}>
      <h2>Set new password</h2>
      <input placeholder="Token" value={token} onChange={e=>setToken(e.target.value)} required />
      <input placeholder="New password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
      <button>Update password</button>
      {msg && <div>{msg}</div>}
    </form>
  )
}

function Admin(){
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')
  useEffect(()=>{ adminUsers().then(r=>{ if(r.error) setErr(r.error); else setRows(r.users||[]) }) },[])
  return (
    <div>
      <h2>Admin – Users</h2>
      {err && <div style={{color:'crimson'}}>{err}</div>}
      <table border="1" cellPadding="6"><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Created</th></tr></thead>
        <tbody>
          {rows.map(u=> <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.email_verified?'yes':'no'}</td><td>{u.created_at}</td></tr>)}
        </tbody>
      </table>
    </div>
  )
}

export default function App(){
  const [user, setUser] = useState(null)
  const [hash, setHash] = useHash()

  useEffect(()=>{ me().then(r=>{ if(r.user) setUser(r.user) }) }, [])

  function render(){
    switch(hash){
      case '#company': return <Company/>
      case '#remote': return <RemoteSensing/>
      case '#irrigation': return <IrrigationMgmt/>
      case '#water': return <CropWaterNeeds/>
      case '#contact': return <Contact/>
      case '#signup': return <SignUp onSuccess={setUser}/>
      case '#login': return <Login onSuccess={setUser} onGoReset={()=>setHash('#forgot')}/>
      case '#forgot': return <ResetRequest/>
      case '#reset': return <ResetForm/>
      case '#admin': return <Admin/>
      default: return <Home user={user}/>
    }
  }

  return (
    <div>
      <Navbar user={user} onLogout={()=>logout().then(()=>setUser(null))}/>
      <Tabs>
        {render()}
      </Tabs>
      {user?.role === 'admin' && (
        <div style={{position:'fixed',bottom:12,right:12}}>
          <a href="#admin">Admin</a>
        </div>
      )}
    </div>
  )
}