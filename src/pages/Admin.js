import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const ADMIN_ID = '60c0540e-5c06-4204-b0ec-f216905d0754'

export default function Admin() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState({ users: 0, listings: 0, messages: 0, threads: 0 })
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.id !== ADMIN_ID)) {
      navigate('/')
    }
  }, [user, loading])

  useEffect(() => {
    if (user?.id === ADMIN_ID) loadAll()
  }, [user])

  async function loadAll() {
    setLoadingData(true)

    const [
      { count: userCount },
      { count: listingCount },
      { count: messageCount },
      { count: threadCount },
      { data: usersData },
      { data: listingsData },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('message_threads').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('listings').select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
    ])

    setStats({
      users: userCount || 0,
      listings: listingCount || 0,
      messages: messageCount || 0,
      threads: threadCount || 0,
    })
    setUsers(usersData || [])
    setListings(listingsData || [])
    setLoadingData(false)
  }

  async function deleteListing(id) {
    if (!window.confirm('Delete this listing?')) return
    await supabase.from('listings').delete().eq('id', id)
    setListings(ls => ls.filter(l => l.id !== id))
  }

  async function deleteUser(id) {
    if (!window.confirm('Delete this user and all their data?')) return
    await supabase.from('profiles').delete().eq('id', id)
    setUsers(us => us.filter(u => u.id !== id))
  }

  async function toggleListing(id, active) {
    await supabase.from('listings').update({ active: !active }).eq('id', id)
    setListings(ls => ls.map(l => l.id === id ? { ...l, active: !active } : l))
  }

  if (loading || loadingData) return (
    <div className="loading-screen"><div className="spinner" /></div>
  )

  if (!user || user.id !== ADMIN_ID) return null

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Admin Panel</h1>
        <span className="pill pill-green">You only can see this</span>
      </div>

      {/* Tabs */}
      <div className="filter-row" style={{ marginBottom: '1.5rem' }}>
        {['stats', 'users', 'listings'].map(t => (
          <button key={t} className={`chip ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'stats' ? '📊 Statistics' : t === 'users' ? '👥 Users' : '📋 Listings'}
          </button>
        ))}
      </div>

      {/* STATS */}
      {tab === 'stats' && (
        <>
          <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            <div className="stat-card"><div className="stat-num">{stats.users}</div><div className="stat-lbl">Total users</div></div>
            <div className="stat-card"><div className="stat-num">{stats.listings}</div><div className="stat-lbl">Total listings</div></div>
            <div className="stat-card"><div className="stat-num">{stats.threads}</div><div className="stat-lbl">Conversations</div></div>
            <div className="stat-card"><div className="stat-num">{stats.messages}</div><div className="stat-lbl">Messages sent</div></div>
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Platform health</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Active listings</span>
                <span style={{ fontWeight: 500 }}>{listings.filter(l => l.active).length} / {listings.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Users with listings</span>
                <span style={{ fontWeight: 500 }}>{new Set(listings.map(l => l.user_id)).size}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Avg messages per conversation</span>
                <span style={{ fontWeight: 500 }}>{stats.threads > 0 ? (stats.messages / stats.threads).toFixed(1) : 0}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Name</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Email</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Company</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Location</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Joined</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '10px 14px' }}>{u.full_name || '—'}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{u.email || '—'}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{u.company || '—'}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{u.location || '—'}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {u.id !== ADMIN_ID && (
                      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>Delete</button>
                    )}
                    {u.id === ADMIN_ID && <span style={{ color: 'var(--text-faint)', fontSize: '11px' }}>You</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="empty-state"><h3>No users yet</h3></div>
          )}
        </div>
      )}

      {/* LISTINGS */}
      {tab === 'listings' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Title</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Posted by</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Category</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Type</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: i < listings.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.offer_title}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{l.profiles?.full_name || '—'}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{l.category}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className={`pill ${l.user_type === 'business' ? 'pill-blue' : 'pill-purple'}`}>
                      {l.user_type}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className={`pill ${l.active ? 'pill-green' : 'pill-gray'}`}>
                      {l.active ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px 14px', display: 'flex', gap: '6px' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => toggleListing(l.id, l.active)}>
                      {l.active ? 'Pause' : 'Activate'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteListing(l.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {listings.length === 0 && (
            <div className="empty-state"><h3>No listings yet</h3></div>
          )}
        </div>
      )}
    </div>
  )
}
