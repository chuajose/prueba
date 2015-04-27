angular.module('starter.devoluciones')
.controller('devolucionesCtrl', function($scope, Devoluciones) {
  console.log('devolucionesCtrl');
    'use strict';
    $scope.pedidos = {};
    $scope.totalPaginas = 0;
	$scope.total_pedidos = 0;
	$scope.pedidos = [];
    $scope.cargarMasDatosPendientes = false; //Mostrar el scroll infinicto cuando es true
    $scope.pagina = 0;
	$scope.cargando = false;
    $scope.sinDatos = false; //Mostrar mensaje sin resultados cuando es true
    var pagina = 0,
        datosPedidos = {};

    console.log('entro en pendientes');
   /* window.plugins.toast.show('Cargando datos', 'long', 'center', function(a){
        console.log('toast success: ' + a)
    }, function(b){
        alert('toast error: ' + b)}
    );*/
	$scope.getPendientes = function () {
        $scope.cargando = true;

        datosPedidos.pagina = $scope.pagina;
        var pedidos = Devoluciones.get(datosPedidos);

        pedidos.then(function (obj) {

            pagina++;

            if (obj.total > 0) {

                $scope.pagina = pagina * parseInt(10);
                $scope.totalPaginas = parseInt(obj.total);

                if ($scope.pagina > $scope.totalPaginas) {

                    $scope.cargarMasDatosPendientes = false;

                } else {

                    $scope.cargarMasDatosPendientes = true;

                }

                Array.prototype.push.apply($scope.pedidos, obj.solicitudes);
                $scope.$broadcast('scroll.infiniteScrollComplete');


              //  $scope.pedidos = obj.solicitudes;
            }else{
                $scope.sinDatos = true;
            }

            $scope.total_pedidos = obj.total;

            $scope.cargando = false;
        });

    };

    $scope.$on('$stateChangeSuccess', function () {
        //$scope.getPendientes();
    });

     $scope.$on('$ionicView.enter', function(){
         console.log('entro pendientes');
        $scope.cargando = false;
        $scope.pagina = 0;
        $scope.pedidos = {};
        $scope.getPendientes();
     });
})
