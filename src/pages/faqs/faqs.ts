import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LANGUAGE_KEY } from '../../app/app.constants';

/**
 * Generated class for the FaqsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-faqs',
  templateUrl: 'faqs.html',
})
export class FaqsPage {
  private currentLang;

  constructor(public navCtrl: NavController, public navParams: NavParams,
  storage:Storage) {
    storage.get(LANGUAGE_KEY).then(lang=>{
      this.currentLang = lang;
    })
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FaqsPage');
  }

}
