import { Component, OnInit } from '@angular/core';
import { CognitoUserPool,CognitoUserAttribute, CognitoUser } from 'amazon-cognito-identity-js';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

interface formDataInterface {
  "name": string;
  "family_name": string;
  "email": string;
  [key: string]: string;
};

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  isLoading:boolean = false;
  fname:string = '';
  lname:string = '';
  email:string = '';
  password:string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onSignup(form: NgForm){
    if (form.valid) {
     this.isLoading = true;
     var poolData = {
       UserPoolId: environment.userPoolId, // Your user pool id here
       ClientId: environment.userPoolWebClientId // Your client id here
     };
     var userPool = new CognitoUserPool(poolData);
     var attributeList = [];
     let formData:formDataInterface = {
       "name": this.fname,
       "family_name": this.lname,
       "email": this.email,
     }

     for (let key  in formData) {
       let attrData = {
         Name: key,
         Value: formData[key]
       }
       let attribute = new CognitoUserAttribute(attrData);
       attributeList.push(attribute)
     }
     userPool.signUp(this.email, this.password, attributeList, [], (
       err,
       result
     ) => {
       this.isLoading = false;
       if (err) {
         alert(err.message || JSON.stringify(err));
         return;
       }

       const userData = { 
        Username : this.email,
        Pool : userPool
        };
       var cognitoUser = new CognitoUser(userData);

       var confirmationCode = prompt('Enter the confirmation code sent to ' + userData.Username);

       if(confirmationCode != null){
        cognitoUser.confirmRegistration(confirmationCode, true, function(err, result) {
          if (err) {
            alert(err);
            return;
        }
        alert(result);
        });
       }

       this.router.navigate(['signin']);
     });
    }
 }
}