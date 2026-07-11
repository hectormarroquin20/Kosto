import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainKosto } from './main-kosto';

describe('MainKosto', () => {
  let component: MainKosto;
  let fixture: ComponentFixture<MainKosto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainKosto],
    }).compileComponents();

    fixture = TestBed.createComponent(MainKosto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
