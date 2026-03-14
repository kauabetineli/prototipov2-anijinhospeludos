// localStorage-based CRUD storage for all entities

export interface Animal {
  id: string;
  nome: string;
  especie: 'cachorro' | 'gato' | 'ave' | 'roedor' | 'outro';
  raca: string;
  sexo: 'macho' | 'femea' | 'desconhecido';
  data_nascimento: string;
  numero_microchip: string;
  data_entrada: string;
  status: string;
  observacoes: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Voluntario {
  id: string;
  email: string;
  nome_completo: string;
  telefone: string;
  endereco: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Local {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  observacoes: string;
  criado_em: string;
  atualizado_em: string;
}

export interface AtribuicaoAnimalLocal {
  id: string;
  animal_id: string;
  local_id: string;
  atribuido_por: string;
  atribuido_em: string;
  liberado_em: string;
  papel: string;
  observacoes: string;
}

export interface AtribuicaoAnimalVoluntario {
  id: string;
  animal_id: string;
  voluntario_id: string;
  atribuido_por: string;
  atribuido_em: string;
  liberado_em: string;
  responsabilidade: string;
  observacoes: string;
}

export interface EventoAnimal {
  id: string;
  animal_id: string;
  tipo_evento: string;
  ocorrido_em: string;
  registrado_por: string;
  detalhes: string;
}

export type TipoRegistroSaude = 'vacina' | 'consulta' | 'tratamento';

export interface HistoricoVacina {
  id: string;
  animal_id: string;
  tipo_registro: TipoRegistroSaude;
  nome_vacina: string;
  aplicado_em: string;
  proxima_dose_em: string;
  aplicado_por: string;
  lote: string;
  observacoes: string;
  criado_em: string;
}

function generateId(): string {
  return crypto.randomUUID();
}

function getCollection<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveCollection<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Generic CRUD
export function createItem<T extends { id: string }>(key: string, item: Omit<T, 'id'>): T {
  const collection = getCollection<T>(key);
  const newItem = { ...item, id: generateId() } as T;
  collection.push(newItem);
  saveCollection(key, collection);
  return newItem;
}

export function getAll<T>(key: string): T[] {
  return getCollection<T>(key);
}

export function getById<T extends { id: string }>(key: string, id: string): T | undefined {
  return getCollection<T>(key).find(item => item.id === id);
}

export function updateItem<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | undefined {
  const collection = getCollection<T>(key);
  const index = collection.findIndex(item => item.id === id);
  if (index === -1) return undefined;
  collection[index] = { ...collection[index], ...updates, atualizado_em: new Date().toISOString() } as T;
  saveCollection(key, collection);
  return collection[index];
}

export function deleteItem<T extends { id: string }>(key: string, id: string): boolean {
  const collection = getCollection<T>(key);
  const filtered = collection.filter(item => item.id !== id);
  if (filtered.length === collection.length) return false;
  saveCollection(key, filtered);
  return true;
}

// Collection keys
export const KEYS = {
  ANIMAIS: 'anjinhos_animais',
  VOLUNTARIOS: 'anjinhos_voluntarios',
  LOCAIS: 'anjinhos_locais',
  ATRIB_LOCAL: 'anjinhos_atrib_local',
  ATRIB_VOLUNTARIO: 'anjinhos_atrib_voluntario',
  EVENTOS: 'anjinhos_eventos',
  VACINAS: 'anjinhos_vacinas',
} as const;
