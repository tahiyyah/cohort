export default function HomePage() {
  return (
    <main className="page">
      <p
        style={{
          color: 'var(--tag)',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontSize: '0.8rem',
          margin: 0,
        }}
      >
        Cohort
      </p>
      <h1 style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', marginTop: '0.5rem' }}>
        Events by apprentices,
        <br />
        for apprentices.
      </h1>
      <p
        style={{
          color: 'var(--muted)',
          fontSize: '1.125rem',
          maxWidth: '34rem',
          marginTop: '1.25rem',
        }}
      >
        Padel on Thursday, a study session before the exam, drinks when the
        Krakow cohort is in town. If you are organising it, put it here so
        everyone can find it.
      </p>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '3rem' }}>
        Event feed coming next. Auth API is live at{' '}
        <code>/api/auth/session</code>.
      </p>
    </main>
  )
}
