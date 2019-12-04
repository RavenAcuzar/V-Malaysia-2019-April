import { Component } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, LoadingController } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { GoogleAnalyticsService } from '../../app/services/analytics.service';

/**
 * Generated class for the DownloadsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-downloads',
  templateUrl: 'downloads.html',
})
export class DownloadsPage {
  downloadLocation: string = '';
  canDownload: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private file: File,
    private base64ToGallery: Base64ToGallery,
    private androidPermissions: AndroidPermissions,
    private fileTransfer: FileTransfer,
    private platform: Platform,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private gaSvc:GoogleAnalyticsService) {
      if (this.platform.is('cordova')) {
        this.downloadLocation = this.file.cacheDirectory;
        this.canDownload = true;
      }
  }
 
  ionViewDidEnter() {
    this.gaSvc.gaTrackPageEnter('Download Wallpaper Page');
    if (this.platform.is('android')) {
      return this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(result => {
        if (result.hasPermission) {
          return true;
        } else {
          return this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(a => {
            if (!a.hasPermission) {
              let alert = this.alertCtrl.create({
                title: 'Permission not allowed',
                subTitle: 'You cannot access this app\'s feature without allowing the storage permission.',
                buttons: [{
                  text: 'Ok',
                  handler: () => {
                    alert.dismiss();
                    return false;
                  }
                }],
                cssClass: 'alertDanger'
              });
              alert.present();
            }
            return a.hasPermission;
          }).catch(e => {
            console.log(JSON.stringify(e));
            let alert = this.alertCtrl.create({
              title: 'Permission not allowed',
              subTitle: 'You cannot access this app\'s feature without allowing the storage permission.',
              buttons: [{
                text: 'Ok',
                handler: () => {
                  alert.dismiss();
                  return false;
                }
              }],
              cssClass: 'alertDanger'
            });
            alert.present();
            return false;
          });
        }
      }).catch(e => {
        return this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
      });
    } else {
      return true;
    }
  }

  downloadMobileWallpaper() {
    this.download("http://the-v.net/sites/default/files/images/vcon/1080x1920%28WallpaperMobile%29.png", 'mobile-wallpaper.png');
  }

  downloadTabletWallpaper() {
    this.download("http://the-v.net/sites/default/files/images/vcon/2084x2800%28WallpaperTablet%29.png", 'tablet-wallpaper.png');
  }

  download(url: string, filename: string) {
    if (!this.canDownload) {
      let alert = this.alertCtrl.create({
        title: 'Cannot download!',
        subTitle: 'Your platform is not supported.',
        buttons: [{
          text: 'Ok',
          handler: () => {
            alert.dismiss();
            return false;
          }
        }],
        cssClass: 'alertDanger'
      });
      alert.present();

    } else {
      let loadingPopup = this.loadingCtrl.create({
        content: 'Downloading...'
      });
      loadingPopup.present();
      const fileTransferObject = this.fileTransfer.create();
      let imagePath = this.downloadLocation + filename;
      fileTransferObject.download(url, imagePath, true).then((entry) => {
        entry.file((file) => {
          let image = new Image();
          image.onload = () => {
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');

            canvas.height = image.height;
            canvas.width = image.width;

            context.drawImage(image, 0, 0, image.width, image.height);
            this.base64ToGallery.base64ToGallery(canvas.toDataURL(), { prefix: '_img', mediaScanner:true  }).then(libraryItem => {
              loadingPopup.dismiss();
              canvas.remove();

              let alert = this.alertCtrl.create({
                title: 'Download successful!',
                subTitle: 'The wallpaper has now been downloaded to your photo library.',
                buttons: [{
                  text: 'Ok',
                  handler: () => {
                    alert.dismiss();
                    return false;
                  }
                }],
                cssClass: 'alert'
              });
              alert.present();
            }).catch(e => {
              loadingPopup.dismiss();
              this.onErrorWithWallpaperDownload(e);
            });
          };
          image.onerror = () => {
            let alert = this.alertCtrl.create({
              title: 'Cannot download!',
              subTitle: 'Something went wrong.',
              buttons: [{
                text: 'Ok',
                handler: () => {
                  alert.dismiss();
                  return false;
                }
              }],
              cssClass: 'alertDanger'
            });
            alert.present();
          };
          image.src = imagePath;
        }, e => {
          loadingPopup.dismiss();
          this.onErrorWithWallpaperDownload(e);
        });
      }).catch((error) => {
        loadingPopup.dismiss();
        let alert = this.alertCtrl.create({
          title: 'Error occurred!',
          subTitle: 'The wallpaper was not downloaded successfully. Please try again.',
          buttons: [{
            text: 'Ok',
            handler: () => {
              alert.dismiss();
              return false;
            }
          }],
          cssClass: 'alertDanger'
        });
        alert.present();
      });
    }
  }

  private onErrorWithWallpaperDownload(error) {
    let alert = this.alertCtrl.create({
      title: 'Error occurred!',
      subTitle: 'Cannot open the downloaded wallpaper. Please try again.',
      buttons: [{
        text: 'Ok',
        handler: () => {
          alert.dismiss();
          return false;
        }
      }],
      cssClass: 'alertDanger'
    });
    alert.present();
  };
}

