var patentestApp = angular.module('PatentesApp', ['ngRoute'
                                                 ,'MainController'
                                                 ,'PatentsController'
                                                 ,'FormController'
                                                 ,'EditController'
                                                 ,'DetailController'
                                                 ,'TechnologiesController'
                                                 ]);

patentestApp.config(['$routeProvider',
    function($routeProvider){
       $routeProvider.when('/patents', {
           templateUrl: 'partials/patents.html',
           controller : 'PatentsController'
       }).when('/technologies', {
           templateUrl: 'partials/technologies.html',
           controller : 'TechnologiesController'
       }).when('/form/:formName/:dataCollection', {
           templateUrl: 'partials/form.html',
           controller : 'FormController'
       }).when('/edit/:formName/:dataCollection/:objectId', {
           templateUrl: 'partials/edit.html',
           controller : 'EditController'
       }).when('/detail/:formName/:dataCollection/:objectId', {
           templateUrl: 'partials/detail.html',
           controller : 'DetailController'
       }).otherwise({
           redirectTo : '/patents' 
       });
    }]);