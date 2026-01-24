import { TestBed } from '@angular/core/testing';

import { ProjectsServices } from './projects-services';

describe('ProjectsServices', () => {
  let service: ProjectsServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectsServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
