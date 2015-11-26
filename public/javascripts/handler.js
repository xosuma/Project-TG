(function () {
    var app = angular.module('tool', ['ngCookies','ngRoute','ngResource']);
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/schedule.html', {
            templateUrl: '/schedule.html',
            controller: 'ScheduleController'
        }).when('/', {
            templateUrl: '/schedule.html',
            controller: 'loginController'
        })
    }])

    app.controller('loginController',['$scope','$http','$cookies','$rootScope',function($scope,$http,$cookies,$rootScope){
        $scope.callfun = function(name,email){
            $http({ method: 'POST', url: '/login', data: {user: name,email: email}})
            .success(function (data, status, header, config) {

              //  console.log($cookies.getAll());
            })
            .error(function () {
                alert("Server is down, try again later");
            })
        }

        $scope.signOut = function(){
          
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
              console.log('User signed out.');
            });
          
          $http({ method: 'POST', url: '/logout'})
            .success(function (data, status, header, config) {
                location.reload();
            })
            .error(function () {
                alert("Server is down, try again later");
            })
        }

        $scope.isLoggedIn = function () {
            return $cookies.get("loggedIn") == 'true';
        }

    }]);

    app.factory('Schedules', ['$resource', function($resource){
          return $resource('/schedules/:id', null, {
            'update': { method:'PUT' }
          });
        }]);

    app.controller('ScheduleController', ['$scope', 'Schedules', function ($scope, Schedules) {
          $scope.editing = [];
          $scope.schedules = Schedules.query();

          $scope.save = function(){
            if(!$scope.newSchedule || $scope.newSchedule.length < 1) return;
            var schedule = new Schedules({ name: $scope.newSchedule, completed: false });

            schedule.$save(function(){
              $scope.schedules.push(schedule);
              $scope.newSchedule = ''; // clear textbox
            });
          }

          $scope.update = function(index){
            var schedule = $scope.schedules[index];
            Schedules.update({id: schedule._id}, schedule);
            $scope.editing[index] = false;
          }

          $scope.edit = function(index){
            $scope.editing[index] = angular.copy($scope.schedules[index]);
          }

          $scope.cancel = function(index){
            $scope.schedules[index] = angular.copy($scope.editing[index]);
            $scope.editing[index] = false;
          }

          $scope.remove = function(index){
            var schedule = $scope.schedules[index];
            Schedules.remove({id: schedule._id}, function(){
              $scope.schedules.splice(index, 1);
            });
          }
        }]);

    app.controller('ScheduleDetailCtrl', ['$scope', '$routeParams', 'Schedules', '$location', function ($scope, $routeParams, Schedules, $location) {
          $scope.schedule = Schedules.get({id: $routeParams.id });

          $scope.update = function(){
            Schedules.update({id: $scope.schedule._id}, $scope.schedule, function(){
              $location.url('/');
            });
          }

          $scope.remove = function(){
            Schedules.remove({id: $scope.schedule._id}, function(){
              $location.url('/');
            });
          }
        }]);


})();