import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { Dessert, initDessert } from './dessert';
import { DessertStore } from './dessert.store';

@Injectable({ providedIn: 'root' })
export class DessertDetailStore {
  #dessertStore = inject(DessertStore);

  #id = signal<number | undefined>(undefined);

  #dessertResource = resource({
    request: computed(() => ({ id: this.#id() })),
    loader: (param) => {
      const id = param.request.id;
      if (id) {
        const dessert = this.#dessertStore.desserts().find((d) => d.id === id);
        return Promise.resolve(dessert);
      }
      else {
        return Promise.resolve(initDessert);
      }
    },
  });

  readonly dessert = computed(() => this.#dessertResource.value() ?? initDessert);
  readonly loading = computed(() => this.#dessertResource.isLoading());
  readonly error = this.#dessertResource.error;

  #saving = signal(false);

  load(id: number): void {
    this.#id.set(id);
  }

  async save(dessert: Dessert): Promise<void> {
    this.#saving.set(true);
    await this.#dessertStore.updateItem(dessert);
    this.#saving.set(false);
  }
}
