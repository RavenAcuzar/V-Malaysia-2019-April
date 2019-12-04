import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { NotesLandingPage } from '../notes-landing/notes-landing';
import { NotesService, NotesEntry } from '../../app/services/notes.service';
import { Storage } from '@ionic/storage';
import { LANGUAGE_KEY } from '../../app/app.constants';

/**
 * Generated class for the NotesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 
@Component({
  selector: 'page-notes',
  templateUrl: 'notes.html',
})
export class NotesPage {
  currentLang;
  notes:NotesEntry[] = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl:AlertController, public notesSvc:NotesService, private loadingCtrl:LoadingController,
    storage:Storage) {
      storage.get(LANGUAGE_KEY).then(lang=>{
        this.currentLang = lang;
      })
  }

  ionViewWillEnter(){
    this.loadAllNotes();
  }
  addNote(){
    let alert = this.alertCtrl.create({
      title: 'Note Title',
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'title',
          placeholder: 'Title'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: data => {
            if (data.title != '') {
              this.navCtrl.push(NotesLandingPage,{title:data.title});
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
  editNote(id){
    this.navCtrl.push(NotesLandingPage,{id:id});
  }
  loadAllNotes(){
    console.log("LOAD NOTES!");
    let loading = this.loadingCtrl.create({
      spinner: "crescent",
      enableBackdropDismiss: true
    });
    loading.present();
    this.notesSvc.getPreviousNotes().then(n=>{
      this.notes = n;
      loading.dismiss();
    }).catch(()=>{
      loading.dismiss();
    })
  }

}
