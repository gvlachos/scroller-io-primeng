import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollComponent } from './scroll.component';

describe('ScrollReverseComponent', () => {
  let component: ScrollComponent;
  let fixture: ComponentFixture<ScrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
