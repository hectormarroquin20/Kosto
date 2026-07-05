import { TestBed } from '@angular/core/testing';

import { RecipeItemsService } from './recipe-items.service';

describe('RecipeItems', () => {
  let service: RecipeItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecipeItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
