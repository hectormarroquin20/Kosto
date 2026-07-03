import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionList } from './production-list';

describe('ProductionList', () => {
  let component: ProductionList;
  let fixture: ComponentFixture<ProductionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionList],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
