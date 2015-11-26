(function () {
    var app = angular.module('tool', ['ngCookies']);
    app.controller('loginController',['$scope','$http','$cookies','$rootScope',function($scope,$http,$cookies,$rootScope){
        $scope.callfun = function(name,email){
            $http({ method: 'POST', url: '/login', data: {user: name,email: email}})
            .success(function (data, status, header, config) {

                console.log($cookies.getAll());
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
        }

        $scope.isLoggedIn = function () {
            return $cookies.get("loggedIn") == 'true';
        }

    }]);

})();