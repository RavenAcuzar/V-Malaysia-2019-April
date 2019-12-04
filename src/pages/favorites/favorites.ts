import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController, Toast } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FavoritesService } from '../../app/services/favorites.service';
import { Http } from '@angular/http';
import { MERCH_FAVES, ASK_DATO_DETAILS } from '../../app/app.constants';
import { ExhibitorsLandingPage } from '../exhibitors-landing/exhibitors-landing';
import { NewslandingPage } from '../newslanding/newslanding';
import { FeedLandingPage } from '../feed-landing/feed-landing';
import { FeedService } from '../../app/services/feed.service';

/**
 * Generated class for the FavoritesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-favorites',
  templateUrl: 'favorites.html',
})
export class FavoritesPage {
  section = "news";
  newsFaves = [];
  merchFaves = [];
  exhiFaves = [];
  feedFaves = [];
  private isLeaving: boolean = false;
  toastReload: Toast;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage, private faveSvc: FavoritesService,
    private loadingCtrl: LoadingController, private feedSvc: FeedService, private toastCtrl: ToastController) {
  }
  ionViewDidLeave() {
    this.isLeaving = true;
    if (this.toastReload)
      this.toastReload.dismiss();
  }
  ionViewDidLoad() {
    this.loadFaves();
  }
  //goToNewslanding
  GoToNews(id: String) {
    this.navCtrl.push(NewslandingPage, {
      id: id
    });;
  }
  //gotToExhibitorsLanding
  goToExi(id) {
    this.navCtrl.push(ExhibitorsLandingPage, { id: id });
  }
  //remove to favorites
  removeFavorite(item, itemType) {
    this.faveSvc.removeFavorite(item, itemType).then(rem => {
      console.log(rem);
      //reload view
      if (rem) {
        switch (itemType) {
          case 'Merch':
            this.storage.get(MERCH_FAVES).then(m => { this.merchFaves = m });
            break;
          case 'News':
            this.faveSvc.loadFaves(itemType).then(n => { this.newsFaves = n });
            break;
          case 'Exhibitor':
            this.faveSvc.loadFaves(itemType).then(e => { this.exhiFaves = e });
            break;
          case 'Feed':
            this.faveSvc.loadFaves('Feed').then(feed => {
              let prom = feed.map(e => {
                return this.faveSvc.checkIfLike(e.Id, e.irid).then(liked => {
                  e.isLiked = liked;
                  return e;
                })
              })
              Promise.all(prom).then(favFeeds => {
                this.setValue(favFeeds);
              })
            })
            break;
          default:
            console.log("WEIRD!");
        }
      }
    })
  }
  goToFeed(id) {
    this.storage.get(ASK_DATO_DETAILS).then(details => {
      let perm;
      if (details)
        perm = true;
      else perm = false;
      this.navCtrl.push(FeedLandingPage, { id: id, details: details, permited: perm });
    })

  }
  //load favorites
  loadFaves() {
    let loadingPopup = this.loadingCtrl.create({
    });
    loadingPopup.present();
    this.storage.get(MERCH_FAVES).then(merch => {
      this.merchFaves = merch;
      this.faveSvc.loadFaves('News').then(news => {
        this.newsFaves = news;
        this.faveSvc.loadFaves('Exhibitor').then(exhi => {
          this.exhiFaves = exhi;
          this.faveSvc.loadFaves('Feed').then(feed => {
            let prom = feed.map(e => {
              return this.faveSvc.checkIfLike(e.Id, e.irid).then(liked => {
                e.isLiked = liked;
                console.log(liked);
                return e;
              })
            })
            Promise.all(prom).then(favFeeds => {
              this.setValue(favFeeds);
              console.log(this.feedFaves);
              loadingPopup.dismiss();
            }).catch(() => {
              let toast = this.toastCtrl.create({
                message: 'Something went wrong! Reload and Try again.',
                position: 'bottom',
                showCloseButton: true,
                closeButtonText: 'Reload'
              });
              toast.onDidDismiss(() => {
                if (!this.isLeaving)
                  this.loadFaves();
              })
              toast.present();
              this.toastReload = toast;
              loadingPopup.dismiss();
            })
          }).catch(() => {
            let toast = this.toastCtrl.create({
              message: 'Something went wrong! Reload and Try again.',
              position: 'bottom',
              showCloseButton: true,
              closeButtonText: 'Reload'
            });
            toast.onDidDismiss(() => {
              if (!this.isLeaving)
                this.loadFaves();
            })
            toast.present();
            this.toastReload = toast;
            loadingPopup.dismiss();
          })
        }).catch(() => {
          let toast = this.toastCtrl.create({
            message: 'Something went wrong! Reload and Try again.',
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'Reload'
          });
          toast.onDidDismiss(() => {
            if (!this.isLeaving)
              this.loadFaves();
          })
          toast.present();
          this.toastReload = toast;
          loadingPopup.dismiss();
        })
      }).catch(() => {
        let toast = this.toastCtrl.create({
          message: 'Something went wrong! Reload and Try again.',
          position: 'bottom',
          showCloseButton: true,
          closeButtonText: 'Reload'
        });
        toast.onDidDismiss(() => {
          if (!this.isLeaving)
            this.loadFaves();
        })
        toast.present();
        this.toastReload = toast;
        loadingPopup.dismiss();
      })
    }).catch(() => {
      let toast = this.toastCtrl.create({
        message: 'Something went wrong! Reload and Try again.',
        position: 'bottom',
        showCloseButton: true,
        closeButtonText: 'Reload'
      });
      toast.onDidDismiss(() => {
        if (!this.isLeaving)
          this.loadFaves();
      })
      toast.present();
      this.toastReload = toast;
      loadingPopup.dismiss();
    })
  }
  private setValue(value) {
    this.feedFaves = value;
  }
  addRemoveLike(id, irid, index, type) {
    if (type == "like") {
      let l = parseInt(this.feedFaves[index].likes) + 1;
      this.feedFaves[index].likes = l.toString();
      this.feedFaves[index].isLiked = true;
      this.feedSvc.addToLike(id, irid, type).then(res => {
        console.log(res);
      })
    } else {
      let l = parseInt(this.feedFaves[index].likes) - 1;
      this.feedFaves[index].likes = l.toString();
      this.feedFaves[index].isLiked = false;
      this.feedSvc.addToLike(id, irid, type).then(res => {
        console.log(res);
      })
    }
  }

}
