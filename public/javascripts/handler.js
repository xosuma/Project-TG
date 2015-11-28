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
        if (window.location.href.length>50){
          var d = window.location.href.split("&");
          d = d[0].split("=");
          d = d[1]; 
          $rootScope.token = d;
          var url = "https://www.googleapis.com/plus/v1/people/me?access_token="+d;
          $http({ method: 'GET', url:url})
            .success(function (data, status, header, config) {
              //console.log(data);
              var name = data["name"]["givenName"]+" "+data["name"]["familyName"];
              var email = data["emails"][0]["value"];

            $http({ method: 'POST', url: '/login', data: {user: name,email: email,token:d}})
              .success(function (data, status, header, config) {

                //console.log($cookies.getAll());
                console.log($cookies.getAll());
                if ($cookies.get("isNew")=='true'){
                  window.location.href = '/#/register';
                }
                else {
                  window.location.reload();
                }

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

        // var ur =  "https://accounts.google.com/o/oauth2/revoke?token="+$cookies.get("token");
         //$http({method:'POST',url:ur}).success(function(){console.log("success");}).error(function(){});
           /* var auth2 = gapi.auth2.getAuthInstance();
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

        $scope.adminLoggedIn = function(){
          return $cookies.get("admin")=='true';
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
          $scope.attending = [];
          $scope.schedules = Schedules.query();
          $scope.users = Users.query();
          $scope.user = $cookies.get('user');
          $scope.emails = $cookies.get('email');
          $scope.attend = false;
         
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
              var user = $scope.users;
              var indexLength = $scope.users.length;
              var lat, lng, address;
              for (var i = 0; i < indexLength; i++)
              {
                  if(user[i].email == $scope.emails){
                       address = user[i].address;
                       lat = user[i].lat;
                       lng = user[i].lng;
                  } 
              }
              schedule.join.push({user:$scope.user,email:$scope.emails,address:address, lat:lat, lng:lng});
              Schedules.update({id: schedule._id}, schedule);
              $scope.attending[index] = true;
          }
          
          $scope.reset = function(index){
              $scope.attending[index] = false;
          }
          
        }]);
   
   
    app.controller('UserController', ['$scope', 'Users', '$cookies','$http',function ($scope, Users, $cookies,$http) {
          $scope.editing = [];
          $scope.users = Users.query();
          $scope.user = $cookies.get('user');
          $scope.emails = $cookies.get('email');

          $scope.save = function(){
            if(!$scope.newUser || $scope.newUser.length < 1) return;
            //GEOCODE
            var api = "AIzaSyA-G6dLv9YHY-_HE7W87Dw-IjdE17mb3pQ";
            var url= "https://maps.googleapis.com/maps/api/geocode/json?address="+$scope.newUser+"&key="+api;
            $http({ method: 'GET', url: url})
                .success(function (data, status, header, config) {
                  var lat = data["results"][0]["geometry"]["location"]["lat"];
                  var lng = data["results"][0]["geometry"]["location"]["lng"];
                  var user = new Users({ name: $scope.user, email: $scope.emails, address: $scope.newUser, admin: false, lat: lat,lng: lng});
                  user.$save(function(){
                    $scope.users.push(user);
                    $scope.newUser = ''; // clear textbox
                  });

                  window.location.href="/";
                })
                .error(function () {
                    alert("Server is down, try again later");

                    window.location.href="/";
                })
            
          }
        }]);
  
})();



