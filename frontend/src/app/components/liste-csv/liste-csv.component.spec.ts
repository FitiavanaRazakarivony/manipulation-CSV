import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeCSVComponent } from './liste-csv.component';

describe('ListeCSVComponent', () => {
  let component: ListeCSVComponent;
  let fixture: ComponentFixture<ListeCSVComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeCSVComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeCSVComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
