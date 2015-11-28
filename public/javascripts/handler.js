(function () {
    var app = angular.module('tool', ['ngCookies','ngRoute','ngResource']);
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider 
          .when('/register', {
            templateUrl: '/register.html',
            controller: 'UserController'
          })
            .when('/', {
            templateUrl: '/schedule.html',
            controller: 'ScheduleController'
        }).otherwise({redirectTo: '/'})
    }])

    app.controller('loginController',['$scope','$http','$cookies','$rootScope',function($scope,$http,$cookies,$rootScope){
        //need to fix
        if (window.location.href.length>30){
          var d = window.location.href.split("&");
          d = d[0].split("=");
          d = d[1]; 
          var url = "https://www.googleapis.com/plus/v1/people/me?access_token="+d;
          $http({ method: 'GET', url:url})
            .success(function (data, status, header, config) {
              //console.log(data);
              var name = data["name"]["givenName"]+" "+data["name"]["familyName"];
              var email = data["emails"][0]["value"];
            $http({ method: 'POST', url: '/login', data: {user: name,email: email}})
            .success(function (data, status, header, config) {
              //console.log($cookies.getAll());
              $http({ method: 'GET', url: '/Users/findID'})
                .success(function (data, status, header, config) {
                 if (data.length>0){
                  window.location.reload();
                 }
                 else {
                  window.location.href="/#/register";
                 }
                
                })
                .error(function () {
                    alert("Server is down, try again later");
                })



            })
            .error(function () {
                alert("Server is down, try again later");
            })
            })
            .error(function () {
                alert("Server is down, try again later");
            })
        }
/*
        $scope.callfun = function(name,email){

        }
*/
        $scope.signOut = function(){
          
          /*  var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
              console.log('User signed out.');
            });
          */
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
        
    app.factory('Users', ['$resource', function($resource){
          return $resource('/users/:id', null, {
            'update': { method:'PUT' }
          });
        }]);
        
    app.controller('ScheduleController', ['$scope', 'Schedules', 'Users', '$cookies', function ($scope, Schedules, Users, $cookies) {
          $scope.editing = [];
          $scope.schedules = Schedules.query();
          $scope.users = Users.query();
          $scope.user = $cookies.get('user');
          $scope.emails = $cookies.get('email');
          $scope.save = function(){
            if(!$scope.newSchedule || $scope.newSchedule.length < 1) return;
            var schedule = new Schedules({ name: $scope.newSchedule, join: [] });

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
          
          $scope.join = function(index){
              var schedule = $scope.schedules[index];
              Schedules.update({id: schedule._id}, function(){
                  
              });
              
          }
          
        }]);
   
   
    app.controller('UserController', ['$scope', 'Users', '$cookies','$http',function ($scope, Users, $cookies,$http) {
          $scope.editing = [];
          $scope.users = Users.query();
          $scope.user = $cookies.get('user');
          $scope.emails = $cookies.get('email');

          $scope.save = function(){
            if(!$scope.newUser || $scope.newUser.length < 1) return;
            var user = new Users({ name: $scope.user, email: $scope.emails, address: $scope.newUser, admin: false});


            user.$save(function(){
              $scope.users.push(user);
              $scope.newUser = ''; // clear textbox
            });
            window.location.href="/";
          }
        }]);

})();



