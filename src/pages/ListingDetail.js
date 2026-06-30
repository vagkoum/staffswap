import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { ReviewForm, ReviewList } from '../components/Reviews'
import { ReportButton } from '../components/Report'

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshReviews, setRefreshReviews] = useState(0)

  useEffect(() => {
    supabase
      .from('listings')
      .select('*, profiles(full_name, company, bio, location)')
      .eq('id', id)
      .single()
      .then(({ data }) => { setListing(data); setLoading(false) })
  }, [id])

  async function handleContact() {
    if (!user) { navigate('/login'); return }
    const { data: existing } = await supabase
      .from('message_threads')
      .select('id')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${listing.user_id}),and(user1_id.eq.${listing.user_id},user2_id.eq.${user.id})`)
      .single()

    if (existing) {
      navigate(`/messages/${existing.id}`)
    } else {
      const { data: thread } = await supabase
        .from('message_threads')
        .insert({ user1_id: user.id, user2_id: listing.user_id, listing_id: listing.id })
        .select()
        .single()
      navigate(`/messages/${thread.id}`)
    }
  }

  if (loading) return <div className="page"><div className="spinner" /></div>
  if (!listing) return <div className="page"><p>Listing not found.</p></div>

  const name = listing.profiles?.full_name || 'Anonymous'
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const skills = listing.skills ? listing.skills.split(',').map(s => s.trim()).filter(Boolean) : []
  const isOwn = user?.id === listing.user_id

  return (
    <div className="page-narrow">
      <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Back</button>

      <div className="card" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="avatar avatar-lg">{initials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>{name}</div>
            {listing.profiles?.company && (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{listing.profiles.company}</div>
            )}
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <span className={`pill ${listing.user_type === 'business' ? 'pill-blue' : 'pill-purple'}`}>
                {listing.user_type === 'business' ? 'Company' : 'Individual'}
              </span>
              <span className="pill pill-gray">{listing.category}</span>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{listing.offer_title}</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>{listing.offer_description}</p>

        {listing.seek_description && (
          <div style={{ background: 'var(--green-light)', borderRadius: '8px', padding: '12px', marginBottom: '1rem' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '4px' }}>↔ Looking for in return</div>
            <div style={{ fontSize: '14px', color: 'var(--green-dark)' }}>{listing.seek_description}</div>
          </div>
        )}

        {skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1rem' }}>
            {skills.map(s => <span key={s} className="pill pill-gray">{s}</span>)}
          </div>
        )}

        <hr className="divider" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <div><strong>📍 Location</strong><br />{listing.location || '—'}</div>
          <div><strong>⏱ Available</strong><br />{listing.availability}</div>
          <div><strong>💶 Trade type</strong><br />{listing.trade_type === 'barter' ? 'Barter' : listing.trade_type === 'paid' ? 'Paid' : 'Open to both'}</div>
        </div>

        {!isOwn && (
  <>
    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleContact}>
      💬 Contact {name.split(' ')[0]}
    </button>
    <div style={{ textAlign: 'center', marginTop: '10px' }}>
      <ReportButton reportedUserId={listing.user_id} listingId={listing.id} />
    </div>
  </>
)}
        {isOwn && (
          <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', padding: '8px' }}>This is your listing.</div>
        )}

        {/* Reviews Section */}
        <hr className="divider" />
        <ReviewList reviewedId={listing.user_id} key={refreshReviews} />
        <ReviewForm
          reviewedId={listing.user_id}
          listingId={listing.id}
          onSubmitted={() => setRefreshReviews(r => r + 1)}
        />
      </div>
    </div>
  )
}
