import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminVerifyEmail } from './admin-verify-email';

describe('AdminVerifyEmail', () => {
  let component: AdminVerifyEmail;
  let fixture: ComponentFixture<AdminVerifyEmail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminVerifyEmail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminVerifyEmail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
