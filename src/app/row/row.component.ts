var host = '0.0.0.0';
var port = 8080;

import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk';
import { response } from 'express';
import { IFilm } from 'src/app/models/IFilm'
import { keys, environment } from 'src/environments/environment';
import { IBooking } from '../models/IBooking';
import { FilmsDataService } from '../services/films-data.service';

@Component({
  selector: 'app-row',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.css']
})
export class RowComponent implements OnInit {

  @Input()
  film!: IFilm;
  booking: IBooking = {UserID:'', movieName:'', bookingDate:'', noOfTickets:'',totalCost:'',type:''};

  imageString!: string;
  nameString!: string;
  runtimeString!: number;
  priceString!: string;
  username!: string;
  dateString!: Date;
  quantityString!: number;
  typeString!: string;
  totalCost!: number;
  priceNum!: number;

  constructor(private router: Router, private filmService: FilmsDataService) { }

  ngOnInit(): void {

    this.imageString = this.film.image.toString();
    this.nameString = this.film.name.toString();
    this.runtimeString = parseInt(this.film.runtime.toString());
    this.priceString = '€' + parseInt(this.film.price.toString()).toFixed(2);
    this.dateString = new Date(Date.now())

    this.typeString = "2D";
    this.quantityString = 1;

  }

  purchase(name: string, price: string, datetime: Date){

    let poolData = {
      UserPoolId: environment.userPoolId,
      ClientId: environment.userPoolWebClientId
    };
    let userPool = new CognitoUserPool(poolData);
    let cognitoUser = userPool.getCurrentUser();

    if(cognitoUser != null)
    this.username = cognitoUser.getUsername();

    console.log(datetime.getDay)
    this.dateString = datetime;


    this.priceNum = parseInt(this.film.price.toString());

    switch(this.typeString){

      case "2D":
        this.totalCost = this.priceNum * this.quantityString;
        break;
      case "3D":
        this.priceNum = this.priceNum + 2;
        this.totalCost = this.priceNum * this.quantityString;
        break;
      case "IMAX":
        this.priceNum = this.priceNum + 5;
        this.totalCost = this.priceNum * this.quantityString;
        break;
    }

    console.log(this.username, name, price, datetime, this.typeString, this.quantityString)
    var answer = confirm(`confirm order of ${this.quantityString} ticket(s) for ${name} on ${datetime}? Cost: €${this.totalCost}`);

    if(answer){
      alert('Order placed!')

      console.log(this.booking);

      this.booking.UserID = this.username;
      this.booking.movieName = this.nameString;
      this.booking.bookingDate = this.dateString.toString();
      this.booking.noOfTickets = this.quantityString.toString();
      this.booking.totalCost = this.totalCost.toString();
      this.booking.type = this.typeString;

      const SESConfig = {
        apiVersion: "latest",
        accessKeyId: keys.aws_access_key_id,
        accessSecretKey: keys.aws_secret_access_key,
        region: "eu-west-1"
      };

      AWS.config.update({region:'eu-west-1'});
      
      var sqs = new AWS.SQS({'apiVersion':'latest', 'accessKeyId':keys.aws_access_key_id, 'secretAccessKey':keys.aws_secret_access_key});

      let sqsOrderData = {
        MessageAttributes: {
          "UserID": {
            DataType: "String",
            StringValue: this.booking.UserID
          },
          "MovieName": {
            DataType: "String",
            StringValue: this.booking.movieName
          },
          "BookingDate": {
            DataType: "String",
            StringValue: this.booking.bookingDate
          },
          "NoOfTickets": {
            DataType: "String",
            StringValue:  this.booking.noOfTickets
          },
          "TotalCost": {
            DataType: "String",
            StringValue:  this.booking.totalCost
          },
          "type": {
            DataType: "String",
            StringValue:  this.booking.type
          }
        },
        MessageBody: JSON.stringify(this.booking),
        QueueUrl: "https://sqs.eu-west-1.amazonaws.com/912989654067/CinemaAPI-SQS"
    };

    let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();

    console.log(sqsOrderData)

    sendSqsMessage.then((data) => {
      console.log(`Booking Status | SUCCESS: ${data.MessageId}`);
  }).catch((err) => {
      console.log(`Booking Status | ERROR: ${err}`);
  });

    }else{
      alert('Order cancelled!')
    }

  }

  setDateTime(event: any) {

    this.dateString = event.target.value;
    console.log(this.dateString)

  }

  setQuantity(event: any){

    this.quantityString = event.target.value;

  }
  setType(event: any){

    this.typeString = event.target.value;

  }
}
