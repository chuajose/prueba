angular.module('starter.controller')
    .controller('appCtrl', [ '$scope', '$stateParams', '$ionicScrollDelegate', '$ionicSideMenuDelegate', '$ionicNavBarDelegate', '$window', 'store', '$state', 'Geoloc', function($scope, $stateParams, $ionicScrollDelegate, $ionicSideMenuDelegate, $ionicNavBarDelegate, $window, store, $state, Geoloc){

        var resizeFn = function(){
            $scope.heightW = Math.round(window.innerHeight/2);
        }

        resizeFn();

        angular.element($window).bind('resize', function(){
            $scope.$apply(resizeFn());
        });

        $scope.appClose = function(){
            ionic.Platform.exitApp();
        }

        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.logout = function () {
            store.remove('token');
            $state.go('login');

        }

        /*$scope.setNavTitle = function(title) {
            $ionicNavBarDelegate.title(title);
        }*/
        // var response = Geoloc.updateMarker();

    }]);
