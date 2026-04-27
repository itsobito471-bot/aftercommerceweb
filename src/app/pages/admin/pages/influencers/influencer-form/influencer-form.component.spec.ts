import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfluencerFormComponent } from './influencer-form.component';

describe('InfluencerFormComponent', () => {
  let component: InfluencerFormComponent;
  let fixture: ComponentFixture<InfluencerFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfluencerFormComponent]
    });
    fixture = TestBed.createComponent(InfluencerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
