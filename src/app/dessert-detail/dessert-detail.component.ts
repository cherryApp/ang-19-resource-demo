import { ChangeDetectionStrategy, Component, OnChanges, inject, input, numberAttribute } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DessertDetailStore } from '../data/dessert-detail.store';
// import { FormsModule } from '@angular/forms';
import { deepLink, flatten } from '../shared/linked-utils';
import { SignalModelDirective } from '../common/directive/signal-model.directive';

@Component({
  selector: 'app-dessert-detail',
  standalone: true,
  imports: [
    RouterLink,
    // FormsModule,
    SignalModelDirective,
  ],
  templateUrl: './dessert-detail.component.html',
  styleUrl: './dessert-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DessertDetailComponent implements OnChanges {
  router = inject(Router);

  store = inject(DessertDetailStore);

  id = input.required({
    transform: numberAttribute
  });

  loadedDessert = this.store.dessert;
  loading = this.store.loading;
  error = this.store.error;

  dessert = deepLink(this.loadedDessert);

  ngOnChanges(): void {
    const id = this.id();
    this.store.load(id);
  }

  async save(): Promise<void> {
    const dessert = flatten(this.dessert);
    await this.store.save(dessert);
    this.router.navigate(['']);
  }

}
