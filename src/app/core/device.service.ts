import { HostListener, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, map, Observable, ReplaySubject, takeUntil } from 'rxjs';
import { Device } from '@shr/models/device.model';
import { DeviceDetectorService } from 'ngx-device-detector';

@Injectable({
  providedIn: 'root'
})
export class DeviceService implements OnDestroy{

  private currentDevice = new BehaviorSubject<Device>(null)

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private deviceDetectorService: DeviceDetectorService) {
    this.currentDevice.next(this.createDevice());
    this.watchResize();
  }

  ngOnDestroy() {
    this.currentDevice.complete();
    this.currentDevice = null;
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public getDevice(): Observable<Device> {
    return this.currentDevice.asObservable();
  }

  public isMobile(): Observable<boolean> {
    return this.getDevice().pipe(map(device => device.isMobile));
  }

  public isTablet(): Observable<boolean> {
    return this.getDevice().pipe(map(device => device.isTablet));
  }

  public isDesktop(): Observable<boolean> {
    return this.getDevice().pipe(map(device => device.isDesktop));
  }

  private createDevice(): Device {
    return {
      isMobile: this.deviceDetectorService.isMobile(),
      isTablet: this.deviceDetectorService.isTablet(),
      isDesktop: this.deviceDetectorService.isDesktop()
    };
  }

  private watchResize() {
    fromEvent(window, 'resize')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.currentDevice.next(this.createDevice()));
  }
}
