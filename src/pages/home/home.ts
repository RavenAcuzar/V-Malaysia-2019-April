import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, Toast } from 'ionic-angular';
import { DownloadsPage } from '../downloads/downloads';
import { NewslandingPage } from '../newslanding/newslanding';
import { MarkPage } from '../mark/mark';
import { Http, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Rx';
import { GoogleAnalyticsService } from '../../app/services/analytics.service';
import { Storage } from '@ionic/storage';
import { LANGUAGE_KEY } from '../../app/app.constants';
import { FavoritesPage } from '../favorites/favorites';
import { FavoritesService } from '../../app/services/favorites.service';
 
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  _seconds: number;
  _minutes: number;
  _hours: number;
  _days: number;
  _diff: number;
  subscription: Subscription;
  _dateNow: Date;
  _VDate: Date;
  _regDay:Date;
  dayValue: string;
  private isLeaving: boolean = false;
  myNews = [];
  hideCountdown: boolean = false;
  private toastReload: Toast;
  constructor(public navCtrl: NavController,
    private loadingController: LoadingController,
    private toastCtrl: ToastController,
    private http: Http,
    private gaSvc:GoogleAnalyticsService,
    private storage:Storage,
    private favCtrl:FavoritesService) {
      this.getNews();

  }
  ionViewDidEnter() {
    this.gaSvc.gaTrackPageEnter('Home Page');
    this._VDate = new Date("2019-04-23T00:00:00+08:00");
    this._regDay= new Date("2019-04-22T00:00:00+08:00");
    this._dateNow = new Date();
    if (this._dateNow >= this._regDay) {
      this.hideCountdown = true;
      this.checkDateValue();
      this.subscription.unsubscribe();
    }
    else
      this.countDown();
    
  }
  checkDateValue() {
    if (this._dateNow.getMonth() + 1 === 4 && this._dateNow.getDate() === 22) {
      this.dayValue = "Registration"
    } else if (this._dateNow.getMonth() + 1 === 4 && this._dateNow.getDate() === 23) {
      this.dayValue = "1"
    } else if (this._dateNow.getMonth() + 1 === 4 && this._dateNow.getDate() === 24) {
      this.dayValue = "2"
    } else if (this._dateNow.getMonth() + 1 === 4 && this._dateNow.getDate() === 25) {
      this.dayValue = "3"
    } else if (this._dateNow.getMonth() + 1 === 4 && this._dateNow.getDate() === 26) {
      this.dayValue = "4"
    } else if (this._dateNow.getMonth() + 1 === 4 && this._dateNow.getDate() === 27) {
      this.dayValue = "5"
    } else {
      this.dayValue = " ";
    }
  }
  ionViewDidLeave() {
    this.isLeaving = true;
    if (this.toastReload)
      this.toastReload.dismiss();
  }
  GoToDownloads() {
    this.navCtrl.setRoot(DownloadsPage);
  }
  GoToNews(id: String) {
    this.navCtrl.push(NewslandingPage, {
      id: id
    });;
  }
  GoToOne() {
    this.navCtrl.setRoot(FavoritesPage);
  }
  GoToMark() {
    this.navCtrl.setRoot(MarkPage);
  }
  getNews() {
    this.myNews = [];
    let loadingPopup = this.loadingController.create({
      content: 'Verifying...'
    });
    loadingPopup.present();
    this.storage.get(LANGUAGE_KEY).then(lang=>{
      let body = new URLSearchParams();
      body.set('action', 'getNews');
      body.set('count', '4');
      body.set('tag', 'V-Malaysia 2019');
      body.set('language', lang);
  
      let options = new RequestOptions({
        headers: new Headers({
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      });
      this.http.post('http://bt.the-v.net/service/api.aspx', body, options)
        .timeout(20000)
        .subscribe(response => {
          try {
            //TODO: Map fave if added
            let proms = response.json().map(e=>{
              return this.favCtrl.checkIfFave(e.Id, 'News').then(val=>{
                e.fave = val;
                return e;
              })
           })
           Promise.all(proms).then(val=>{
            this.setValue(val);
            //TODO: Map selected if favorite or not
            console.log(val);
           })
            loadingPopup.dismiss();
          } catch (e) {
            
            let toast = this.toastCtrl.create({
              message: 'Something went wrong! Reload and Try again.',
              position: 'bottom',
              showCloseButton: true,
              closeButtonText: 'Reload'
            });
            toast.onDidDismiss(() => {
              if (!this.isLeaving)
                this.getNews();
            })
            toast.present();
            this.toastReload = toast;
            loadingPopup.dismiss();
          }
        }, e => {
          let toast = this.toastCtrl.create({
            message: 'Something went wrong! Reload and Try again.',
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'Reload'
          });
          toast.onDidDismiss(() => {
            if (!this.isLeaving)
              this.getNews();
          })
          toast.present();
          this.toastReload = toast;
          loadingPopup.dismiss();
        }, () => {
        });
    })
  }


  countDown() {
    this.subscription = Observable.interval(1000)
      .subscribe((x) => {
        this._diff = this._VDate.getTime() - new Date().getTime();
        if (this._diff < 0) {
          this.subscription.unsubscribe();
        }
        else {
          this._days = this.getDays(this._diff);
          this._hours = this.getHours(this._diff);
          this._minutes = this.getMinutes(this._diff);
          this._seconds = this.getSeconds(this._diff);
        }
      });
  }
  getDays(t) {
    return Math.floor(t / (1000 * 60 * 60 * 24));
  }

  getHours(t) {
    return Math.floor((t / (1000 * 60 * 60)) % 24);
  }

  getMinutes(t) {
    return Math.floor((t / 1000 / 60) % 60);
  }

  getSeconds(t) {
    return Math.floor((t / 1000) % 60);
  }

  private setValue(value){
    this.myNews = value;
  }
  //TODO: Favorite feature
  addToFaves(item, index){
    this.favCtrl.addFavorite(item,'News').then(added=>{
      if(added){
        this.myNews[index].fave = added;
        //this.cd.markForCheck();
      }
    })
  }
  removeToFaves(item, index){
    this.favCtrl.removeFavorite(item, 'News').then(removed=>{
      if(removed){
        this.myNews[index].fave = !removed;
      }
    })
  }
}
