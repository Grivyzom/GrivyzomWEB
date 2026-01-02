import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpAddressesDropdown } from './ip-addresses-dropdown';

describe('IpAddressesDropdown', () => {
  let component: IpAddressesDropdown;
  let fixture: ComponentFixture<IpAddressesDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpAddressesDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpAddressesDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
