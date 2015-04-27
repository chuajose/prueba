(function () {
    'use strict';
    angular.module('starter.inicio')

        .controller('inicioCtrl', ['$scope', 'usersService', '$state' , '$cordovaBarcodeScanner', '$rootScope', '$ionicLoading', function ($scope, usersService, $state, $cordovaBarcodeScanner, $rootScope, $ionicLoading) {
            $scope.codigo_comercio_pagar = {};

            $scope.$on('$ionicView.loaded', function () {
                // Se calculan los tamaños para centrar
                var divPagar = document.getElementById('pagarFooter'),
                    divCobrar = document.getElementById('cobrarFooter'),
                    height = window.innerHeight;
                $scope.heightPagar = Math.round(height / 2) - divPagar.offsetHeight + 5;
                $scope.heightCobrar = height - $scope.heightPagar - divPagar.offsetHeight - divCobrar.offsetHeight + 15;
            });
            $scope.$on('$ionicView.enter', function () {
                $scope.codigo_comercio_pagar.id = '';
                //Recargamos al usuario
                var user = usersService.getUser();
                user.then(function (data) {
                    $rootScope.myUser = data;
                });
            });
            var getUserById = function getUserByCode(id){
                var user = {};
                if(parseInt($rootScope.myUser.Id) === id) {
                    window.plugins.toast.showShortCenter('El código introducido es el tuyo.');
                } else {
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    if(id){
                        user = usersService.getUser(id);
                        user.then(function (data) {
                            $ionicLoading.hide();
                            $state.go('index.pagar_empresa_ver',{id: angular.toJson(data), pago: 1});
                        }, function (error) {
                            $ionicLoading.hide();
                            window.plugins.toast.showShortCenter(error);
                        });
                    } else {
                        $ionicLoading.hide();
                        window.plugins.toast.showShortCenter('Código de comercio incorrecto');
                    }
                }
            }
            $scope.pagarGoDirect = function(){
                //Se emite un pago a un codigo de comercio
                var id = 0;
                 //comprobamos que el formu este ok y que el codigo comercio no sea el nuestro
                if ($scope.codigo_comercio_pagar.id)
                {
                    //transformamos el ccomercio introducido por la id del cliente
                    id = usersService.getUserByCommerceCode($scope.codigo_comercio_pagar.id);
                    getUserById(id);
                }
            }

            $scope.scannerQr = function (){
                var scanSuccess = function (barcodeData) {

                    var id_str = barcodeData.text;
                    var obj    = JSON.parse(id_str);
                    var id     = obj.id;

                    getUserById(id);
                };
                var scanError = function (barcodeDataError) {
                    console.log('scan error', barcodeDataError);
                }

                $cordovaBarcodeScanner.scan().then(scanSuccess, scanError);

            }

        }]);
}());
