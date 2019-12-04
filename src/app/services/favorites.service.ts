import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, URLSearchParams } from "@angular/http";
import { Storage } from '@ionic/storage';
import { encodeObject, openSqliteDb } from "../app.utils";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { Observable } from "rxjs/Observable";
import { Subscriber } from "rxjs/Subscriber";
import { Subject } from "rxjs/Subject";
import { MERCH_FAVES } from "../app.constants";


@Injectable()
export class FavoritesService {
    options;
    temp:boolean;
    constructor(
        private http: Http,
        private storage: Storage,
        private sqlite: SQLite
    ) {
        this.options = new RequestOptions({
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
            })
        });
    }

    //check if item in faves
    checkIfFave(id, itemType){
            return this.prepareFavsTable().then(db => {
                return db.executeSql(`SELECT faveItemID FROM faves_vcon where faveItemID=? AND faveItemType=?`, [id,itemType]);
            }).then(a =>{
                if(a.rows.length>0){
                    return true;
                }else{
                    return false;
                }
            }).catch(e=>{
                console.log(e);
                return new Error;
            })
        
    }
    checkIfLike(id, irid){
        return this.prepareLikesTable().then(db => {
            return db.executeSql(`SELECT postId FROM likes_vcon where postId=? AND irid=?`, [id,irid]);
        }).then(a =>{
            if(a.rows.length>0){
                return true;
            }else{
                return false;
            }
        }).catch(e=>{
            console.log(e);
            return new Error;
        })
    }
    //load faves (http) for news and exhibitors only
    loadFaves(itemType) {
        return this.prepareFavsTable().then(db => {
            return db.executeSql(`SELECT faveItemID FROM faves_vcon where faveItemType=?`, [itemType]);
        }).then(a => {
            try {
                let ids = [];
                if(a.rows.length>0){
                for (let i = 0; i < a.rows.length; i++) {
                    let rawid = a.rows.item(i).faveItemID;
                    ids.push(rawid);
                    console.log(a.rows.item(i));
                }
                console.log(ids.toString());
                let body = new URLSearchParams();
                body.set('action', 'getFavorites');
                body.set('itemType', itemType);
                body.set('idList', ids.toString());
                return this.http.post('http://bt.the-v.net/service/api.aspx', body, this.options)
                .timeout(20000)
                .map(response=>{
                    console.log(response.json());
                    try{
                        return response.json();
                    }catch (e) {
                        return false;
                    }
                }).toPromise();
            }
            else{
                return JSON.parse("[]");
            }
            } catch (e) {
                throw new Error();
            }
        })
    }
    //add to faves
    addFavorite(item: any, itemType: string) {
        if (itemType == "Merch") {
            return this.storage.get(MERCH_FAVES).then(merchFaves => {
                merchFaves.push(item)
                this.storage.set(MERCH_FAVES, merchFaves);
                return true;
            })
        } else {
            return this.prepareFavsTable().then(db => {
                return db.executeSql(`INSERT INTO faves_vcon(faveItemID, faveItemType) VALUES(? , ?)`, [item.Id, itemType]);
            }).then(() => {
                return true;
            }).catch(e=>{
                console.log(e);
                return false;
            })
        }
    }
    likePost(item: any, irid: string) { 
            return this.prepareLikesTable().then(db => {
                return db.executeSql(`INSERT INTO likes_vcon(postId, irid) VALUES(? , ?)`, [item.Id, irid]);
            }).then(() => {
                return true;
            }).catch(e=>{
                console.log(e);
                return false;
            })
    }
    unlikePost(item:any,irid:string){
        return this.prepareLikesTable().then(db => {
            return db.executeSql(`DELETE FROM likes_vcon WHERE postId=? AND irid=?`, [item.Id, irid]);
        }).then(() => {
            return true;
        }).catch(e=>{
            console.log(e);
            return false;
        })
    }
    //remove to faves
    removeFavorite(item: any, itemType: string) {
        if (itemType == "Merch") {
            //item = merch title
            return this.storage.get(MERCH_FAVES).then(merchFaves => {
                //let index = merchFaves.indexOf(item);
                merchFaves = merchFaves.filter(m => m.title !== item.title);
                this.storage.set(MERCH_FAVES, merchFaves);
                return true;
            });
        }
        else {
            //item = news/exhibitor id
            return this.prepareFavsTable().then(db => {
                return db.executeSql(`DELETE FROM faves_vcon WHERE faveItemID=? AND faveItemType=?`, [item.Id, itemType]);
            }).then(a => {
                return true;
            });
        }
    }

    containsObject(obj, arry){
        for(let i = 0;i<arry.length;i++){
            if(arry[i].title==obj.title){
                return true;
            }
        }
        return false;
    }

    private prepareFavsTable() {
        return openSqliteDb(this.sqlite).then(db => {
            return this.createFavoritesTable(db);
        });
    }

    private createFavoritesTable(db: SQLiteObject) {
        return new Promise<SQLiteObject>((resolve, reject) => {
            try {
                db.executeSql(`CREATE TABLE IF NOT EXISTS faves_vcon(
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        faveItemID TEXT NOT NULL,
                        faveItemType TEXT NOT NULL)`, [])
                    .then(() => { resolve(db); })
                    .catch(e => { reject(e); })
            } catch (e) {
                reject(e);
            }
        });
    }
    private prepareLikesTable() {
        return openSqliteDb(this.sqlite).then(db => {
            return this.createLikesTable(db);
        });
    }
    private createLikesTable(db:SQLiteObject){
        return new Promise<SQLiteObject>((resolve,reject)=>{
            try{
                db.executeSql(`CREATE TABLE IF NOT EXISTS likes_vcon(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    postId TEXT NOT NULL,
                    irid TEXT NOT NULL)`, [])
                    .then(() => { console.log(db); resolve(db); })
                    .catch(e => { console.log(e); reject(e); })
            }
            catch (e) {
                console.log(e);
                reject(e);
            }
        })
    }
}