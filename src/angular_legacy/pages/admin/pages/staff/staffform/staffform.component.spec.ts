import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffformComponent } from './staffform.component';

describe('StaffformComponent', () => {
  let component: StaffformComponent;
  let fixture: ComponentFixture<StaffformComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StaffformComponent]
    });
    fixture = TestBed.createComponent(StaffformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
