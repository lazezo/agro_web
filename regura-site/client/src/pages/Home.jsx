import React, { useEffect, useState } from 'react'
import { getGuiUrl, getApiUrl } from '../api'

export default function Home({ user }) {
  const [links, setLinks] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([getGuiUrl(), getApiUrl()])
      .then(([g, a]) => setLinks({ gui:g.url, api:a.url }))
      .catch(() => setError('Unable to load member links'))
  }, [user])

  return (
    <div>
      <h1>Remote Sensing for Smarter Irrigation</h1>
      <p>We provide actionable insights on crop water needs using satellite data and field intelligence.</p>
      {user ? (
        <div style={{marginTop:16, padding:12, border:'1px solid #ddd'}}>
          <h3>Member Links</h3>
          {links ? (
            <ul>
              <li><a href={links.gui} target="_blank">Open GUI</a></li>
              <li><a href={links.api} target="_blank">API Docs</a></li>
            </ul>
          ) : <div>Loading…</div>}
        </div>
      ) : (
        <div style={{marginTop:16, padding:12, border:'1px dashed #bbb'}}>Log in to access the GUI & API.</div>
      )}
    </div>
  )
}