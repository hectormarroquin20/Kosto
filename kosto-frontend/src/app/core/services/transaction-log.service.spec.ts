import { TestBed } from '@angular/core/testing';

import { TransactionLogService } from './transaction-log.service';

describe('TransactionLogService', () => {
  let service: TransactionLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
