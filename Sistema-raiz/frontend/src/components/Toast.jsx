import { useState, useEffect } from 'react'
import { registerToast } from '../lib/toast'

export default function Toast() {
  const [items, setItems] = useState([])

  useEffect(() => {
    registerToast(item => {
      setItems(prev => [...prev, item])
      setTimeout(() => setItems(prev => prev.filter(i => i.id !== item.id)), 3500)
    })
  }, [])

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
      {items.map(item => (
        <div key={item.id} className={`toast toast-${item.type}`}>
          {item.message}
        </div>
      ))}
    </div>
  )
}
