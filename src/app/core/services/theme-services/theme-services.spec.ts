import { TestBed } from '@angular/core/testing';

import { ThemeServices } from './theme-services';

describe('ThemeServices', () => {
  let service: ThemeServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
