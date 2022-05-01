import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { IFilm } from '../models/IFilm';
import { IResponse } from '../models/IResponse';
import { IBooking } from '../models/IBooking';

@Injectable({
  providedIn: 'root'
})
export class FilmsDataService {

  private apiURL = 'https://gzi9gu1m08.execute-api.eu-west-1.amazonaws.com/Testing/test';
  private bookingURL = 'https://gzi9gu1m08.execute-api.eu-west-1.amazonaws.com/Testing/sqs'

  constructor(private _http:HttpClient, private handler: HttpBackend) { }

  getFilmList():Observable<IResponse>{

    this._http = new HttpClient(this.handler)

    console.log("get films called");

    return this._http.get<IResponse>(`${this.apiURL}`)
    .pipe(
      catchError(this.handleError)
    )
  }

  bookFilm(booking: IBooking):Observable<IBooking>{

    let httpHeaders = new HttpHeaders({
      'Content-Type' : 'application/json',
      'Cache-Control': 'no-cache'
    });

    return this._http.post<IBooking>(this.bookingURL, booking, {headers: httpHeaders})
    .pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  handleError(error :HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);

      // question over how much information you want to give to the end-user
      // it depends on who will be using the system
      // this information would not be returned in a public interface but might in an intranet.

      if (error.status == 412) {
        return throwError('412 Error' + JSON.stringify(error.error))
      }
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }
  private extractData(res: any) {
    let body = res;
    console.log('bruh ' + body);
    return body;
}
}
