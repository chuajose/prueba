angular.module('starter.qr')
.controller('qrCtrl', [ '$scope', '$state', '$stateParams', '$ionicNavBarDelegate', 'Qr', function($scope, $state, $stateParams, $ionicNavBarDelegate, Qr) {
    'use strict';
    $scope.cargando = true;
    $scope.$on('$ionicView.enter', function(){
        ionic.DomUtil.ready(function(){
            var id = $stateParams.id;
            $scope.url_qr = '';
            var suCcessQr = function(dataSuccess){
                console.log('Ctrl', dataSuccess);
                $scope.url_qr = dataSuccess;
                $scope.cargando = false;
            }
            var errorQr = function(dataError){
                console.log('Ctrl', dataError);
            }
            Qr.showQr(id).then(suCcessQr, errorQr);

        });
    });
}])
