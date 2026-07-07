import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { toast } from '../../lib/toast'

const EMPTY = { name: '', type: '', color: '#60a5fa', keywords: '' }

function GroupRow({ group, onEdit, onDelete }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '.75rem 1rem', borderRadius: 8,
      background: 'rgba(245,245,245,.04)', border: '1px solid rgba(245,245,245,.08)',
    }}>
      <div style={{
        width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
        background: group.color,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{group.name}</div>
        <div style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.4)', marginTop: '.125rem' }}>
          tipo: {group.type}
          {group.keywords && ` · palavras: ${group.keywords}`}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
        <button className="btn-ghost" onClick={() => onEdit(group)} style={{ fontSize: '.8rem' }}>Editar</button>
        <button className="btn-danger" onClick={() => onDelete(group)} style={{ fontSize: '.8rem' }}>Remover</button>
      </div>
    </div>
  )
}

function GroupForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name.trim() || !form.type.trim()) {
      toast('Nome e tipo são obrigatórios', 'error'); return
    }
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  return (
    <div style={{
      padding: '1rem', borderRadius: 8,
      background: 'rgba(245,245,245,.04)', border: '1px solid rgba(245,245,245,.12)',
      display: 'flex', flexDirection: 'column', gap: '.75rem',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '.75rem', alignItems: 'end' }}>
        <div className="field">
          <label className="label">Nome *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Campanhas de Mensagem" />
        </div>
        <div className="field">
          <label className="label">Tipo (slug) *</label>
          <input className="input" value={form.type} onChange={e => set('type', e.target.value)} placeholder="mensagem" />
        </div>
        <div className="field">
          <label className="label">Cor</label>
          <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
            style={{ width: 48, height: 36, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }} />
        </div>
      </div>
      <div className="field">
        <label className="label">Palavras-chave (separadas por vírgula)</label>
        <input className="input" value={form.keywords} onChange={e => set('keywords', e.target.value)}
          placeholder="mensagem, whatsapp, inbox" />
      </div>
      <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className="btn-primary" onClick={submit} disabled={saving}>
          {saving ? <span className="spinner" /> : initial ? 'Salvar' : 'Criar'}
        </button>
      </div>
    </div>
  )
}

export default function CampaignGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = () => {
    api.get('/api/campaign-groups/')
      .then(setGroups)
      .catch(() => toast('Erro ao carregar grupos', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (form) => {
    const keywords = form.keywords
      ? JSON.stringify(form.keywords.split(',').map(k => k.trim()).filter(Boolean))
      : '[]'
    await api.post('/api/campaign-groups/', { ...form, keywords })
    toast('Grupo criado')
    setAdding(false)
    load()
  }

  const handleUpdate = async (form) => {
    const keywords = form.keywords
      ? JSON.stringify(form.keywords.split(',').map(k => k.trim()).filter(Boolean))
      : '[]'
    await api.put(`/api/campaign-groups/${editing.id}`, { ...form, keywords })
    toast('Grupo atualizado')
    setEditing(null)
    load()
  }

  const handleDelete = async (group) => {
    if (!confirm(`Remover "${group.name}"?`)) return
    try {
      await api.delete(`/api/campaign-groups/${group.id}`)
      toast('Grupo removido')
      load()
    } catch (e) { toast(e.message, 'error') }
  }

  const toFormGroup = (g) => ({
    name: g.name, type: g.type, color: g.color,
    keywords: (() => { try { return JSON.parse(g.keywords || '[]').join(', ') } catch { return g.keywords || '' } })(),
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: '0 0 .25rem', fontSize: '1rem', fontWeight: 600 }}>Grupos de Campanha</h3>
          <p style={{ margin: 0, fontSize: '.875rem', color: 'rgba(245,245,245,.45)' }}>
            Classifique campanhas por tipo para segmentar relatórios.
          </p>
        </div>
        {!adding && (
          <button className="btn-primary" onClick={() => setAdding(true)}>+ Novo Grupo</button>
        )}
      </div>

      {adding && (
        <GroupForm onSave={handleCreate} onCancel={() => setAdding(false)} />
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {groups.map(g => editing?.id === g.id ? (
            <GroupForm key={g.id} initial={toFormGroup(g)} onSave={handleUpdate} onCancel={() => setEditing(null)} />
          ) : (
            <GroupRow key={g.id} group={g} onEdit={setEditing} onDelete={handleDelete} />
          ))}
          {groups.length === 0 && !adding && (
            <div className="empty-state">
              <p>Nenhum grupo cadastrado.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
