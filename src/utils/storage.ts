import localforage from 'localforage';
import { Version, SLAData, Stats } from '../types';

const STORAGE_KEY = 'sla_versions';

// Inicializar localforage
localforage.config({
  name: 'SLA Dashboard',
  storeName: 'sla_data'
});

// Gerar ID único
function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : 
    Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Salvar nova versão
export async function saveVersion(data: SLAData[], stats: Stats): Promise<Version> {
  const versions = await getVersions();
  
  const newVersion: Version = {
    id: generateId(),
    ts: new Date().toISOString(),
    data,
    stats
  };
  
  versions.unshift(newVersion);
  await localforage.setItem(STORAGE_KEY, versions);
  return newVersion;
}

// Obter todas as versões
export async function getVersions(): Promise<Version[]> {
  const versions = await localforage.getItem<Version[]>(STORAGE_KEY) || [];
  return versions;
}

// Obter versão específica
export async function getVersion(id: string): Promise<Version | null> {
  const versions = await getVersions();
  return versions.find(v => v.id === id) || null;
}

// Obter versão mais recente
export async function getLatestVersion(): Promise<Version | null> {
  const versions = await getVersions();
  return versions.length > 0 ? versions[0] : null;
}
