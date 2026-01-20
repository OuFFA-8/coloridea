import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProject } from './client-project';

describe('ClientProject', () => {
  let component: ClientProject;
  let fixture: ComponentFixture<ClientProject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProject]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientProject);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
