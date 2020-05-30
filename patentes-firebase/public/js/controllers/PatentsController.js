'use strict';

var patentsController = angular.module('PatentsController', 
                                    ['ngMaterial', 'firebase', 'datamaps']);

patentsController.controller('PatentsController', 
                          ['$scope', 
                           '$rootScope',
                           '$location',
                           '$firebaseObject', 
                           '$firebaseArray',
                           '$mdDialog',
                           '$mdToast',
                           '$window',
                           function($scope, 
                                     $rootScope, 
                                     $location, 
                                     $firebaseObject, 
                                     $firebaseArray, 
                                     $mdDialog, 
                                     $mdToast, 
                                     $window){
    var context = this;
    
    context.visualizeAs = "map";
    context.visualizeMap = true;
    context.visualizeTable = false;
                               
    $scope.mapObject = {
        options: {
            //width: 900,
            legendHeight: 60 // optionally set the padding for the legend
        },
        geographyConfig: {
            highlighBorderColor: '#EAA9A8',
            highlighBorderWidth: 2,
            popupTemplate: function(geography, data) {
                if($window.innerWidth <= 800 && $window.innerHeight <= 600){
                    return "";
                }else{
                    return '<div class="hoverinfo">' + geography.properties.name + '<br/>Numero de patentes:' +  data.patentNumber + '</div>';
                }
            }
        },
        fills: {
            'HIGH': '#CC4731',
            'MEDIUM': '#D35400',
            'LOW': '#667FAF',
            'defaultFill': '#DDDDDD'
        },data: {
            COL: {
                fillKey: 'LOW',
                numberOfThings: 1
            }
        }
    }
    $scope.mapObject.responsive = true
    
    var patentsReference = firebase.database().ref().child("patents");
    var patents = $firebaseArray(patentsReference.orderByChild("description"));
    var patentsCountry = {};
    context.patentsArray = [];
    patents.$loaded().then(function(){
        angular.forEach(patents, function(patent){
            context.patentsArray.push(patent);
            if(patent.country !== undefined){
                var patentCountry = patentsCountry[patent.country.toUpperCase()];
                if(patentCountry != undefined){
                    patentCountry.patentNumber ++;
                    if(patentCountry.patentNumber < 3){
                        patentCountry.fillKey = "LOW";
                    }else if(patentCountry.patentNumber < 7){
                        patentCountry.fillKey = "MEDIUM";
                    }else{
                        patentCountry.fillKey = "HIGH";
                    }
                }else{
                    patentCountry = {fillKey: 'LOW', patentNumber: 1};
                }
                patentsCountry[patent.country.toUpperCase()] = patentCountry;
            }
        });
        $scope.mapObject.data = patentsCountry;
    });
          
    $scope.updateActiveGeography = function(geography) {
        context.country = geography.id;
        context.showPatentsList();
    }
    
    context.showPatentsList = function(){
        $mdDialog.show({
          controller: DialogController,
          templateUrl: 'partials/patents-list.html',
          parent: angular.element(document.body),
          clickOutsideToClose:true,
          fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
        .then(function(answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function() {
          $scope.status = 'You cancelled the dialog.';
        });        
    };
                               
    function DialogController($scope, $mdDialog) {
        $scope.country = context.country;
        $scope.patents = [];
        angular.forEach(context.patentsArray, function(patent){
            if(patent.country != undefined && patent.country.toUpperCase() === context.country){
                patent.hasDocuments = false;
                if(patent.documents != undefined && patent.documents.length > 0){
                    patent.hasDocuments = true;
                }else{
                    patent.documents = [];
                }
                $scope.patents.push(patent);
            }
        });
        
        $scope.hide = function() {
            $mdDialog.hide();
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        
        $scope.showPDF = function(document){
            context.showPDF(document);
        }

        $scope.onClickPatent = function(patent) {
            $mdDialog.hide();
            $location.path("detail/form-patents/patents/"+patent.$id); 
        };     
    }
                               
    context.showPatent = function(patent){
        $location.path("detail/form-patents/patents/"+patent.$id); 
    }
                               
    context.visualizeChange = function(option){
        context.visualizeAs = option;
        if(context.visualizeAs === "map"){
            context.visualizeMap = true;
            context.visualizeTable = false;    
        }else{
            context.visualizeMap = false;
            context.visualizeTable = true; 
        }
    }
    
    context.showPDF = function(document){
        $window.open(document.url, "_blank");
    }

}]);
