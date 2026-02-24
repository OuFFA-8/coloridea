import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSelect } from './project-select';

describe('ProjectSelect', () => {
  let component: ProjectSelect;
  let fixture: ComponentFixture<ProjectSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectSelect);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
