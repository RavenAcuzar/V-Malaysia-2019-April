import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, LoadingController, ToastController, Toast, DeepLinkMetadata } from 'ionic-angular';
import { FeedPostingPage } from '../feed-posting/feed-posting';
import { Storage } from '@ionic/storage';
import { ASK_DATO_DETAILS, LANGUAGE_KEY, INITIAL_DATE_LOAD } from '../../app/app.constants';
import { HomePage } from '../home/home';
import { FeedLandingPage } from '../feed-landing/feed-landing';
import { FeedService } from '../../app/services/feed.service';
import { FavoritesService } from '../../app/services/favorites.service';

/**
 * Generated class for the FeedPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
})

export class FeedPage {
  isRtl = "ltr"
  slide: { url: string; }[];
  details = { name: "", irid: "", email: "" };
  toastReload: Toast;
  hasProfile: boolean;
  end = 1;
  feeds = [];
  private isLeaving: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage, private alertCtrl: AlertController, private feedSvc: FeedService,
    private toastCtrl: ToastController, private loadingController: LoadingController,
    private faveSvc: FavoritesService, private alertCrl: AlertController) {
    this.slide = [{ url: "./assets/imgs/MZC_8893.JPG" },
    { url: "./assets/imgs/MZC_8893.JPG" },
    { url: "./assets/imgs/MZC_8893.JPG" }
    ];
    this.storage.get(LANGUAGE_KEY).then(lang => {
      if (lang == "ar") {
        this.isRtl = "rtl";
      }
      else {
        this.isRtl = "ltr";
      }
    })
  }
  ionViewDidLeave() {
    this.isLeaving = true;
    if (this.toastReload)
      this.toastReload.dismiss();
  }

  ionViewWillEnter() {
    let loadingPopup = this.loadingController.create();
    loadingPopup.present();
    this.storage.set(INITIAL_DATE_LOAD, new Date().toLocaleString("en-US"));//get date in initial load
    this.checkInfo();
    this.loadFeed(this.end,loadingPopup);
    if (this.navParams.get('showError')) {
      let alert = this.alertCrl.create({
        title: "Error Sharing Post!",
        message: "Something went wrong while posting! Please try again.",
        buttons: [
          {
            text: "Okay",
            role: 'cancel'
          }
        ]
      })
      alert.present();
    }
  }
  public loadFeed(page, loadingPopup?) {
    return this.storage.get(INITIAL_DATE_LOAD).then(d => { //load date value from initial load to prvent overlap with paging
      console.log(d);
      return this.feedSvc.loadFeed(d,page).then(feedArry => {
        console.log(feedArry);
        if (feedArry.length > 0) {
          let proms = feedArry.map(e => {
            return this.faveSvc.checkIfFave(e.Id, 'Feed').then(val => {
              e.fave = val;
              console.log(val);
              return this.faveSvc.checkIfLike(e.Id, e.irid).then(liked => {
                e.isLiked = liked;
                console.log(liked);
                return e;
              })
            })
          })
          Promise.all(proms).then(val => {
            this.setValue(val);
            //TODO: Map selected if favorite or not
            loadingPopup.dismiss();
            //console.log(val);
          })
        }
        else if(loadingPopup){
          let toast = this.toastCtrl.create({
            message: 'Something went wrong! Reload and Try again.',
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'Reload'
          });
          toast.onDidDismiss(() => {
            if (!this.isLeaving)
              this.loadFeed(page);
          })
          toast.present();
          this.toastReload = toast;
          loadingPopup.dismiss();
        }
      }).catch(() => {
        let toast = this.toastCtrl.create({
          message: 'Something went wrong! Reload and Try again.',
          position: 'bottom',
          showCloseButton: true,
          closeButtonText: 'Reload'
        });
        toast.onDidDismiss(() => {
          if (!this.isLeaving)
            this.loadFeed(page);
        })
        toast.present();
        this.toastReload = toast;
        loadingPopup.dismiss();
      })
    })
  }
  reEnter() {
    this.storage.set(ASK_DATO_DETAILS, null).then(() => {
      this.checkInfo();
    });
  }
  private infoAlert() {
    let alert = this.alertCtrl.create({
      title: 'Input Your Info',
      message: 'Please input your info to like/comment/post.',
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'name',
          placeholder: 'Name'
        },
        {
          name: 'irid',
          placeholder: 'IRID'
        },
        {
          name: 'email',
          placeholder: 'Email'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.hasProfile = false;
          }
        },
        {
          text: 'OK',
          handler: data => {
            if (data.name != '' && data.irid != '' && data.email != '') {
              this.details.irid = data.irid;
              this.details.email = data.email;
              this.details.name = data.name;
              console.log(this.details);
              this.storage.set(ASK_DATO_DETAILS, this.details);
              this.hasProfile = true;
            }
            else {
              return false;
            }
          }
        }
      ]
    });
    alert.present();
  }
  checkInfo() {
    this.storage.get(ASK_DATO_DETAILS).then(details => {
      if (!details) {
        this.hasProfile = false;
      }
      else {
        this.hasProfile = true;
        this.details.name = details.name;
        this.details.irid = details.irid;
        this.details.email = details.email;
      }
    })
  }
  goToPosting() {
    if (this.hasProfile) {
      this.navCtrl.push(FeedPostingPage, { details: this.details });
    }
    else {
      this.infoAlert();
    }
  }
  goToFeed(id) {
    this.navCtrl.push(FeedLandingPage, { id: id, details: this.details, permited: this.hasProfile });
  }
  //like()
  //unlike()
  //add to favorite()
  addToFavorite(feedObj, index) {
    this.faveSvc.addFavorite(feedObj, 'Feed').then(added => {
      if (added) {
        this.feeds[index].fave = true;
      }
    })
  }
  private setValue(value) {
    this.feeds = this.feeds.concat(value);
    
  }
  removeToFavorite(item, index) {
    this.faveSvc.removeFavorite(item, 'Feed').then(removed => {
      if (removed) {
        this.feeds[index].fave = !removed;
      }
    })
  }

  addRemoveLike(id, irid, index, type) {

    if (type == "like") {
      let l = parseInt(this.feeds[index].likes) + 1;
      this.feeds[index].likes = l.toString();
      this.feeds[index].isLiked = true;
      this.feedSvc.addToLike(id, irid, type).then(res => {
        console.log(res);
      });
      //console.log(this.feeds[index]);
    } else {
      let l = parseInt(this.feeds[index].likes) - 1;
      this.feeds[index].likes = l.toString();
      this.feeds[index].isLiked = false;
      this.feedSvc.addToLike(id, irid, type).then(res => {
        console.log(res);
      });
    }

  }

  doInfinite(infiniteScroll) {

    setTimeout(() => {
      this.end +=1;
      this.loadFeed(this.end).then(()=>{
        infiniteScroll.complete();
      });
    }, 800);
  }
}
