import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, URLSearchParams } from "@angular/http";
import { Storage } from '@ionic/storage';
import { encodeObject, openSqliteDb } from "../app.utils";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { Observable } from "rxjs/Observable";
import { Subscriber } from "rxjs/Subscriber";
import { Subject } from "rxjs/Subject";
import { MERCH_FAVES, ASK_DATO_DETAILS } from "../app.constants";
import { FileTransferObject, FileTransfer, FileUploadOptions } from "@ionic-native/file-transfer";
import { File, FileEntry } from "@ionic-native/file";


@Injectable()
export class FeedService {
    options;
    temp: boolean;
    private fileTransfer: FileTransferObject;
    filesName: string;
    fileType: string;
    constructor(
        private http: Http,
        private transfer: FileTransfer,
        private file: File,
        private storage: Storage,
        private sqlite: SQLite
    ) {
        this.options = new RequestOptions({
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
            })
        });
    }

    checkIfLike(id, irid) {
        return this.prepareLikesTable().then(db => {
            return db.executeSql(`SELECT postId FROM likes_vcon where postId=? AND irid=?`, [id, irid]);
        }).then(a => {
            if (a.rows.length > 0) {
                return true;
            } else {
                return false;
            }
        }).catch(e => {
            console.log(e);
            return new Error;
        })
    }
    loadFeed(date:string,page:string) {
        let body = new URLSearchParams();
        body.set('action', 'getFeed');
        body.set('datetime', date);
        body.set('page', page);
        body.set('count', '5');
        return this.http.post('http://bt.the-v.net/service/api.aspx', body, this.options)
            .timeout(20000)
            .map(response => {
                console.log(response);
                try {
                    return response.json();
                }
                catch (e) {
                    return [];
                }
            }).toPromise();
    }
    getSingleFeed(id) {
        let body = new URLSearchParams();
        body.set('action', 'getSingleFeed');
        body.set('id', id);
        return this.http.post('http://bt.the-v.net/service/api.aspx', body, this.options)
            .timeout(30000)
            .map(response => {
                try {
                    return response.json();
                }
                catch (e) {
                    return [];
                }
            }).toPromise();
    }
    loadPostComments(id) {
        let body = new URLSearchParams();
        body.set('action', 'getFeedComments');
        body.set('postId', id);
        return this.http.post('http://bt.the-v.net/service/api.aspx', body, this.options)
            .timeout(30000)
            .map(response => {
                try {
                    return response.json();
                }
                catch (e) {
                    return [];
                }
            }).toPromise();
    }
    submitComment(postId: string, details, message: string) {
        let body = new URLSearchParams();
        body.set('action', 'postComment');
        body.set('postId', postId);
        body.set('name', details.name);
        body.set('irid', details.irid);
        body.set('message', message);
        return this.http.post('http://bt.the-v.net/service/api.aspx', body, this.options)
            .timeout(30000)
            .map(response => {
                try {
                    if (response.text() == "True")
                        return true;
                    else return false;
                }
                catch (e) {
                    return false;
                }
            }).toPromise();
    }
    postFeed(details, message: string, imgs: any) {//returns post Id if success, else ""
        let body = new URLSearchParams();
        body.set('action', 'postFeed');
        body.set('name', details.name);
        body.set('email', details.email);
        body.set('irid', details.irid);
        body.set('message', message);
        return this.http.post('http://bt.the-v.net/service/api.aspx', body, this.options)
            .timeout(30000)
            .map(response => {
                try {
                    let id = response.json()[0];
                    console.log(response.json()[0])
                    if (id.Id != "") {
                        if (imgs.length > 0) {
                            let d = imgs.map(e => {
                                setTimeout(() => {
                                }, 500);
                                return this.uploadImages(e.imgSrc, id.Id).then(x => {
                                    return x;
                                })
                            });
                            return Promise.all(d).then(res => {
                                console.log(res)
                                let f=true;
                                for (let i = 0; res.length - 1 > i; i++) {
                                    f = Boolean(f && res[i]);
                                }
                                if(f){
                                    return this.activatePost(id.Id).then(resp=>{
                                        console.log(resp);
                                        if(resp=='True')
                                        return true;
                                        else return false;
                                    })
                                } else return false;
                            })
                        } else {
                            return this.activatePost(id.Id).then(res=>{
                                if(res=='True')
                                return true;
                                else return false;
                            })
                        }

                    }
                    else return false;
                }
                catch (e) {
                    return false;
                }
            }).toPromise();
    }
    private activatePost(id) {
        let body = new URLSearchParams();
        body.set('action', 'activatePost');
        body.set('postId', id);
        return this.http.post('http://bt.the-v.net/service/api.aspx', body, this.options)
            .timeout(30000)
            .map(response => {
                try {
                    return response.text();
                }
                catch (e) {
                    return "False";
                }
            }).toPromise();
    }

    private likePost(id, irid: string) {
        return this.prepareLikesTable().then(db => {
            return db.executeSql(`INSERT INTO likes_vcon(postId, irid) VALUES(? , ?)`, [id, irid]);
        }).then(() => {
            return true;
        }).catch(e => {
            //console.log(e);
            return false;
        })
    }
    private unlikePost(id, irid: string) {
        return this.prepareLikesTable().then(db => {
            return db.executeSql(`DELETE FROM likes_vcon WHERE postId=? AND irid=?`, [id, irid]);
        }).then(() => {
            return true;
        }).catch(e => {
            //console.log(e);
            return false;
        })
    }

    addToLike(id: string, irid: string, type: string) {
        let body = new URLSearchParams();
        body.set('action', 'addRemoveFeedLike');
        body.set('id', id);
        body.set('type', type);
        let p = this.http.post('http://bt.the-v.net/service/api.aspx', body, this.options)
            .timeout(30000)
            .map(response => {
                try {
                    if (response.text() == 'True') {
                        if (type == 'like') {
                            return this.likePost(id, irid).then(r => {
                                return r;
                            })
                        } else {
                            return this.unlikePost(id, irid).then(r => {
                                return r;
                            })
                        }
                    }
                    else {
                        return false;
                    }
                }
                catch (e) {
                    return false;
                }
            }).toPromise();
        return p;
    }
    private prepareLikesTable() {
        return openSqliteDb(this.sqlite).then(db => {
            return this.createLikesTable(db);
        });
    }
    private createLikesTable(db: SQLiteObject) {
        return new Promise<SQLiteObject>((resolve, reject) => {
            try {
                db.executeSql(`CREATE TABLE IF NOT EXISTS likes_vcon(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    postId TEXT NOT NULL,
                    irid TEXT NOT NULL)`, [])
                    .then(() => { resolve(db); })
                    .catch(e => { reject(e); })
            }
            catch (e) {
                reject(e);
            }
        })
    }
    setTypeValue(val){
        this.fileType = val;
    }
    uploadImages(imgSrc: string, postId: string, isError?) {

        let uri = encodeURI('http://bt.the-v.net/ISBUpload.aspx');
        let lastIndexOfSlash = imgSrc.lastIndexOf('/');
        let trueFileName = imgSrc.substring(lastIndexOfSlash + 1);
        let fileContainingDirectory = imgSrc.substring(0, lastIndexOfSlash);

        return this.file.resolveLocalFilesystemUrl(imgSrc).then(fileInfo => {
            let files = fileInfo as FileEntry;
            files.file(success => {
                this.setTypeValue(success.type);
                this.filesName = success.name;
                console.log(this.fileType)
                console.log(this.filesName);
            });
            let options: FileUploadOptions = {
                fileKey: 'UploadPhotoFeed',
                fileName: trueFileName,
                chunkedMode: false,
                mimeType: this.fileType,
                params: {
                    type: 'Image',
                    action: 'ImageUpload',
                    postId: postId
                }
            }
            this.fileTransfer = this.transfer.create();
            return this.fileTransfer.upload(imgSrc, uri, options).then(done=>{
                console.log(done)
                return true;
            }).catch(()=>{
                return false;
            })

        });
    }
}