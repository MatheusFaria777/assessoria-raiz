const PAGE_LABELS = {
  dashboard: 'Dashboard',
  clients:   'Clientes',
  reports:   'Relatórios',
  uploader:  'Uploader',
  sheets:    'Planilhas',
  feedback:  'Formulários',
  settings:  'Configurações',
}

export default function Header({ page, onToggleSidebar, user, onLogout }) {
  return (
    <header style={{
      height: 56,
      flexShrink: 0,
      background: '#1E3D34',
      borderBottom: '1px solid rgba(245,245,245,.08)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 1.25rem',
      gap: '1rem',
    }}>
      {/* Toggle sidebar */}
      <button
        onClick={onToggleSidebar}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(245,245,245,.5)',
          cursor: 'pointer',
          padding: '.375rem',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          fontSize: 18,
          lineHeight: 1,
          transition: 'color .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#F5F5F5'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,245,245,.5)'}
      >
        ☰
      </button>

      {/* Page title */}
      <span style={{ fontSize: '.9rem', fontWeight: 600, color: '#F5F5F5', flex: 1 }}>
        {PAGE_LABELS[page] || page}
      </span>

      {/* User + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        {user?.name && (
          <span style={{ fontSize: '.8rem', color: 'rgba(245,245,245,.5)' }}>
            {user.name}
          </span>
        )}
        <button
          onClick={onLogout}
          style={{
            background: 'transparent',
            border: '1px solid rgba(245,245,245,.15)',
            color: 'rgba(245,245,245,.5)',
            cursor: 'pointer',
            padding: '.3rem .75rem',
            borderRadius: 6,
            fontSize: '.75rem',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(248,113,113,.4)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,245,245,.15)'; e.currentTarget.style.color = 'rgba(245,245,245,.5)' }}
        >
          Sair
        </button>
      </div>
    </header>
  )
}
