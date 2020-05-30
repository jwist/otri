'use strict';

var technologiesController = angular.module('TechnologiesController', 
                                    ['ngMaterial', 'firebase', 'nvd3']);

technologiesController.controller('TechnologiesController', 
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
                               
    context.visualizeAs = "graph";
    context.detail = {};
                               
    var color = d3.scale.category20()
    $scope.options = {
        chart: {
            type: 'forceDirectedGraph',
            height: 500,
            width: (function(){ return nv.utils.windowSize().width })(),
            margin:{top: 20, right: 20, bottom: 20, left: 20},
            color: function(d){
                return color(d.group)
            },
            nodeExtras: function(node) {
                node && node
                  .append("text")
                  .attr("dx", -7)
                  .attr("dy", ".35em")
                  .text(function(d) { return "· · · "+d.name })
                  .on("click", function(d){ context.detail = d; $scope.$digest(); })
                  .style('font-size', '10px');
            }
        }
    };
    
    var technologiesReference = firebase.database().ref().child("technologies");
    var technologies = $firebaseArray(technologiesReference.orderByChild("OTRI_name"));
    var nodes = [];
    var links = [];
    var sector = [];
    var faculty = [];
    context.technologiesArray = [];                           
    technologies.$loaded().then(function(){
        angular.forEach(technologies, function(technology){
            context.technologiesArray.push(technology);
            var techIndex = context.isInArray(nodes, technology.technologic_sector);
            if(techIndex < 0){
                techIndex = nodes.length;
                nodes.push({"name": technology.technologic_sector, "group":1});
            }
            var facultyIndex = context.isInArray(nodes, technology.faculty);
            if( facultyIndex < 0){
                facultyIndex = nodes.length;
                nodes.push({"name": technology.faculty, "group":2});
            }
            var technologyIndex = nodes.length;
            nodes.push({"name": technology.OTRI_name, 
                        "group":2, 
                        "$id":technology.$id, 
                        "description": technology.name});
            links.push({"source":techIndex,"target":technologyIndex,"value":1});
            links.push({"source":facultyIndex,"target":technologyIndex,"value":1});
        });
        
        $scope.data = {
            "nodes":nodes,
            "links":links
        };
    });
                                                             
    context.isInArray = function(array, value){
        for(var i=0; i<array.length; i++){
            if(array[i].name == value){
                return i;
            }
        }
        return -1;
    }
    
    context.showTechnologiesList = function(sector){
        context.sector = sector;
        $mdDialog.show({
          controller: DialogController,
          templateUrl: 'partials/technologies-list.html',
          parent: angular.element(document.body),
          clickOutsideToClose:true,
          fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
        .then(function(answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function() {
          $scope.status = 'You cancelled the dialog.';
        }); 
    } 
    
    function DialogController($scope, $mdDialog) {
        $scope.sector = context.sector;
        $scope.technologies = [];
        angular.forEach(context.technologiesArray, function(technology){
            if(technology.technologic_sector != undefined && technology.technologic_sector === context.sector){
                $scope.technologies.push(technology);
            }
        });
        
        $scope.hide = function() {
            $mdDialog.hide();
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.onClickTechnology = function(technology) {
            $mdDialog.hide();
            $location.path("detail/form-technologies/technologies/"+technology.$id); 
        };     
    }
                               
    context.showDetail = function(technology){
        $location.path("detail/form-technologies/technologies/"+technology.$id); 
    }
    
    context.visualizeChange = function(option){
        context.visualizeAs = option;
    }

}]);
