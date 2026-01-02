import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhyMultipleServers } from './why-multiple-servers';

describe('WhyMultipleServers', () => {
  let component: WhyMultipleServers;
  let fixture: ComponentFixture<WhyMultipleServers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhyMultipleServers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhyMultipleServers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
