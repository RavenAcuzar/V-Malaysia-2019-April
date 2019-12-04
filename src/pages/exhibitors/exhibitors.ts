import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Toast } from 'ionic-angular';
import { Http, URLSearchParams, RequestOptions, Headers } from '@angular/http';
import { ExhibitorsLandingPage } from '../exhibitors-landing/exhibitors-landing';
import { FavoritesService } from '../../app/services/favorites.service';
import { Storage } from '@ionic/storage';
import { LANGUAGE_KEY } from '../../app/app.constants';

/**
 * Generated class for the ExhibitorsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-exhibitors',
  templateUrl: 'exhibitors.html',
})
export class ExhibitorsPage {
  ex: any[];
  toastReload: Toast;
  private isLeaving: boolean = false;
  fave = true;
  currentLang;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private http: Http, private toastCtrl: ToastController,
    private loadingController: LoadingController, private favCtrl:FavoritesService,
    private cd:ChangeDetectorRef, storage:Storage) {
      storage.get(LANGUAGE_KEY).then(lang=>{
        this.currentLang = lang;
      })
  }

  ionViewDidLoad() {
    this.loadExhibitors();
  }
  ionViewDidLeave() {
    this.isLeaving = true;
    if (this.toastReload)
      this.toastReload.dismiss();
  }
  goToEx(id) {
    this.navCtrl.push(ExhibitorsLandingPage, { id: id });
  }
  loadExhibitors() {
    this.ex = [];
    let loadingPopup = this.loadingController.create({
      content: 'Verifying...'
    });
    loadingPopup.present();
    let body = new URLSearchParams();
    body.set('action', 'VConExhibitors');
    body.set('event', 'V-Malaysia 2019');

    let options = new RequestOptions({
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    });
    this.http.post('http://bt.the-v.net/service/api.aspx', body, options)
      .timeout(20000)
      .subscribe(response => {
        try {
          let proms = response.json().map(e=>{
            return this.favCtrl.checkIfFave(e.Id, 'Exhibitor').then(val=>{
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
              this.loadExhibitors();
          })
          toast.present();
          this.toastReload = toast;
          loadingPopup.dismiss();
          console.log(response.json());
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
            this.loadExhibitors();
        })
        toast.present();
        this.toastReload = toast;
        loadingPopup.dismiss();
      }, () => {
      });
  }
  private setValue(value){
    this.ex = value;
  }
  //TODO: Favorite feature
  addToFaves(item, index){
    this.favCtrl.addFavorite(item,'Exhibitor').then(added=>{
      if(added){
        this.ex[index].fave = added;
        //this.cd.markForCheck();
      }
    })
  }
  removeToFaves(item, index){
    this.favCtrl.removeFavorite(item, 'Exhibitor').then(removed=>{
      if(removed){
        this.ex[index].fave = !removed;
      }
    })
  }

}
