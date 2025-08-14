import React, { useState } from 'react'
import { login } from '../api'

export default function Login({ onSuccess, onGoReset }) {
  const [form, setForm] = useState({ email:'', password:'' })
  const [error, setError] = useState('')

  async function onSubmit(e){
    e.preventDefault()
    setError('')
    const res = await login(form)
    if(res.error) setError(res.error)
    else onSuccess(res.user)
  }

  return (
    <form onSubmit={onSubmit} style={{display:'grid',gap:8,maxWidth:360}}>
      <h2>Welcome back</h2>
      <input placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
      <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
      {error && <div style={{color:'crimson'}}>{error}</div>}
      <button type="submit">Log in</button>
      <button type="button" onClick={onGoReset} style={{justifySelf:'start'}}>Forgot password?</button>
    </form>
  )
}