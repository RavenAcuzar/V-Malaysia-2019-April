import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Keyboard } from 'ionic-angular';
import { NotesService } from '../../app/services/notes.service';

/**
 * Generated class for the NotesLandingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 
@Component({
  selector: 'page-notes-landing',
  templateUrl: 'notes-landing.html',
})
export class NotesLandingPage {

  noteTitle:string;
  content:string;
  noteId:string;
  public options: Object = {
    placeholderText: 'Edit Your Content Here!',
    charCounterCount: false,
    toolbarButtons: ['bold', 'italic', 'underline',  'specialCharacters','|', 'fontFamily', 'fontSize', 'inlineClass','-','paragraphFormat', 'align', 'formatOL', 'formatUL','|', 'undo', 'redo'],
    toolbarButtonsXS: ['bold', 'italic', 'underline', 'specialCharacters','|', 'fontFamily', 'fontSize', 'inlineClass','-','paragraphFormat', 'align', 'formatOL', 'formatUL','|', 'undo', 'redo'],
    toolbarButtonsSM: ['bold', 'italic', 'underline', 'specialCharacters','|', 'fontFamily', 'fontSize', 'inlineClass','-','paragraphFormat', 'align', 'formatOL', 'formatUL','|', 'undo', 'redo'],
    toolbarButtonsMD: ['bold', 'italic', 'underline', 'specialCharacters','|', 'fontFamily', 'fontSize', 'inlineClass','-','paragraphFormat', 'align', 'formatOL', 'formatUL','|', 'undo', 'redo']
}
  constructor(public navCtrl: NavController, public navParams: NavParams, private notesScv:NotesService) {
    if(this.navParams.get('title')){
      //new note
      this.noteTitle = this.navParams.get('title');
    } else if(this.navParams.get('id')){
      //edit note
      this.noteId=this.navParams.get('id');
      this.notesScv.getPreviousNotes(this.navParams.get('id')).then(note=>{
        console.log(note[0]);
        this.content = note[0].message;
        this.noteTitle = note[0].title;
      });
    }
  }
  ionViewWillLeave(){
    this.saveNote()
  }
  saveNote(){
    if(this.noteId){
      this.notesScv.saveNote(this.noteTitle,this.content,this.noteId).then(()=>{
        this.navCtrl.pop();
      })
    }
    else{
    this.notesScv.saveNote(this.noteTitle,this.content).then(()=>{
      this.navCtrl.pop();
    })
  }
  }
  noteDelete(id){
    this.notesScv.deleteNote(id).then(()=>{
      this.navCtrl.pop();
    })
  }
}
