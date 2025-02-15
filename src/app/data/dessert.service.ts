import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { Dessert } from './dessert';
import { DessertFilter } from './dessert-filter';
import { toPromise } from '../shared/to-promise';

const apiUrl = 'http://localhost:3000/desserts';

@Injectable({ providedIn: 'root' })
export class DessertService {
  #http = inject(HttpClient);

  find(filter: DessertFilter): Observable<Dessert[]> {
    return this.#http
      .get<Dessert[]>(apiUrl)
      .pipe(
        map((result) =>
          result.filter(
            (d) =>
              d.originalName
                .toLowerCase()
                .includes(filter.originalName.toLowerCase()) &&
              d.englishName
                .toLowerCase()
                .includes(filter.englishName.toLowerCase()),
          ),
        ),
      );
  }

  findPromise(filter: DessertFilter, abortSignal: AbortSignal): Promise<Dessert[]> {
    return toPromise(this.find(filter), abortSignal);
  }

  findById(id: number): Observable<Dessert | undefined> {
    return this.#http
      .get<Dessert[]>(apiUrl)
      .pipe(map((result) => result.find((d) => d.id == id)));
  }

  findPromiseById(id: number, abortSignal?: AbortSignal): Promise<Dessert | undefined> {
    return toPromise(this.findById(id), abortSignal);
  }

  updatePromise(dessert: Dessert): Promise<Dessert> {
    return firstValueFrom(this.#http.patch<Dessert>(`${apiUrl}/${dessert.id}`, dessert));
  }
}
