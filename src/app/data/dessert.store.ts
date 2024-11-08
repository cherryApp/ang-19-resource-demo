import { Injectable, inject, signal, computed, resource } from "@angular/core";
import { debounceTrue, debounce, skipInitial } from "../shared/resource-utils";
import { Dessert } from "./dessert";
import { DessertService } from "./dessert.service";
import { RatingService, DessertIdToRatingMap } from "./rating.service";
import { getErrorMessage } from "../shared/get-error-message";
import { DessertFilter } from "./dessert-filter";

@Injectable({ providedIn: 'root' })
export class DessertStore {
  #dessertService = inject(DessertService);
  #ratingService = inject(RatingService);
  #selectedId = signal<number | undefined>(undefined);

  readonly saving = signal(false);
  readonly originalName = signal('');
  readonly englishName = signal('');

  #dessertsCriteria = computed(() => ({
    originalName: this.originalName(),
    englishName: this.englishName(),
  }));

  #dessertsResource = resource({
    request: this.#dessertsCriteria,
    loader: debounce((param) => {
      return this.#dessertService.findPromise(param.request, param.abortSignal);
    })
  });

  #ratingsResource = resource({
    loader: skipInitial(() => {
      return this.#ratingService.loadExpertRatingsPromise();
    })
  });

  #selectedResource = resource({
    request: this.#selectedId,
    loader: (param) => {
      const id = param.request;
      if (id) {
        return this.#dessertService.findPromiseById(id);
      }
      else {
        return Promise.resolve(undefined);
      }
    },
  });

  readonly desserts = computed(() => this.#dessertsResource.value() ?? []);
  readonly ratings = computed(() => this.#ratingsResource.value() ?? {});
  readonly ratedDesserts = computed(() => toRated(this.desserts(), this.ratings()));
  readonly selectedDessert = computed(() => this.#selectedResource.value() ?? undefined);

  readonly loading = debounceTrue(() => this.#ratingsResource.isLoading() || this.#dessertsResource.isLoading(), 500);
  readonly error = computed(() => getErrorMessage(this.#dessertsResource.error() || this.#ratingsResource.error()));

  loadRatings(): void {
    this.#ratingsResource.reload();
  }

  loadDessert(id: number): void {
    this.#selectedId.set(id);
  }

  updateFilter(filter: DessertFilter): void {
    this.originalName.set(filter.originalName);
    this.englishName.set(filter.englishName);
  }

  updateRating(id: number, rating: number): void {
    this.#ratingsResource.update((ratings) => ({
      ...ratings,
      [id]: rating,
    }));
  }

  async updateItem(dessert: Dessert): Promise<void> {
    this.saving.set(true);

    try {
      const updated = await this.#dessertService.updatePromise(dessert);
      console.log('updated', updated);
      const updatedIndex = this.desserts().findIndex((d) => d.id === updated.id);
      if (updatedIndex >= 0) {
        const desserts = this.desserts();
        desserts[updatedIndex] = updated;
        this.#dessertsResource.update(() => [...desserts]);
      }
    }
    finally {
      this.saving.set(false);
    }
  }
}

function toRated(desserts: Dessert[], ratings: DessertIdToRatingMap): Dessert[] {
  return desserts.map((d) =>
    ratings[d.id] ? { ...d, rating: ratings[d.id] } : d,
  );
}
