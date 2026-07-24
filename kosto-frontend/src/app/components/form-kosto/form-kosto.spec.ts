import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormKostoComponent } from './form-kosto';

describe('FormKosto', () => {
  let component: FormKostoComponent;
  let fixture: ComponentFixture<FormKostoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormKostoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormKostoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
