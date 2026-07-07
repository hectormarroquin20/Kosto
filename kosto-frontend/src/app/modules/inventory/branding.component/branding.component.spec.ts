import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandingComponent } from './branding.component';

describe('BrandingComponent', () => {
  let component: BrandingComponent;
  let fixture: ComponentFixture<BrandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
