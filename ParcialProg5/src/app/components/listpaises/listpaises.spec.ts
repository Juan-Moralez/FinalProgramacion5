import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListpaisesComponent } from './listpaises.component';
import { PaisesService } from '../../services/paises.service';
import { of } from 'rxjs';

describe('ListpaisesComponent', () => {
  let component: ListpaisesComponent;
  let fixture: ComponentFixture<ListpaisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListpaisesComponent], // standalone component
      providers: [
        // Mock del servicio para controlar el flujo del componente sin depender de la API.
        {
          provide: PaisesService,
          useValue: {
            getAllpaises: () => of([]),
            getPaisesByName: () => of([]),
            getPaisesByRegion: () => of([])
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListpaisesComponent);
    component = fixture.componentInstance;
    // Ejecuta ngOnInit() y la carga inicial con el mock.
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
