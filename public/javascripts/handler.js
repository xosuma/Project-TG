(function () {
    var app = angular.module('tool', ['ngCookies','ngRoute','ngResource']);

    var origin = window.location.href;
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider 
          .when('/ride/:schedule', {
            templateUrl: '/ride.html',
            controller: 'rideController'
          })
          .when('/register', {
            templateUrl: '/register.html',
            controller: 'UserController'
          })
          .when('/manage',{
            templateUrl:'/manage.html',
            controller:'manageController'
          })
            .when('/', {
            templateUrl: '/schedule.html'
        }).otherwise({redirectTo: '/'})
    }])


    app.controller('loginController',['$scope','$http','$cookies','$rootScope',function($scope,$http,$cookies,$rootScope){
        //need to fix
        $scope.orig = origin;
        var curURL = window.location.href;
        var res = curURL.match(/access_token/g);
        var c = curURL.match(/amazonaws/g);
        if (c==null||c==undefined){         
         document.getElementById("googleLink").href = "http://accounts.google.com/o/oauth2/auth?client_id=1077355752509-tke5rmc8v4bpatdupmd9q4rbi536d1al.apps.googleusercontent.com&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&immediate=false&response_type=token&redirect_uri=http://localhost:3000";
        }
        else {                           
         document.getElementById("googleLink").href = "http://accounts.google.com/o/oauth2/auth?client_id=1077355752509-tke5rmc8v4bpatdupmd9q4rbi536d1al.apps.googleusercontent.com&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&immediate=false&response_type=token&redirect_uri=http://ec2-52-23-247-16.compute-1.amazonaws.com:3000";

        }
        if (res==null||res==undefined){

        }
        else {
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
                if ($cookies.get("isNew")=='true'){
                  window.location.href = '/#/register';
                }
                else {
                  window.location.href='/';
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
        
        $scope.signOut = function(){
          $http({ method: 'POST', url: '/logout'})
            .success(function (data, status, header, config) {
                window.location.href="/";
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
        
    app.controller('ScheduleController', ['$scope', 'Schedules', 'Users', '$cookies', '$http',function ($scope, Schedules, Users, $cookies,$http) {
          $scope.editing = [];
          $scope.editRide = [[],[]];
          $scope.attending = [];
          //$scope.schedules = Schedules.query();
          //$scope.users = Users.query();
          $scope.user = $cookies.get('user');
          $scope.emails = $cookies.get('email');
          $scope.attend = false;
          $scope.address="";
          $scope.schedules=[];
          $scope.currentUser={};
          $scope.latestSchedule={};
          $scope.latestDate="";
          $scope.lastSchedule={};
          $scope.lastDate="";
          var initRider = [{
            name: "Van",
            max: 15,
            lat: 44.96804683,
            lng: -93.22277069,
            taking: []
          }];
          $scope.viewAll = function(){
            window.location.href="/#/manage";
          }
          $http({method:'GET',url:'/getLast'})
            .success(function(data,status,header,config){
              if (data!="no"){
                $scope.lastSchedule = data;
                var d = new Date($scope.lastSchedule.date.toString());
                var mon = d.getMonth()+1;
                $scope.lastDate = d.getFullYear()+"-"+mon+"-"+d.getDate();
              }
            }).error(function(){
              alert("Server is down, try again later");
            });
          $http({method:'GET',url:'/getLatest'})
            .success(function(data,status,header,config){
              if (data!="no"){
                $scope.latestSchedule =data;
                var d = new Date($scope.latestSchedule.date.toString());
                var mon = d.getMonth()+1;
                $scope.latestDate = d.getFullYear()+"-"+mon+"-"+d.getDate();
              }
            }).error(function(){
              alert("Server is down, try again later");
            });
          //get current user info
          $http({method:'GET',url: '/users/getInfo',params:{email: $scope.emails}})
            .success(function(data,status,header,config){
              $scope.currentUser = data[0];
              //get schedules
              $http({method:'GET',url:'/schedules'}).success(function(data,status,header,config){
                $scope.schedules = data;
                angular.forEach($scope.schedules,function(obj){
                  var c = obj.join;
                  d = new Date(obj.date.toString());
                  obj.month =d.getMonth()+1;
                  obj.year = d.getFullYear();
                  obj.day = d.getDate();
                  obj.attending = false;
                  obj.total = obj.join.length;
                  c.forEach(function(entry){
                    if (entry.email==$scope.currentUser.email){
                      obj.attending = true;
                    }
                  });
                });
              }).error(function(){
                alert("Server is down, try again later");
              })

            })
            .error(function(){
              alert("Server is down, try again later");
            })

          $scope.save = function(){
            //if(!$scope.newSchedule || $scope.newSchedule.length < 1) return;
            var schedule = new Schedules({ name: $scope.newTitle,date: $scope.newDate,note:$scope.newNote,complete:false,join: [],rider:initRider});
            schedule.$save(function(){
              $scope.schedules.push(schedule);
              $scope.newSchedule = '';
              $scope.newDate = '';
              $scope.newNote='';
              window.location.reload();
            });
          }
          
          $scope.update = function(index){
            var schedule = $scope.schedules[index];
            schedule.date = $scope.schedules[index].newDate;
            Schedules.update({id: schedule._id}, schedule);
            schedule.month =schedule.date.getMonth()+1;
            schedule.year = schedule.date.getFullYear();
            schedule.day = schedule.date.getDate();
           // console.log(schedule.month);
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
              var indexLength = schedule.join.length;
              var lat, lng, address;
              schedule.join.push({user:$scope.currentUser.name,email:$scope.currentUser.email,address:$scope.currentUser.email, lat:$scope.currentUser.lat, lng:$scope.currentUser.lng});
              Schedules.update({id: schedule._id}, schedule);
              window.location.reload();
          }
          
          $scope.reset = function(index){
              var schedule = $scope.schedules[index];
              var indexLength = schedule.join.length;
              var lat, lng, address;
              var isExist = false;
              var index = 0;
              for (var i = 0; i < indexLength; i++)
              {
                  if(schedule.join[i].email == $scope.currentUser.email){
                    index = i;
                    isExist = true;
                  } 
              }
              if (isExist){
                schedule.join.splice(index,1);
                Schedules.update({id: schedule._id}, schedule);
                window.location.reload();
              }
          }
          
          $scope.finalize = function(index){
            $http({method:'POST',url: '/calculate',data:{_id: $scope.schedules[index]._id}})
            .success(function(data,status,header,config){
              window.location.href="/#/ride/"+$scope.schedules[index]._id;
            })
            .error(function(){
              alert("Server is down, try again later");
            })
          }

          $scope.view = function(index){
              window.location.href="/#/ride/"+$scope.schedules[index]._id;
          }

          $scope.infoSave = function(){
            if(!$scope.newAddress || $scope.newAddress.length < 1) return;
            //GEOCODE
            var api = "AIzaSyA-G6dLv9YHY-_HE7W87Dw-IjdE17mb3pQ";
            var url= "https://maps.googleapis.com/maps/api/geocode/json?address="+$scope.newAddress+"&key="+api;
            $http({ method: 'GET', url: url})
                .success(function (data, status, header, config) {
                  if (data["status"]!="OK"){
                    alert("Address not valid");
                    window.location.reload();
                  }
                  var lat = data["results"][0]["geometry"]["location"]["lat"];
                  var lng = data["results"][0]["geometry"]["location"]["lng"];
                  Users.update({id:$scope.currentUser._id},{address:$scope.newAddress,lat:lat,lng:lng})
                  window.location.reload();
                })
                .error(function () {
                    alert("Server is down, try again later");
                    window.location.href="/";
                }) 
          }
          var loc = {
            "eb": {"addr":"East Bank","lat": 44.973341,"lng": -93.226496},
            "wb": {"addr":"West Bank","lat": 44.972896,"lng": -93.246517},
            "dt": {"addr":"Dinky Town","lat": 44.980135,"lng": -93.235767}
          }
          var locChange = {
          }
          $scope.saveRider = function(){
            var indexOfParent = $('#addRideIndexValue').val();
            var curSchedule = $scope.schedules[indexOfParent];
            curSchedule.rider.push({name: $scope.newRide,loc: loc[$scope.newLoc].addr, lat: loc[$scope.newLoc].lat,lng: loc[$scope.newLoc].lng,max: $scope.newCapacity,taking:[]});
            Schedules.update({id: curSchedule._id}, curSchedule);
            $scope.newRide="";
            $scope.newLoc="";
            $scope.newCapacity="";
          }

          $scope.updateRide = function(parentIndex,index){
            var schedule = $scope.schedules[index];
            Schedules.update({id: schedule._id}, schedule);
            $scope.editRide[index] = false;
          }

          $scope.editRide = function(parentIndex,index){
           // console.log(parentIndex+" "+index);
            $scope.editRide[parentIndex]=[];
            $scope.editRide[parentIndex][index] = angular.copy($scope.schedules[parentIndex].rider[index]);
          }

          $scope.cancelRide = function(parentIndex,index){

            $scope.schedules[parentIndex].rider[index] = angular.copy($scope.editRide[parentIndex][index]);
            $scope.editRide[parentIndex][index] = false;
          }

          $scope.removeRide = function(parentIndex,index){
            var schedule = $scope.schedules[parentIndex];
            schedule.rider.splice(index,1);
            Schedules.update({id: schedule._id}, schedule);
          }
        }]);
   
    app.controller('UserController', ['$scope', 'Users', '$cookies','$http',function ($scope, Users, $cookies,$http) {
          $scope.editing = [];
          $scope.users = Users.query();
          $scope.user = $cookies.get('user');
          $scope.emails = $cookies.get('email');
          if ($cookies.get("isNew")!='true'){
            window.location.href='/';
          }

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
                    $http({method:'POST',url:'/removeCookie'})
                      .success(function(data,status,header,config){
                      window.location.href="/";
                    }).error(function(){
                      alert("server is down");
                    })
                   
                  });
                })
                .error(function () {
                    alert("Server is down, try again later");
                    window.location.href="/";
                })
            
          }
        }]);
  
  app.controller('rideController',['$scope','$routeParams','$cookies','$http',function($scope,$routeParams,$cookies,$http){
    $scope.riders;
    $http({method:'GET',url: '/calculate/grab',params:{_id: $routeParams.schedule}})
            .success(function(data,status,header,config){
                if (data=='fail'){
                  alert("does not exist");
                  window.location.href="/";
                }
                else {
                  $scope.riders = JSON.parse(data);
                }

            })
            .error(function(){
              alert("Server is down, try again later");
            })

      $scope.goBack = function(){
        window.location.href="/#/";
      }
  }]);

  app.controller('manageController',['$scope','$cookies','$http','Schedules',function($scope,$cookies,$http,Schedules){
    $scope.schedules=[];
    $http({method:'GET',url:'/getAllSchedules'})
      .success(function(data,status,header,config){
        $scope.schedules=data;
        angular.forEach($scope.schedules,function(entry){

          var d = new Date(entry.date.toString());
          var mon = d.getMonth()+1;
          var dates = d.getFullYear()+"-"+mon+"-"+d.getDate();
          entry.dates = dates;
        })
      })
      .error(function(){
        alert("Server is down, try again later");
      })
      $scope.remove = function(index){
          var schedule = $scope.schedules[index];
          Schedules.remove({id: schedule._id}, function(){
          $scope.schedules.splice(index, 1);
        });
      }

      $scope.goBack = function(){
        window.location.href="/#/";
      }

      $scope.goView = function(index){
        window.location.href = "/#/ride/"+$scope.schedules[index]._id;
      }

  }]);


})();



