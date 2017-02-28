'use strict';

var mainController = angular.module('MainController', 
                                    ['ngMaterial', 'firebase', 'google-signin']);

mainController.config(['GoogleSigninProvider', function(GoogleSigninProvider) {
     GoogleSigninProvider.init({
        client_id: '15487931340-aiqqlhbfah4716vpuui6f2jegv97n5pl.apps.googleusercontent.com'
     });
}]);

mainController.controller('MainController', 
                          ['$scope', 
                           '$rootScope',
                           '$location',
                           '$firebase',
                           '$mdDialog',
                           '$mdToast',
                           '$window',
                           'GoogleSignin',
                           function($scope, $rootScope, $location, $firebase, $mdDialog, $mdToast, $window, GoogleSignin){
    var context = this;
    
    context.patentsSelected = true;
    context.technologiesSelected = false;
    context.isLoggedin = false;
    $rootScope.isLoggedin = false;
                               
    context.login = function () {
        GoogleSignin.signIn().then(function (user) {
            var profile = user.getBasicProfile();
            $rootScope.profile = profile;
            context.userName = profile.getName();
            context.isLoggedin = true;
            $rootScope.isLoggedin = true;
        }, function (err) {
            console.log(err);
        });
    };
    
    context.newPatent = function(){
        $location.path('form/form-patents/patents');
    }
    
    context.newTechnology = function(){
        $location.path('form/form-technologies/technologies');
    }
    
    context.showPatents = function(){
        context.patentsSelected = true;
        context.technologiesSelected = false;
        $location.path('patents');
    }
                               
    context.showTechnologies = function(){
        context.patentsSelected = false;
        context.technologiesSelected = true;
        $location.path('technologies');
    }
}]);