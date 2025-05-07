// utils/storage.ts
import localforage from 'localforage'
import { v4 as uuidv4 } from 'uuid'

export interface Version {
  id: string    // uuid
  ts: string    // timestamp ISO
  data: any[]   // payload
}

const KEY = 'sla_versions'

/**
 * Retorna todas as versões salvas
 */
export async function getVersions(): Promise<Version[]> {
  const arr = (await localforage.getItem<Version[]>(KEY)) || []
  return arr.sort((a, b) => b.ts.localeCompare(a.ts))
}

/**
 * Adiciona uma nova versão ao storage
 */
export async function addVersion(data: any[]): Promise<Version> {
  const versions = await getVersions()
  const v: Version = {
    id: uuidv4(),
    ts: new Date().toISOString(),
    data
  }
  versions.unshift(v)
  await localforage.setItem(KEY, versions)
  return v
}

/**
 * Busca uma versão pelo ID
 */
export async function getVersion(id: string): Promise<Version|undefined> {
  const versions = await getVersions()
  return versions.find(v => v.id === id)
}
