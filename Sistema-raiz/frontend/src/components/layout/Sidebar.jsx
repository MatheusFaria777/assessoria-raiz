const NAV = [
  { id: 'dashboard', label: 'Dashboard',     icon: '📊' },
  { id: 'cadencia',  label: 'Cadência',      icon: '📅' },
  { id: 'clients',   label: 'Clientes',      icon: '👥' },
  { id: 'reports',   label: 'Relatórios',    icon: '📄' },
  { id: 'uploader',  label: 'Uploader',      icon: '🚗' },
  { id: 'sheets',    label: 'Planilhas',     icon: '🗂️' },
  { id: 'feedback',  label: 'Formulários',   icon: '📝' },
  { id: 'settings',  label: 'Configurações', icon: '⚙️' },
]

export default function Sidebar({ current, onNavigate, open }) {
  return (
    <div style={{
      width: open ? 220 : 60,
      flexShrink: 0,
      background: '#1E3D34',
      borderRight: '1px solid rgba(245,245,245,.08)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width .2s ease',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: open ? '1.25rem 1rem' : '1.25rem .75rem',
        borderBottom: '1px solid rgba(245,245,245,.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '.625rem',
        minHeight: 60,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#CBA135',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0, fontWeight: 700, color: '#162d26',
        }}>R</div>
        {open && (
          <span style={{ fontSize: '.875rem', fontWeight: 700, color: '#F5F5F5', whiteSpace: 'nowrap' }}>
            Sistema Raiz
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '.5rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(item => {
          const active = current === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={!open ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '.625rem',
                padding: open ? '.5rem .75rem' : '.5rem',
                justifyContent: open ? 'flex-start' : 'center',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                fontSize: open ? '.8125rem' : '1rem',
                fontWeight: active ? 600 : 400,
                background: active ? 'rgba(203,161,53,.15)' : 'transparent',
                color: active ? '#CBA135' : 'rgba(245,245,245,.6)',
                transition: 'all .15s',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {open && item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      {open && (
        <div style={{
          padding: '.75rem 1rem',
          borderTop: '1px solid rgba(245,245,245,.08)',
          fontSize: '.7rem',
          color: 'rgba(245,245,245,.25)',
        }}>
          Assessoria Raiz
        </div>
      )}
    </div>
  )
}
