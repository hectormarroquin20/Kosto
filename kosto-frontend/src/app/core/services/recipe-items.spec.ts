import { TestBed } from '@angular/core/testing';

import { RecipeItems } from './recipe-items';

describe('RecipeItems', () => {
  let service: RecipeItems;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecipeItems);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
