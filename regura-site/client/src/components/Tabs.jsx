import React from 'react'

export default function Tabs({ children }) {
  return <div style={{padding:16}}>{children}</div>
}
client/src/components/SignUp.jsx

import React, { useState } from 'react'
import { signup } from '../api'

export default function SignUp({ onSuccess }) {
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [error, setError] = useState('')

  async function onSubmit(e){
    e.preventDefault()
    setError('')
    const res = await signup(form)
    if(res.error) setError(res.error)
    else onSuccess(res.user)
  }

  return (
    <form onSubmit={onSubmit} style={{display:'grid',gap:8,maxWidth:360}}>
      <h2>Create account</h2>
      <input placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
      <input placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
      <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
      {error && <div style={{color:'crimson'}}>{error}</div>}
      <button type="submit">Sign up</button>
    </form>
  )
}