const DAYS_PT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

export function getDayInfo() {
  const dayIndex = new Date().getDay()
  return {
    dayIndex,
    dayName: DAYS_PT[dayIndex],
    isSegunda: dayIndex === 1,
    isQuarta: dayIndex === 3,
  }
}

const CADENCIA_CACHE_TTL = 4 * 60 * 60 * 1000 // 4 horas

function cadenciaCacheKey(tab) {
  const today = new Date().toISOString().slice(0, 10)
  return `cadencia_${tab}_${today}`
}

export function readCadenciaCache(tab) {
  try {
    const raw = localStorage.getItem(cadenciaCacheKey(tab))
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CADENCIA_CACHE_TTL) return null
    return data
  } catch { return null }
}

export function writeCadenciaCache(tab, data) {
  try {
    localStorage.setItem(cadenciaCacheKey(tab), JSON.stringify({ ts: Date.now(), data }))
  } catch {}
}
