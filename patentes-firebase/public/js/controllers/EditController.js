'use strict';

var editController = angular.module('EditController', 
                                    ['ngMaterial', 'firebase']);

editController.controller('EditController', 
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
                               
    var formReference = firebase.database().ref().child("forms/"+$routeParams.formName);
    var collectionReference = firebase.database().ref().child($routeParams.dataCollection+"/"+$routeParams.objectId);
    var referencesReference = firebase.database().ref().child("references");

    var form = $firebaseObject(formReference);
    var references = $firebaseObject(referencesReference);
    var object = $firebaseObject(collectionReference);

    form.$loaded().then(function(){
        context.form = form; 
    });
                               
    references.$loaded().then(function(){
        context.references = references; 
    });
                               
    object.$loaded().then(function(){
        context.answers = object; 
        if(context.answers.documents === undefined){
            context.answers.documents = [];
        }
    });
                             
    //context.imgs = $firebaseArray(documentsReference);

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
                                                    "fileCategory": context.fileCategory,
                                                    "ref": ref});
                    $scope.$digest();
                    context.save();
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
        console.log(document.ref);
       var documentsReference = firebase.storage().ref().child(document.ref);
       documentsReference.delete().then(function(){
           for(var i=0; i < context.answers.documents.length; i++){
               if(context.answers.documents[i].ref == document.ref){
                   context.answers.documents.splice(i, 1);
               }
           }
           $scope.$digest();
           context.save();
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
        object = context.answers;
        object.$save().then(function(reference) {
            alert("El registro fue almacenado correctamente.");
        }, function(error) {
            alert("Ocurrio un error al almacenar el registro.");
        });
    };
}]);