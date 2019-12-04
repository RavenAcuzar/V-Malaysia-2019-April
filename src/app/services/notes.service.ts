import { Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";
import { Storage } from '@ionic/storage';
import { encodeObject, openSqliteDb } from "../app.utils";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { Observable } from "rxjs/Observable";
import { Subscriber } from "rxjs/Subscriber";
import { Subject } from "rxjs/Subject";

export type NotesEntry = {
    id?: string,
    message: string,
    title: string,
    dateSent: string
};

@Injectable()
export class NotesService {

    private noteObservable: Subject<NotesEntry>;
    private notesClearObservable: Subject<void>;

    constructor(
        private http: Http,
        private storage: Storage,
        private sqlite: SQLite
    ) {
        this.noteObservable = new Subject();
        this.notesClearObservable = new Subject<void>();
    }

    getObservableNote() {
        return this.noteObservable;
    }

    getObservableNoteClear() {
        return this.notesClearObservable;
    }

    getPreviousNotes(id?:string) {
        let query;
        let params=[];
        if(id){
            query = `SELECT * FROM notes_vcon WHERE id=?`;   
            params = [id];
        }
        else{
            query=`SELECT * FROM notes_vcon`;
        }
        return this.prepareNotesTable().then(db => {
            return db.executeSql(query, params);

        }).then(a => {
            try {
                let noteEntries: NotesEntry[] = []
                for (let i = 0; i < a.rows.length; i++) {
                    let rawNoteEntry = a.rows.item(i);

                    let noteEntry: NotesEntry = {
                        id: rawNoteEntry.id.toString(),
                        message: rawNoteEntry.message,
                        title: rawNoteEntry.title,
                        dateSent: rawNoteEntry.datesent,
                    }
                    noteEntries.push(noteEntry);
                }
                return noteEntries;
            } catch (e) {
                throw new Error();
            }
        });
    }

    saveNote(title: string, message: string, id?: string): Promise<void> {
        let date = new Date(Date.now());

        let noteEntry: NotesEntry = {
            title: title,
            message: message,
            dateSent: date.toLocaleString(),
        };
        let query;
        let params=[];
        if (id) {
            //update note
            query = 'UPDATE notes_vcon SET title=?, message=?, datesent=? where id=?';
            params = [
                noteEntry.title,
                noteEntry.message,
                noteEntry.dateSent,
                id
            ];
        } else {
            //save new note
            query = 'INSERT INTO notes_vcon(title, message, datesent) VALUES(?, ?, ?)';
            params = [
                noteEntry.title,
                noteEntry.message,
                noteEntry.dateSent
            ];
        }
        
        
        return new Promise<void>((resolve, reject) => {
            return this.prepareNotesTable().then(db => {

                return db.executeSql(query, params);
            }).then(a => {
                if (a.rowsAffected === 1) {
                    this.noteObservable.next(noteEntry);
                    resolve();
                } else {
                    throw new Error('not_successfully_inserted');
                }
            });
        });
    }

    deleteNote(id: string) {
        return this.prepareNotesTable().then(db => {
            return db.executeSql(`DELETE FROM notes_vcon WHERE id=?`, [id]);
        }).then(a => {
            this.notesClearObservable.next();
            return true;
        });
    }

    private prepareNotesTable() {
        return openSqliteDb(this.sqlite).then(db => {
            return this.createNotesTable(db);
        });
    }

    private createNotesTable(db: SQLiteObject) {
        return new Promise<SQLiteObject>((resolve, reject) => {
            try {
                db.executeSql(`CREATE TABLE IF NOT EXISTS notes_vcon(
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        message TEXT NOT NULL,
                        datesent TEXT NOT NULL)`, [])
                    .then(() => { resolve(db); })
                    .catch(e => { reject(e); })
            } catch (e) {
                reject(e);
            }
        });
    }
}