import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainKostoComponent } from './main-kosto';

describe('MainKosto', () => {
  let component: MainKostoComponent;
  let fixture: ComponentFixture<MainKostoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainKostoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainKostoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
