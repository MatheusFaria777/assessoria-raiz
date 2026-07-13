import { useState } from 'react'
import { api } from '../lib/api'
import { toast } from '../lib/toast'
import ClientModal from '../components/clients/ClientModal'
import { useClients } from '../contexts/ClientsContext'

function ActiveAdsModal({ client, onClose }) {
  const [ads, setAds] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/clients/${client.id}/active-ads`)
      .then(d => setAds(d))
      .catch(e => { toast(e.message, 'error'); onClose() })
      .finally(() => setLoading(false))
  }, [client.id])

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <span className="modal-title">Anúncios Ativos — {client.name}</span>
            {ads && <span style={{ fontSize: '.8rem', color: 'rgba(245,245,245,.45)', marginLeft: '.75rem' }}>{ads.total} anúncio{ads.total !== 1 ? 's' : ''}</span>}
          </div>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <span className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : ads?.ads?.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <p>Nenhum anúncio ativo no momento.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem', maxHeight: '60vh', overflowY: 'auto' }}>
            {ads?.ads?.map((name, i) => (
              <div key={i} style={{
                padding: '.625rem 1rem', borderRadius: 6,
                background: i % 2 === 0 ? 'rgba(245,245,245,.04)' : 'transparent',
                fontSize: '.875rem',
              }}>
                {name}
              </div>
            ))}
          </div>
        )}

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {ads?.ads?.length > 0 && (
            <button className="btn-primary" onClick={() => {
              const lines = ads.ads.join('\n')
              const msg = `📋 *Anúncios ativos — ${client.name}*\n\n${lines}\n\nTotal: ${ads.total} anúncio${ads.total !== 1 ? 's' : ''}`
              navigator.clipboard.writeText(msg).then(() => toast('Lista copiada!')).catch(() => toast('Erro ao copiar','error'))
            }}>
              📋 Copiar lista
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

function TokenBadge({ expires }) {
  if (!expires) return null
  const days = Math.ceil((new Date(expires) - Date.now()) / 86400000)
  if (days > 14) return null
  return (
    <span className={`badge ${days <= 3 ? 'badge-error' : 'badge-warning'}`}>
      Token expira em {days}d
    </span>
  )
}

function ClientCard({ client, onEdit, onDelete, onViewAds }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
      {/* Avatar */}
      <div style={{
        width: 42, height: 42, borderRadius: 8, flexShrink: 0,
        background: 'rgba(203,161,53,.15)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#CBA135',
      }}>
        {client.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: '.9375rem' }}>{client.name}</span>
          {client.has_meta && <span className="badge badge-meta">Meta</span>}
          {client.has_google && <span className="badge badge-google">Google</span>}
          <TokenBadge expires={client.meta_token_expires} />
        </div>
        <div style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.4)', marginTop: '.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {client.meta_account_id && <span>Conta: {client.meta_account_id}</span>}
          {client.adsets?.length > 0 && <span>{client.adsets.length} adset{client.adsets.length > 1 ? 's' : ''}</span>}
          {client.campaign_groups?.length > 0 && <span>{client.campaign_groups.length} grupo{client.campaign_groups.length > 1 ? 's' : ''}</span>}
          {client.sheets_id && <span>✓ Planilha</span>}
        </div>
      </div>

      {/* Grupos de campanha */}
      {client.campaign_groups?.length > 0 && (
        <div style={{ display: 'flex', gap: '.375rem', flexWrap: 'wrap', maxWidth: 200 }}>
          {client.campaign_groups.slice(0, 3).map(g => (
            <span key={g.id} style={{
              fontSize: '.65rem', fontWeight: 600, padding: '.125rem .5rem',
              borderRadius: 999, background: `${g.color}20`, color: g.color,
            }}>
              {g.type}
            </span>
          ))}
          {client.campaign_groups.length > 3 && (
            <span style={{ fontSize: '.65rem', color: 'rgba(245,245,245,.35)' }}>+{client.campaign_groups.length - 3}</span>
          )}
        </div>
      )}

      {/* Ações */}
      <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
        {client.has_meta && (
          <button className="btn-ghost" onClick={() => onViewAds(client)} title="Ver anúncios ativos">
            📋 Ativos
          </button>
        )}
        <button className="btn-ghost" onClick={() => onEdit(client)}>Editar</button>
        <button className="btn-danger" onClick={() => onDelete(client)}>Remover</button>
      </div>
    </div>
  )
}

export default function Clients() {
  const { clients, loading, reload } = useClients()
  const [modal, setModal] = useState(null)
  const [adsModal, setAdsModal] = useState(null)
  const [search, setSearch] = useState('')

  const handleDelete = async (client) => {
    if (!confirm(`Remover "${client.name}"?`)) return
    try {
      await api.delete(`/api/clients/${client.id}`)
      toast('Cliente removido')
      reload()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header da página */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Clientes</h2>
          <p style={{ margin: '.25rem 0 0', fontSize: '.875rem', color: 'rgba(245,245,245,.4)' }}>
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          <input className="input" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente..." style={{ width: 200 }} />
          <button className="btn-primary" onClick={() => setModal('new')}>+ Novo Cliente</button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <span className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>👥</div>
          <p style={{ fontWeight: 500, color: 'rgba(245,245,245,.5)', fontSize: '1rem' }}>
            {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </p>
          {!search && (
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setModal('new')}>
              Cadastrar primeiro cliente
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
          {filtered.map(c => (
            <ClientCard key={c.id} client={c}
              onEdit={setModal}
              onDelete={handleDelete}
              onViewAds={setAdsModal} />
          ))}
        </div>
      )}

      {modal && (
        <ClientModal
          client={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); reload() }}
        />
      )}

      {adsModal && (
        <ActiveAdsModal
          client={adsModal}
          onClose={() => setAdsModal(null)}
        />
      )}
    </div>
  )
}
