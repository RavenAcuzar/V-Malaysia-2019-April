import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController, Toast } from 'ionic-angular';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';

/**
 * Generated class for the ExhibitorsLandingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 
@Component({
  selector: 'page-exhibitors-landing',
  templateUrl: 'exhibitors-landing.html',
})
export class ExhibitorsLandingPage {
  id=null;
  exi={};
  private isLeaving: boolean= false;
toastReload:Toast;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private http:Http, private loadingController:LoadingController, private toastCtrl:ToastController) {
      this.getExhibitor();
  }
//getSingleExhibitor
  ionViewDidLoad() {
    console.log('ionViewDidLoad ExhibitorsLandingPage');
  }
  ionViewDidLeave(){ 
    this.isLeaving=true;
    if (this.toastReload)
      this.toastReload.dismiss();
  }
  getExhibitor(){
    this.id=null;
    this.exi={};
    this.id = this.navParams.get('id');

    let loadingPopup = this.loadingController.create({
      content: 'Verifying...'
    });
    loadingPopup.present();

    let body = new URLSearchParams();
    body.set('action', 'getSingleExhibitor');
    body.set('URL', encodeURIComponent(this.id));

    let options = new RequestOptions({
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*'
      })
    });

    this.http.post('http://bt.the-v.net/service/api.aspx', body)
      .subscribe(response => {
        this.exi = response.json()[0];
      }, e=>{
        let toast = this.toastCtrl.create({
              message: 'Something went wrong! Reload and Try again.',
              position: 'bottom',
              showCloseButton: true,
              closeButtonText: 'Reload'
            });
            toast.onDidDismiss(()=>{
              if(!this.isLeaving)
                this.getExhibitor();
            })
            toast.present();
            this.toastReload=toast;
          loadingPopup.dismiss();
      }, () => {
        loadingPopup.dismiss();
      });
  }

}
