import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimatedButton } from './animated-button';

describe('AnimatedButton', () => {
  let component: AnimatedButton;
  let fixture: ComponentFixture<AnimatedButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedButton]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnimatedButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit buttonClick event when clicked', () => {
    spyOn(component.buttonClick, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.buttonClick.emit).toHaveBeenCalled();
  });

  it('should not emit event when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    spyOn(component.buttonClick, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.buttonClick.emit).not.toHaveBeenCalled();
  });

  it('should display label text', () => {
    component.label = 'Test Button';
    fixture.detectChanges();
    const buttonText = fixture.nativeElement.querySelector('.button-text');
    expect(buttonText.textContent).toBe('Test Button');
  });

  it('should display icon when provided', () => {
    component.icon = 'ci ci-Copy';
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('i');
    expect(icon).toBeTruthy();
    expect(icon.classList.contains('ci')).toBe(true);
    expect(icon.classList.contains('ci-Copy')).toBe(true);
  });

  it('should not display icon when not provided', () => {
    component.icon = '';
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('i');
    expect(icon).toBeFalsy();
  });
});
