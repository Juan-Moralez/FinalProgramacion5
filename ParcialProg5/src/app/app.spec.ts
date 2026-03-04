import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { PaisesService } from './services/paises.service';
import { of } from 'rxjs';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        // Mock del servicio usado por <app-listpaises> para evitar HTTP real en tests.
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
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render listpaises component', () => {
    const fixture = TestBed.createComponent(App);
    // Dispara el render del template y del componente hijo standalone.
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-listpaises')).toBeTruthy();
  });

});
