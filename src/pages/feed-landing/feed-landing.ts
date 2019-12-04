import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Toast, ToastController, LoadingController, TextInput } from 'ionic-angular';
import { FeedService } from '../../app/services/feed.service';
import { FavoritesService } from '../../app/services/favorites.service';
import { Storage } from '@ionic/storage';
import { LANGUAGE_KEY } from '../../app/app.constants';

/**
 * Generated class for the FeedLandingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-feed-landing',
  templateUrl: 'feed-landing.html',
})
export class FeedLandingPage {
  @ViewChild('content') content: any;
  @ViewChild('cInput') myInput;
  id = "";
  details: any = [];
  permited: boolean;
  feed: any = {};
  name;
  toastReload: Toast;
  message;
  isRtl = "ltr";
  private isLeaving: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private feedSvc: FeedService, private toastCtrl: ToastController, private loadingController: LoadingController,
    private faveSvc: FavoritesService, private storage: Storage) {
    this.id = this.navParams.get('id');
    this.details = this.navParams.get('details');
    this.permited = this.navParams.get('permited');
    this.storage.get(LANGUAGE_KEY).then(lang => {
      if (lang == "ar") {
        this.isRtl = "rtl";
      }
      else {
        this.isRtl = "ltr";
      }
    })
  }

  ionViewDidLoad() {
    this.loadFeed();
  }
  ionViewDidLeave() {
    this.isLeaving = true;
    if (this.toastReload)
      this.toastReload.dismiss();
  }
  loadFeed() {
    let loadingPopup = this.loadingController.create();
    loadingPopup.present();
    this.feedSvc.getSingleFeed(this.id).then(res => {
      if (res.length > 0) {
        let newRes = res.map(e => {
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
        Promise.all(newRes).then(val => {
          this.setValue(val[0]);
          //TODO: Map selected if favorite or not
          console.log(val);
        })
        this.setValue(res[0]);
        let sp = res[0].name.indexOf(" ");
        if (sp > 0)
          this.name = res[0].name.substring(0, sp) + "'s Post";
        else
          this.name = res[0].name + "'s Post";
        this.content.scrollToBottom(300);
        loadingPopup.dismiss();
      }
      else {
        let toast = this.toastCtrl.create({
          message: 'Something went wrong! Reload and Try again.',
          position: 'bottom',
          showCloseButton: true,
          closeButtonText: 'Reload'
        });
        toast.onDidDismiss(() => {
          if (!this.isLeaving)
            this.loadFeed();
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
          this.loadFeed();
      })
      toast.present();
      this.toastReload = toast;
      loadingPopup.dismiss();
    })
  }
  private setValue(value) {
    this.feed = value;
  }
  addToFavorite(feedObj) {
    this.faveSvc.addFavorite(feedObj, 'Feed').then(added => {
      if (added) {
        this.feed.fave = true;
      }
    })
  }
  removeToFavorite(item) {
    this.faveSvc.removeFavorite(item, 'Feed').then(removed => {
      if (removed) {
        this.feed.fave = !removed;
      }
    })
  }

  addRemoveLike(id, irid, type) {

    if (type == "like") {
      let l = parseInt(this.feed.likes) + 1;
      this.feed.likes = l.toString();
      this.feed.isLiked = true;
      this.feedSvc.addToLike(id, irid, type).then(res => {
        console.log(res);
      });
      //console.log(this.feed);
    } else {
      let l = parseInt(this.feed.likes) - 1;
      this.feed.likes = l.toString();
      this.feed.isLiked = false;
      this.feedSvc.addToLike(id, irid, type).then(res => {
        console.log(res);
      });
      //console.log(this.feed);
    }
  }
  sendMessage() {
    if (this.message != '') {
      let loadingPopup = this.loadingController.create();
      loadingPopup.present();
      this.feedSvc.submitComment(this.id, this.details, this.message).then(e => {
        if (e) {
          this.feed.comments.push({ name: this.details.name, comment: this.message });
          this.message = '';
          let c = parseInt(this.feed.commentsNum) + 1;
          this.feed.commentsNum = c.toString();
          loadingPopup.dismiss();
          loadingPopup.onDidDismiss(() => {
            this.content.scrollToBottom(300);
          })
        }
        else {
          console.warn("Error posting comment!");
          loadingPopup.dismiss();
        }
      })
    }
  }
  setfocus() {
    this.myInput.setFocus();
  }

}
