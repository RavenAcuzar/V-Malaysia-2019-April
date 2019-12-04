import { Component } from '@angular/core';
import { NavController, NavParams, Events, Platform } from 'ionic-angular';
import { SplashNextPage } from '../splash-next/splash-next';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../app/services/language.service';
import { GoogleAnalyticsService } from '../../app/services/analytics.service';
import { Storage } from '@ionic/storage';
import { LANGUAGE_KEY, SURVEY_FORM_Q} from '../../app/app.constants';


/**
 * Generated class for the ChangeLangPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-change-lang',
  templateUrl: 'change-lang.html',
})
export class ChangeLangPage {
  SplashnextPage = SplashNextPage;
  
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private translateService:TranslateService, 
    private events: Events,
    private platform: Platform,
    private storage:Storage,
    private gaSvc:GoogleAnalyticsService,
    ) {
      
  }
  segmentChanged(event) {
    if(event == "ar"){
      this.platform.setDir('rtl', true);
      this.platform.setDir('ltr', false); 
    }
    else
    {
      this.platform.setDir('ltr', true);
      this.platform.setDir('rtl', false);
    }
    this.translateService.use(event);
    
    this.storage.set(LANGUAGE_KEY, event);
    this.storage.set(SURVEY_FORM_Q, null);
    LanguageService.publishLanguageChange(this.events);
  }
  ionViewDidLoad() {
    this.gaSvc.gaTrackPageEnter('Change-Language');
    
  }
  

}
