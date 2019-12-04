import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, Menu } from 'ionic-angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Push } from '@ionic-native/push';
import { SQLite } from "@ionic-native/sqlite";
import "froala-editor/js/froala_editor.pkgd.min.js";
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { FaqsPage } from '../pages/faqs/faqs';
import { ContactPage } from '../pages/contact/contact';
import { DownloadsPage } from '../pages/downloads/downloads';
import { ChangeLangPage } from '../pages/change-lang/change-lang';
import { NewsAndUpdatesPage } from '../pages/news-and-updates/news-and-updates';
import { NewslandingPage } from '../pages/newslanding/newslanding';
import { MarkPage } from '../pages/mark/mark';
import { SchedPage } from '../pages/sched/sched';
import { MerchPage } from '../pages/merch/merch';
import { SplashNextPage } from '../pages/splash-next/splash-next';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpModule } from '@angular/http';
import { File } from "@ionic-native/file";
import { FileTransfer } from "@ionic-native/file-transfer";
import { AndroidPermissions } from "@ionic-native/android-permissions";
import { Base64ToGallery } from "@ionic-native/base64-to-gallery";
import { SocialSharing } from "@ionic-native/social-sharing";
import { Camera } from "@ionic-native/camera";
import { Crop } from "@ionic-native/crop";
import { PhotoLibrary } from "@ionic-native/photo-library";
import { Geofence } from '@ionic-native/geofence';
import { GeofenceService } from './services/geofence.service';
import { IonicStorageModule } from '@ionic/storage';
import { Network } from '@ionic-native/network';
import { ConnectionService } from './services/connection.service';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { GoogleAnalyticsService } from './services/analytics.service';
import { AskDatoPage } from '../pages/ask-dato/ask-dato';
import { SurveyPage } from '../pages/survey/survey';
import { FavoritesPage } from '../pages/favorites/favorites';
import { NotesLandingPage } from '../pages/notes-landing/notes-landing';
import { FeedPage } from '../pages/feed/feed';
import { FeedLandingPage } from '../pages/feed-landing/feed-landing';
import { NotesPage } from '../pages/notes/notes';
import { ExhibitorsPage } from '../pages/exhibitors/exhibitors';
import { ExhibitorsLandingPage } from '../pages/exhibitors-landing/exhibitors-landing';
import { NotesService } from './services/notes.service';
import { FavoritesService } from './services/favorites.service';
import { FeedPostingPage } from '../pages/feed-posting/feed-posting';
import { FeedService } from './services/feed.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    FaqsPage,
    ContactPage,
    DownloadsPage,
    ChangeLangPage,
    NewsAndUpdatesPage,
    NewslandingPage,
    MarkPage,
    SchedPage,
    MerchPage,
    SplashNextPage,
    AskDatoPage,
    SurveyPage,
    FavoritesPage,
    NotesLandingPage,
    FeedPage,
    FeedLandingPage,
    NotesPage,
    ExhibitorsPage,
    ExhibitorsLandingPage,
    FeedPostingPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    IonicModule.forRoot(MyApp, {navExitApp:false}),
    IonicStorageModule.forRoot(),
    FroalaEditorModule.forRoot(), 
    FroalaViewModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
  })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    FaqsPage,
    ContactPage,
    DownloadsPage,
    ChangeLangPage,
    NewsAndUpdatesPage,
    NewslandingPage,
    MarkPage,
    SchedPage,
    MerchPage,
    SplashNextPage,
    AskDatoPage,
    SurveyPage,
    FavoritesPage,
    NotesLandingPage,
    FeedPage,
    FeedLandingPage,
    NotesPage,
    ExhibitorsPage,
    ExhibitorsLandingPage,
    FeedPostingPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Base64ToGallery, File, FileTransfer, AndroidPermissions,
    PhotoLibrary, Crop, Camera, SocialSharing, Geofence, GeofenceService, 
    Network,ConnectionService, Push, SQLite, GoogleAnalyticsService,GoogleAnalytics, NotesService, FavoritesService,
    FeedService
    
  ]
})
export class AppModule {}
