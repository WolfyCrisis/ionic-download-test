import { Component } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    if (Capacitor.getPlatform() !== 'web') {
      LocalNotifications.requestPermissions();
      LocalNotifications.createChannel({
        id: 'no-sound',
        name: 'No Sound Notification',
        description: 'No Sound Notification',
        importance: 2
      })
    }
  }
}
