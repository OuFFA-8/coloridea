import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Timelapses } from './timelapses';

describe('Timelapses', () => {
  let component: Timelapses;
  let fixture: ComponentFixture<Timelapses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Timelapses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Timelapses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
