import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissingStockResource } from './missing-stock-resource';

describe('MissingStockResource', () => {
  let component: MissingStockResource;
  let fixture: ComponentFixture<MissingStockResource>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissingStockResource],
    }).compileComponents();

    fixture = TestBed.createComponent(MissingStockResource);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
