'use strict';

var detailController = angular.module('DetailController', 
                                    ['ngRoute','ngMaterial', 'firebase']);

detailController.controller('DetailController', 
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

    var form = $firebaseObject(formReference);
    var object = $firebaseObject(collectionReference);
                               
    context.isLoggedin = $rootScope.isLoggedin;

    form.$loaded().then(function(){
        context.form = form; 
    });
    
    object.$loaded().then(function(){
        context.object = object; 
    });
                               
    context.exportPDF = function(){
        $window.open("http://afv.mobi/otriBot/exportpdf.php?patent_id="+$routeParams.objectId, "_blank");
    }
                               
    context.createPDF = function(){
        var doc = new jsPDF();
        var yPos = 10
        doc.setFontSize(12);
        angular.forEach(context.form.questions, function(question){
            doc.setTextColor(100);
            doc.text(question.tag, 10, yPos);
            doc.setTextColor(30);
            var text = "";
            if(context.object[question.name] != undefined){
                text = ""+context.object[question.name];
            }
            doc.text(text, 10, yPos+5);
            yPos = yPos+10;
        });
        doc.save('test.pdf')
    }
    
    context.showEditForm = function(){
        $location.path("edit/"+$routeParams.formName+"/"+$routeParams.dataCollection+"/"+$routeParams.objectId); 
    }
    
    context.delete = function(){
        collectionReference.remove();
        window.history.back();   
    }
    
}]);