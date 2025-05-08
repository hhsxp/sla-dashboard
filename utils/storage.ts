// utils/storage.ts
import localforage from 'localforage'

export interface Version {
  id: string   // uuid-like
  ts: string   // timestamp ISO
  data: any[]  // payload
}

const KEY = 'sla_versions'

/** Gera um ID único (usa crypto.randomUUID no browser/Node moderno) */
function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as any).randomUUID()
  }
  // fallback simples
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/** Retorna todas as versões, da mais nova para a mais antiga */
export async function getVersions(): Promise<Version[]> {
  const arr = (await localforage.getItem<Version[]>(KEY)) || []
  return arr.sort((a, b) => b.ts.localeCompare(a.ts))
}

/** Adiciona uma nova versão com o array de dados fornecido */
export async function addVersion(data: any[]): Promise<Version> {
  const versions = await getVersions()
  const v: Version = {
    id: makeId(),
    ts: new Date().toISOString(),
    data
  }
  versions.unshift(v)
  await localforage.setItem(KEY, versions)
  return v
}

/** Busca uma versão pelo seu ID */
export async function getVersion(id: string): Promise<Version | undefined> {
  return (await getVersions()).find(v => v.id === id)
}
