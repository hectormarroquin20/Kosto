import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormKosto } from './form-kosto';

describe('FormKosto', () => {
  let component: FormKosto;
  let fixture: ComponentFixture<FormKosto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormKosto],
    }).compileComponents();

    fixture = TestBed.createComponent(FormKosto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
