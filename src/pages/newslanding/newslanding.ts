import { Component } from '@angular/core';
import { NavController, NavParams, Toast, LoadingController, ToastController } from 'ionic-angular';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { GoogleAnalyticsService } from '../../app/services/analytics.service';
import { Storage } from '@ionic/storage';
import { LANGUAGE_KEY } from '../../app/app.constants';

/**
 * Generated class for the NewslandingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-newslanding',
  templateUrl: 'newslanding.html',
})
export class NewslandingPage {
  private currentLang;
  id: string = null;
  news  = {};
  private isLeaving: Boolean=false;
  private toastReload: Toast;
  constructor(public navCtrl: NavController, public navParams: NavParams,
  public http:Http, private loadingController:LoadingController, private toastCtrl: ToastController,
  private gaSvc:GoogleAnalyticsService, storage:Storage) {
    storage.get(LANGUAGE_KEY).then(lang=>{
    this.currentLang = lang;
    this.getNewsView();
  })
  }

  ionViewDidLeave(){ 
    this.isLeaving=true;
    if (this.toastReload)
      this.toastReload.dismiss();
  }
  getNewsView(){
    this.id=null;
    this.news={};
    this.id = this.navParams.get('id');

    let loadingPopup = this.loadingController.create({
      content: 'Verifying...'
    });
    loadingPopup.present();

    let body = new URLSearchParams();
    body.set('action', 'getNews');
    body.set('URL', encodeURIComponent(this.id));
    body.set('language', this.currentLang);

    let options = new RequestOptions({
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*'
      })
    });

    this.http.post('http://cums.the-v.net/site.aspx', body)
      .subscribe(response => {
        this.news = response.json()[0];
      }, e=>{
        let toast = this.toastCtrl.create({
              message: 'Something went wrong! Reload and Try again.',
              position: 'bottom',
              showCloseButton: true,
              closeButtonText: 'Reload'
            });
            toast.onDidDismiss(()=>{
              if(!this.isLeaving)
                this.getNewsView();
            })
            toast.present();
            this.toastReload=toast;
          loadingPopup.dismiss();
      }, () => {
        loadingPopup.dismiss();
      });
  }
  ionViewDidLoad() {
    this.gaSvc.gaTrackPageEnter('News Page');
  }
  

}
