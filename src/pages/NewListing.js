import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { TRADE_CONFIG } from '../lib/tradeConfig'

export default function NewListing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    offer_title: '',
    offer_description: '',
    seek_description: '',
    skills: '',
    category: TRADE_CONFIG.categories[0],
    availability: TRADE_CONFIG.availabilityOptions[0],
    location: '',
    user_type: 'individual',
    trade_type: 'both',
  })

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.offer_title || !form.offer_description) {
      setError('Please fill in the required fields.')
      return
    }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('listings').insert({
      ...form,
      user_id: user.id,
      active: true,
    })
    if (err) { setError(err.message); setLoading(false); return }
    navigate('/browse')
  }

  return (
    <div className="page-narrow">
      <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '1.5rem' }}>
        Post a {TRADE_CONFIG.listingName}
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          <div className="form-group">
            <label className="form-label">You are posting as</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['individual', 'business'].map(t => (
                <button
                  key={t} type="button"
                  className={`chip ${form.user_type === t ? 'active' : ''}`}
                  onClick={() => update('user_type', t)}
                >
                  {t === 'individual' ? '👤 Individual' : '🏢 Company'}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              placeholder="e.g. Senior UX Designer available for 3 months"
              value={form.offer_title}
              onChange={e => update('offer_title', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{TRADE_CONFIG.offerLabel} *</label>
            <textarea
              className="form-textarea"
              placeholder={TRADE_CONFIG.offerPlaceholder}
              value={form.offer_description}
              onChange={e => update('offer_description', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{TRADE_CONFIG.seekLabel}</label>
            <textarea
              className="form-textarea"
              placeholder={TRADE_CONFIG.seekPlaceholder}
              value={form.seek_description}
              onChange={e => update('seek_description', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Key skills / tags</label>
            <input
              className="form-input"
              placeholder="e.g. Figma, React, Project Management (comma separated)"
              value={form.skills}
              onChange={e => update('skills', e.target.value)}
            />
            <span className="form-hint">Separate each skill with a comma</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => update('category', e.target.value)}>
                {TRADE_CONFIG.categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Availability</label>
              <select className="form-select" value={form.availability} onChange={e => update('availability', e.target.value)}>
                {TRADE_CONFIG.availabilityOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                placeholder="City or Remote"
                value={form.location}
                onChange={e => update('location', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Trade type</label>
              <select className="form-select" value={form.trade_type} onChange={e => update('trade_type', e.target.value)}>
                {TRADE_CONFIG.tradeTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Publishing…' : 'Publish listing'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  )
}
