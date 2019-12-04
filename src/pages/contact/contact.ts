import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GoogleAnalyticsService } from '../../app/services/analytics.service';

/**
 * Generated class for the ContactPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html',
})
export class ContactPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
  private gaSvc:GoogleAnalyticsService) {
  }

  ionViewDidLoad() {
    this.gaSvc.gaTrackPageEnter('Contact Page');
  }

}
