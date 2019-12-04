import { Geofence } from '@ionic-native/geofence';
import { Storage } from '@ionic/storage';
import { Injectable } from "@angular/core";
import { AndroidPermissions } from "@ionic-native/android-permissions";
import { AlertController } from "ionic-angular";
import { Subscription } from "rxjs/Subscription";
import { Subject } from "rxjs/Subject";

@Injectable()
export class GeofenceService {
    observable: Subject<any>;
    observer: any;
    fromFence: { id: string; latitude: number; longitude: number; radius: number; transitionType: number; };
    intoFence: { id: string; latitude: number; longitude: number; radius: number; transitionType: number; notification: { id: number; title: string; text: string; openAppOnClick: boolean; }; };

    public static EVT_LOC_STATE = 'EVT_LOC_STATE';
    private static EVT_GEOFENCE_ID_IN = '69ca1b88-6fbe-4e80-a4d4-ff4d3748acdb';
    private static EVT_GEOFENCE_ID_OUT = '69ca1b88-6fbe-4e80-a4d4-ff4d3748acdc';

    constructor(
        private geofence: Geofence,
        private storage: Storage,
        private androidPermissions: AndroidPermissions,
        private alertCtrl: AlertController
    ) {
        this.intoFence = {
            id: GeofenceService.EVT_GEOFENCE_ID_IN,
            latitude: 5.328349,
            longitude: 100.280827,
            radius: 5000,
            transitionType: 1,
            notification: {
                id: 1,
                title: 'V-MALAYSIA #VMALAYSIA19',
                text: `You can now view the schedule of the event!`,
                openAppOnClick: true
            }
        }
        this.fromFence = {
            id: GeofenceService.EVT_GEOFENCE_ID_OUT,
            latitude: 5.328349,
            longitude: 100.280827,
            radius: 5000,
            transitionType: 2
        }

        this.observable = new Subject();
    }

    canViewSchedule(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.storage.get(GeofenceService.EVT_LOC_STATE).then(state => {
                resolve(state);
            }).catch(e => {
                reject(e);
            });
        });
    }

    setupEventGeofence() {
        this.storage.set(GeofenceService.EVT_LOC_STATE, {
            canViewSchedule: false,
            shouldTurnOnLocationServices: false,
            hasErrorInInitialization: false
        });

        this.initEventGeofence();

        this.geofence.initialize().then(() => {
            this.updateEventGeofence();
        }).catch(e => {
            this.storage.get(GeofenceService.EVT_LOC_STATE).then(s => {
                s.shouldTurnOnLocationServices = true;
                s.hasErrorInInitialization = true;
                this.storage.set(GeofenceService.EVT_LOC_STATE, s);
            });
        });
    }

    updateEventGeofence(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.geofence.addOrUpdate([this.intoFence, this.fromFence]).then(() => {
                this.storage.get(GeofenceService.EVT_LOC_STATE).then(s => {
                    s.shouldTurnOnLocationServices = false;
                    s.hasErrorInInitialization = false;
                    this.storage.set(GeofenceService.EVT_LOC_STATE, s).then(() => {
                        resolve();
                    });
                });
            }).catch(e => {
                this.storage.get(GeofenceService.EVT_LOC_STATE).then(s => {
                    s.shouldTurnOnLocationServices = e.code === 'PERMISSION_DENIED';
                    s.hasErrorInInitialization = true;
                    this.storage.set(GeofenceService.EVT_LOC_STATE, s).then(() => {
                        if (e.code === 'PERMISSION_DENIED') {
                            this.requestLocationPermission();
                        } else {
                            let alert = this.alertCtrl.create({
                                title: 'Cannot enable geofencing',
                                subTitle: 'You will not be able to see the event\'s schedule. Cannot initialize geofencing without errors.',
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
                            reject();
                        }
                    });
                });
            });
        });
    }

    subscribeToTransition(callback: (any) => void): Subscription {
        return this.observable.subscribe(g => {
            callback(g);
        });
    }

    private initEventGeofence() {
        this.geofence.onTransitionReceived().subscribe(g => {
            for (var i = 0; i < g.length; i++) {
                switch (g[i].id) {
                    case GeofenceService.EVT_GEOFENCE_ID_IN:
                        this.storage.get(GeofenceService.EVT_LOC_STATE).then(s => {
                            s.canViewSchedule = true;
                            this.storage.set(GeofenceService.EVT_LOC_STATE, s).then(s => {
                                this.observable.next(s);
                            }).catch(s => {
                                this.observable.error(s);
                            });
                        });
                        break;
                    case GeofenceService.EVT_GEOFENCE_ID_OUT:
                        this.storage.get(GeofenceService.EVT_LOC_STATE).then(s => {
                            s.canViewSchedule = false;
                            this.storage.set(GeofenceService.EVT_LOC_STATE, s).then(s => {
                                this.observable.next(s);
                            }).catch(s => {
                                this.observable.error(s);
                            });
                        });
                        break;
                }
            }
        });
    }

    requestLocationPermission() {
        this.androidPermissions.requestPermissions([
            this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
            this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
        ]).then(a => {
            if (!a.hasPermission) {
                let alert = this.alertCtrl.create({
                    title: 'Permission not allowed',
                    subTitle: 'You will not be able to see the event\'s schedule without enabling your location services.',
                    buttons: [{
                        text: 'Ok',
                        handler: () => {
                            alert.dismiss();
                            return false;
                        }
                    }, {
                        text: 'Enable',
                        handler: () => {
                            alert.dismiss();
                            this.requestLocationPermission();
                            return false;
                        }
                    }],
                    cssClass: 'alert'
                });
                alert.present();
            } else {
                this.setupEventGeofence();
            }
        });
    }
}