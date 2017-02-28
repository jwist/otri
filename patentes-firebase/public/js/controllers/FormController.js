'use strict';

var formController = angular.module('FormController', 
                                    ['ngMaterial', 'firebase']);

formController.controller('FormController', 
                          ['$scope', 
                           '$rootScope',
                           '$location',
                           '$firebaseObject', 
                           '$firebaseArray',
                           '$mdDialog',
                           '$mdToast',
                           '$window',
                           '$routeParams',
                           function($scope, 
                                     $rootScope, 
                                     $location, 
                                     $firebaseObject, 
                                     $firebaseArray, 
                                     $mdDialog, 
                                     $mdToast, 
                                     $window,
                                     $routeParams){
    var context = this;
    context.answers = {"documents": []};
                               
    var formReference = firebase.database().ref().child("forms/"+$routeParams.formName);
    var patentsReference = firebase.database().ref().child($routeParams.dataCollection);
    var referencesReference = firebase.database().ref().child("references");

    var form = $firebaseObject(formReference);
    var references = $firebaseObject(referencesReference);

    form.$loaded().then(function(){
        context.form = form; 
    });
                               
    references.$loaded().then(function(){
        context.references = references; 
    });

    context.uploadFile = function() {
       var ref = 'documents/'+ new Date().getTime();
       var documentsReference = firebase.storage().ref().child(ref);
       var sFileName = $("#document").val();
       if (sFileName.length > 0) {
           var filesSelected = document.getElementById("document").files;
            if (filesSelected.length > 0) {
                var fileToLoad = filesSelected[0];

                var metadata = {
                    'contentType': fileToLoad.type
                };

                documentsReference.put(fileToLoad, metadata).then(function(snapshot){
                    console.log('Uploaded', snapshot.totalBytes, 'bytes.');
                    console.log(snapshot.metadata);
                    var url = snapshot.metadata.downloadURLs[0];
                    context.answers.documents.push({"url": url, 
                                                    "name": fileToLoad.name,
                                                    "ref": ref});
                    $scope.$digest();
                    console.log('File available at', url);
                }).catch(function(error) {
                    // [START onfailure]
                    console.error('Upload failed:', error);
                    // [END onfailure]
                });
            }
        }

        return true;
    }
   
    context.deleteFile = function(document) {
       var documentsReference = firebase.storage().ref().child(document.ref);
       documentsReference.delete().then(function(){
           for(var i=0; i < context.answers.documents.length; i++){
               if(context.answers.documents[i].ref == document.ref){
                   context.answers.documents.splice(i, 1);
               }
           }
           $scope.$digest();
       }).catch(function(error) {
            console.error('Delete failed:', error);
        });
    }
   
   context.sendEmail = function(){
       var clientId = '15487931340-aiqqlhbfah4716vpuui6f2jegv97n5pl.apps.googleusercontent.com';
       var apiKey = 'AIzaSyCJWlsGkovNk_hp4Iy4ubreIdqj5cRa2Hw';
       var scopes = ['https://mail.google.com/', 
                     'https://www.googleapis.com/auth/gmail.send', 
                     'https://www.googleapis.com/auth/gmail.modify', 
                     'https://www.googleapis.com/auth/gmail.compose'];
       
       gapi.client.setApiKey(apiKey);
       gapi.auth.authorize({
          client_id: "15487931340-aiqqlhbfah4716vpuui6f2jegv97n5pl.apps.googleusercontent.com",
          scope: scopes.join(' '),
          immediate: true
        }, function(){
           gapi.client.load('gmail', 'v1', function(){
               var email = "To:gelkio@gmail.com\r\nSubject:Prueba\r\n\r\nPrueba";
               var sendRequest = gapi.client.gmail.users.messages.send({
                    'userId': 'gelkio@gmail.com',
                    'resource': {
                        'raw': window.btoa(email).replace(/\+/g, '-').replace(/\//g, '_')
                    }
                });

                sendRequest.execute(function(){
                    console.log("Enviado");
                });
           });
       });

   }

    context.save = function(){
        console.log(context.answers);
        var patents = $firebaseArray(patentsReference);
        patents.$add(context.answers);
        alert("La patente fue almacenada correctamente.");
    };
}]);