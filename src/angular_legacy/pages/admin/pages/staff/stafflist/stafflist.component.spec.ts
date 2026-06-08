import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StafflistComponent } from './stafflist.component';

describe('StafflistComponent', () => {
  let component: StafflistComponent;
  let fixture: ComponentFixture<StafflistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StafflistComponent]
    });
    fixture = TestBed.createComponent(StafflistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
