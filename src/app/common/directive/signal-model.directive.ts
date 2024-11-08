import { Directive, ElementRef, inject, Input, OnInit, WritableSignal } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[signalModel]',
  standalone: true,
})
export class SignalModelDirective implements OnInit {

  @Input() signalModel!: WritableSignal<string | number>;

  elementRef = inject(ElementRef);

  ngOnInit(): void {
    this.elementRef.nativeElement.value = this.signalModel();

    this.elementRef.nativeElement.addEventListener('input', () => {
      this.signalModel.set(this.elementRef.nativeElement.value);
    });
  }

}
