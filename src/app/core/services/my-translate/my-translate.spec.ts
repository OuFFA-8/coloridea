import { TestBed } from '@angular/core/testing';

import { MyTranslate } from './my-translate';

describe('MyTranslate', () => {
  let service: MyTranslate;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyTranslate);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
