import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { Http, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import { Storage } from '@ionic/storage';
import { ASK_DATO_DETAILS } from '../../app/app.constants';
import { TranslateService } from '../../../node_modules/@ngx-translate/core';

/**
 * Generated class for the AskDatoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-ask-dato',
  templateUrl: 'ask-dato.html',
})
export class AskDatoPage {
  noAnswer: boolean = true;
  showQuestion: boolean = true;
  details = { name:"",irid: "", email: "" };
  question;
  options;
  viewContent: boolean = false;
  api_url = "http://bt.the-v.net/service/api.aspx";
  submittedQ = {};
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private http: Http,
    private loadCtrl: LoadingController,
    private storage: Storage,
    private translateSvc:TranslateService) {
    this.options = new RequestOptions({
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    });
  }
  reEnter() {
    this.storage.set(ASK_DATO_DETAILS, null).then(() => {
      this.navCtrl.setRoot(this.navCtrl.getActive().component);
    })
  }

  ionViewDidLoad() { 
    this.storage.get(ASK_DATO_DETAILS).then(details => {
      if (!details) { 
        let alert = this.alertCtrl.create({
          title: 'Input Your Info',
          message: 'Please input your info to submit or view your question.',
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
              handler: data => {
                this.navCtrl.setRoot(HomePage);
              }
            },
            {
              text: 'OK',
              handler: data => {
                if (data.name !='' && data.irid != '' && data.email != '') {
                  this.details.irid = data.irid;
                  this.details.email = data.email;
                  this.details.name = data.name;
                  console.log(this.details);
                  this.storage.set(ASK_DATO_DETAILS, this.details).then(() => {
                    this.loadQuestion();
                  })
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
      else {
        this.details.irid = details.irid;
        this.details.email = details.email;
        this.loadQuestion();
      }
    })
  }
  loadQuestion() {
    let load: any = this.loadCtrl.create({
      spinner: "crescent",
      content: "Loading...",
      enableBackdropDismiss: true
    });
    load.present();
    let body = new URLSearchParams();
    body.set('action', 'VCONAskDatoLoadQuestion');
    body.set('irid', this.details.irid);
    body.set('email', this.details.email);
    this.http.post(this.api_url, body, this.options)
      .subscribe(resp => {
        console.log(resp);
        if (resp.json().length > 0) {
          this.submittedQ = resp.json()[0];
          if (resp.json()[0].Status == "Answered") {
            this.noAnswer = false;
          }
          this.showQuestion = true;
        }
        else {
          this.showQuestion = false;
        }
      },
        error => {
          load.dismiss();
        },
        () => {
          load.dismiss();
          this.viewContent = true;
        })
  }
  submitQuestion() {
    if (this.question != null) {
      let q = this.stringFormater(this.question);
      let body = new URLSearchParams();
      body.set('action', 'VCONAskDatoSubmitQuestion');
      body.set('irid', this.details.irid);
      body.set('email', this.details.email);
      body.set('question', q);
      this.http.post(this.api_url, body, this.options)
        .subscribe(resp => {
          console.log(resp.text())
          if (resp.text() == "True") {
            this.viewContent = false;
            this.loadQuestion();
          } else {
            console.log("Error");
          }
        });
    }
  }
  private stringFormater(value: string) {
    return value.replace(/(?:\r\n|\r|\n)/g, '\n');
  }


}
