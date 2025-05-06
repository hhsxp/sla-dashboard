import localforage from 'localforage';
import { v4 as uuid } from 'uuid';

const KEY = 'sla_versions';

export type Version = { id: string; ts: string; data: any[] };

// Carrega versões
export async function getVersions(): Promise<Version[]> {
  return (await localforage.getItem<Version[]>(KEY)) || [];
}

// Salva uma nova versão e mantém só as últimas 4
export async function addVersion(data: any[]): Promise<string> {
  const versions = await getVersions();
  const id = uuid();
  const ts = new Date().toISOString();
  versions.unshift({ id, ts, data });
  if (versions.length > 4) versions.pop();
  await localforage.setItem(KEY, versions);
  return id;
}

// Busca dados por versão
export async function getDataById(id: string): Promise<any[] | null> {
  const versions = await getVersions();
  return versions.find(v=>v.id === id)?.data || null;
}