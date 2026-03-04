import { Injectable } from '@angular/core';
import { ClientPair } from './ClientPair';
import { Client } from './Client';

const STORAGE_KEY = 'client_pairs';

@Injectable({ providedIn: 'root' })
export class ClientPairService {
  private pairs = new Set<string>(); // stored as "id1-id2"

  constructor() {
    this.load();
  }

  private serialize([a, b]: ClientPair): string {
    const [min, max] = a < b ? [a, b] : [b, a];
    return `${min}-${max}`;
  }

  private deserialize(value: string): ClientPair {
    const [a, b] = value.split('-').map(Number);
    return [a, b];
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.pairs]));
  }

  private load(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed: string[] = JSON.parse(raw);
      this.pairs = new Set(parsed);
    } catch {
      this.pairs.clear();
    }
  }

  /** Public API */

  getAll(): ClientPair[] {
    return [...this.pairs].map((v) => this.deserialize(v));
  }

  exists(a: number, b: number): boolean {
    return this.pairs.has(this.serialize([a, b]));
  }

  addPair(a: number, b: number): void {
    if (a === b) return;

    const key = this.serialize([a, b]);
    if (this.pairs.has(key)) return;

    this.pairs.add(key);
    this.persist();
  }

  public removePair(a: number, b: number): void {
    const key = this.serialize([a, b]);
    this.pairs.delete(key);
    this.persist();
  }

  /** Remove all pairs containing this client */
  public removePairsByClientId(clientId: number): void {
    for (const serializedPair of this.pairs) {
      if (this.deserialize(serializedPair).includes(clientId)) this.pairs.delete(serializedPair);
    }
    this.persist();
  }

  public getPairClientsFor(client: Client): Array<Client['id']> {
    let result: Array<Client['id']> = [];
    for (const serializedPair of this.pairs) {
      const clientPair = this.deserialize(serializedPair);
      if (clientPair[0] === client.id) result.push(clientPair[1]);
      else if (clientPair[1] === client.id) result.push(clientPair[0]);
    }
    return result;
  }
}
