import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectLayout } from './project-layout';

describe('ProjectLayout', () => {
  let component: ProjectLayout;
  let fixture: ComponentFixture<ProjectLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
