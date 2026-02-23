import { TestBed } from '@angular/core/testing';

import { OutputsService } from './outputs-service';

describe('OutputsService', () => {
  let service: OutputsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutputsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
