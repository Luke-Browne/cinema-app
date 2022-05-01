import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { environment } from 'src/environments/environment';
import { FilmsDataService } from 'src/app/services/films-data.service';
import { IFilm } from 'src/app/models/IFilm';
import { HttpResponse } from 'aws-sdk';
import { IResponse } from '../models/IResponse';
import { response } from 'express';
import { map } from 'rxjs';

function objLength(obj: { hasOwnProperty: (arg0: string) => any; }){
  var i=0;
  for (var x in obj){
    if(obj.hasOwnProperty(x)){
      i++;
    }
  } 
  return i;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  filmList: IFilm[] = [];
  message: string = '';
  pretty!: IFilm;

  username!: string;

  constructor(private router: Router, private filmService: FilmsDataService) { }

  ngOnInit(): void {
    this.getFilms();

    let poolData = {
      UserPoolId: environment.userPoolId,
      ClientId: environment.userPoolWebClientId
    };
    let userPool = new CognitoUserPool(poolData);
    let cognitoUser = userPool.getCurrentUser();

    if(cognitoUser != null)
    this.username = cognitoUser.getUsername();
  }

  getFilms(){
    this.filmService.getFilmList().subscribe(response =>{

      console.log(response.body.Items);

      var i = 0
      
      response.body.Items.forEach((element) => {

        this.pretty = JSON.parse(JSON.stringify(element, null, '\t'))

        console.log(this.pretty);

        this.filmList[i] = this.pretty;

        i++;

      });

    })

  }

  onLogout(): void {
    let poolData = {
      UserPoolId: environment.userPoolId,
      ClientId: environment.userPoolWebClientId
    };
    let userPool = new CognitoUserPool(poolData);
    let cognitoUser = userPool.getCurrentUser();
    cognitoUser?.signOut();
    this.router.navigate(["signin"])
  }

  test(): void {
    let request = new XMLHttpRequest();

    request.open("PUT", "https://gzi9gu1m08.execute-api.eu-west-1.amazonaws.com/Testing/test")
    request.send();

    request.onload = () => {
      console.log(request);

      if(request.status === 200){
        console.log(JSON.parse(request.response));
      }else{
        console.log(`error ${request.status} ${request.statusText}`)
      }
    }
  }

}
