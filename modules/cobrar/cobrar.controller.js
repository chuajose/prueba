var cobrarCtrl = function ($scope, store, $ionicListDelegate) {
    'use strict';


};

var cobrarPendientesCtrl = function ($scope, store, $ionicListDelegate, Pedidos) {
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
        datosPedidos.estado = "pendientes";
        var pedidos = Pedidos.get(datosPedidos);

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
            } else {
                $scope.sinDatos = true;
            }

            $scope.total_pedidos = obj.total;

            $scope.cargando = false;
        });

    };

    $scope.$on('$stateChangeSuccess', function () {
        //$scope.getPendientes();
    });

    $scope.$on('$ionicView.enter', function () {
        console.log('entro pendientes');
        $scope.cargando = false;
        $scope.pagina = 0;
        $scope.pedidos = {};
        $scope.getPendientes();
    });
};

var cobrarHistoricoCtrl = function ($scope, store, $ionicListDelegate, Pedidos) {
    'use strict';
    $scope.pedidos = {};
    $scope.totalPaginas = 0;
    $scope.total_pedidos = 0;
    $scope.pedidos = [];
    $scope.cargarMasDatosPendientes = false;
    $scope.sinDatos = false;
    $scope.pagina = 0;
    $scope.cargando = false;
    var pagina = 0,
        datosPedidos = {};



    $scope.getHistorico = function () {
        $scope.cargando = true;
        datosPedidos.pagina = $scope.pagina;
        datosPedidos.estado = "";
        var pedidos = Pedidos.get(datosPedidos);

        pedidos.then(function (obj) {

            pagina++;

            if (obj.total > 0) {

                $scope.pagina = pagina * parseInt(10);
                $scope.totalPaginas = parseInt(obj.total);
                console.log($scope.pagina);
                console.log($scope.totalPaginas);

                if ($scope.pagina > $scope.totalPaginas) {

                    $scope.cargarMasDatosPendientes = false;

                } else {

                    $scope.cargarMasDatosPendientes = true;

                }

                Array.prototype.push.apply($scope.pedidos, obj.solicitudes);
                $scope.$broadcast('scroll.infiniteScrollComplete');


                //  $scope.pedidos = obj.solicitudes;
            } else {
                $scope.sinDatos = true;
            }
            $scope.total_pedidos = obj.total;

            $scope.cargando = false;
        });

    };

    $scope.$on('$stateChangeSuccess', function () {
        //$scope.getPendientes();
    });

    $scope.$on('$ionicView.enter', function () {
        $scope.cargando = false;
        $scope.pagina = 0;
        $scope.pedidos = {};
        $scope.getHistorico();
    });
};
var cobrarFiltrarCtrl = function ($scope, store, $ionicListDelegate, $filter, Pedidos) {
    'use strict';
    var pedidos = {},
        datosPedidos = {},
        d = new Date(),
        pagina = 0;

    d = $filter('date')(d, 'dd/mm/yyyy');
    $scope.pedidosB = {};
    $scope.pedidosB.desde = new Date(2014, 10, 1);
    $scope.pedidosB.hasta = new Date();
    $scope.pedidosB.importe_inicial = 0;
    $scope.pedidosB.importe_final = 0;
    $scope.cargando = false;
    $scope.sinDatos = false;
    $scope.pagina = 0;
    $scope.cargarMasDatos = false;
    $scope.pedidos = [];
    $scope.totalPaginas = 0;

    $scope.enviarBusqueda = function () {
        $scope.pedidos = [];
        $scope.pagina = 0;
        pagina = 0;
        $scope.enviarBusquedaMas();

    };

    $scope.enviarBusquedaMas = function () {
        $scope.cargando = true;


        var fecha_i = new Date($scope.pedidosB.desde),
            fecha_f = new Date($scope.pedidosB.hasta);

        datosPedidos.fecha_i = fecha_i.valueOf() / 1000;
        datosPedidos.fecha_f = fecha_f.valueOf() / 1000;
        datosPedidos.importe_i = $scope.pedidosB.importe_inicial;
        datosPedidos.importe_f = $scope.pedidosB.importe_final;

        datosPedidos.pagina = $scope.pagina;
        datosPedidos.estado = "";
        var filtrarPedidos = Pedidos.post(datosPedidos);

        filtrarPedidos.then(function (obj) {

            pagina++;
            $scope.pagina = pagina * parseInt(10);
            $scope.totalPaginas = parseInt(obj.total);

            if ($scope.pagina > $scope.totalPaginas) {
                $scope.cargarMasDatos = false;
            } else {
                $scope.cargarMasDatos = true;
            }

            Array.prototype.push.apply($scope.pedidos, obj.solicitudes);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            //   $scope.pedidos = obj.solicitudes;

            $scope.cargando = false;
            if (obj.total == 0) $scope.sinDatos = true;


        });
        //$scope.$broadcast('scroll.infiniteScrollComplete');
    };



    $scope.$on('$stateChangeSuccess', function () {
        // $scope.enviarBusqueda();
    });

    //$scope.pedidos = [];

};

var cobrarVerPedidoCtrl = function ($scope, store, $ionicListDelegate, $ionicLoading, Pedido, Camara, $stateParams, Imagen) {
    'use strict';
    $scope.imagenes = [];
    $scope.pedido = {};
    $scope.cargando = false;
    $ionicLoading.show({
        template: 'Loading...',
        noBackdrop: true
    });
   // console.log(LocalFileSystem.TEMPORARY);
    //$scope.pedido.Valoracion = 0;
    var getPedido = function getPedido () {

        var pedido = Pedido.get($stateParams.id);

        pedido.then(function (obj) {
            $scope.pedido = obj.solicitud;
            $scope.pedido.Valoracion = obj.solicitud.Valoracion / 10;

            if(obj.solicitud.Fichero.Id){
                $scope.imagenes.push(obj.solicitud.Fichero.Url_medium);
            }
            $scope.cargando = true;
            $ionicLoading.hide();
        });
    }


    $scope.valorarPedido = function (e) {
        if ($scope.pedido.Valoracion == 0) {
            var datosPedido = {};
            datosPedido.id = $stateParams.id;
            datosPedido.valoracion = parseInt(e) * 10;
            datosPedido.id_vendedor = $scope.pedido.Vendedor.Id;
            var pedidoValoracion = Pedido.valorar(datosPedido);

            pedidoValoracion.then(function (obj) {
                $scope.pedido.Valoracion = e;
                /*$scope.pedido = obj.solicitud;

                $scope.cargando = true;
                $ionicLoading.hide();*/
            });
        } else {
            window.plugins.toast.showShortCenter('El pedido ya había sido valorado');
            console.log('Pedido ya valorado, no se puede volver a valorar' + e);
        }
    };

    $scope.camara = function (e) {
        $scope.imagenURL="";
        var onUploadSuccess = function (imageData) {
            console.log(imageData);
            $scope.imagen = $scope.imagenURL;
            $scope.$apply();
            $scope.pedido.Fichero.Id=true;
            /* $scope.picData = "data:image/jpeg;base64," +imageData;
             $scope.$apply();*/
            $scope.$apply()
        };
        var onUploadFail = function (err) {
             console.log(err);
            $scope.pedido.Fichero.Id=false;$scope.$apply()
        };

        var optionsImagen = {};
        optionsImagen.quality = 100;
        optionsImagen.targetWidth = 520;
        optionsImagen.targetHeight = 520;
        optionsImagen.saveToPhotoAlbum = false;
        if (e == 'file') optionsImagen.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
        Camara.get(optionsImagen).then(function (imageURI) {

        $scope.imagenURL = imageURI;

            $scope.imagenes.push($scope.imagenURL);

            var options = new FileUploadOptions();
            options.fileKey = "post";
            options.chunkedMode = false;
            options.httpMethod = "POST";

            var params = {};
                params.id_solicitud = $stateParams.id;

            options.params = params;

            options.headers = { 'Authorization' :  localStorage.getItem('token') };
            var trustHosts = true
            var ft = new FileTransfer();

            ft.upload(imageURI, encodeURI("https://sandbox.trocobuy.com/api/v1/pedidos/subir"), onUploadSuccess, onUploadFail, options,trustHosts);
            $scope.pedido.Fichero.Id=true;

        }, function (err) {
            console.log(err);
        });
    }
    $scope.openImagen = function(img){

        var imagenObj = {};
        imagenObj.url = img;
        imagenObj.nombre = $scope.pedido.Fichero.Nombre;
        Imagen.get(imagenObj).then(function(result){
            console.log(result);
            //window.open(result.nativeURL, '_blank', 'location=yes');
        });

        //window.open(ruta.nativeURL, '_blank', 'location=yes');
    }

    $scope.$on('$ionicView.enter', function(event, data) {

        getPedido();
       /* var pedido = Pedido.get($stateParams.id);

        pedido.then(function (obj) {
            $scope.pedido = obj.solicitud;
            $scope.pedido.Valoracion = obj.solicitud.Valoracion / 10;

            if(obj.solicitud.Fichero.Id){
                $scope.imagenes.push(obj.solicitud.Fichero.Url_medium);
            }
            $scope.cargando = true;
            $ionicLoading.hide();
        });*/


});

    /*
    function downloadAsset(){
        var fileTransfer = new FileTransfer();
        console.log("About to start transfer");
        fileTransfer.download(img, store + $scope.pedido.Fichero.Nombre,
            function(entry) {
                console.log("Success!");
            },
            function(err) {
                console.log("Error");
            });
        }*/

};

var cobrarDevolucionCtrl = function ($scope, store, $ionicListDelegate, $ionicLoading, $stateParams, Pedido) {
    'use strict';
    var datosPedido = {};
    $scope.acciones = true;
    $scope.pedido = false;
    $scope.cargando = false;
    $scope.devolucionAcciones = true;
    $scope.devolucionMotivos = false;
    $scope.devolucionFinalizada = false;

    /*
     Realizamos la valoración del pedido
    */
    $scope.valorarPedido = function (e) {

        datosPedido.id = $stateParams.id;
        datosPedido.valoracion = parseInt(e) * parseInt(2);

        var valorarPedido = Pedido.valorar(datosPedido);

        valorarPedido.then(function (obj) {

            $scope.pedido = obj.solicitud;

            $scope.cargando = true;
            $ionicLoading.hide();

        });
    };

    /*
     Mostramos los motivos posibles para una devolucion
    */
    $scope.mostrarMotivos = function (e) {
        $scope.devolucionAcciones = false; //Ocultamos la capa de acciones
        $scope.devolucionMotivos = true; //Mostramos la acapa de movitivos
    };

    /*
     Ejecutamos la devolución del pedido
    */
    $scope.enviarDevolucion = function (motivo) {

        $ionicLoading.show({
            template: 'Loading...',
            noBackdrop: true
        });

        var datosPedido = {};
        datosPedido.id = $stateParams.id;
        datosPedido.tipo = motivo.id;
        datosPedido.motivo = motivo.motivoDevolucion;

        var pedido = Pedido.devolucion(datosPedido); //Enviamos un put a api/v1/pedidos/pedido con el id de l pedido, el tipo de devolucion y el motivo expuesto

        pedido.then(function (obj) {

            $scope.pedido = obj.solicitud;
            $scope.cargando = true;
            $ionicLoading.hide();
            $scope.devolucionAcciones = false; //ocultamos la capa de acciones
            $scope.devolucionMotivos = false; //ocultamo la capa de motivos
            $scope.devolucionFinalizada = true; //mostramos la capa de ok
        });
    };


    /*
     Cargamos los datos del pedido
    */

    var cargarPedido = function () {

        $ionicLoading.show({
            template: 'Loading...',
            noBackdrop: true
        });

        var pedido = Pedido.get($stateParams.id);

        pedido.then(function (obj) {

            $scope.pedido = obj.solicitud;

            $scope.cargando = true;

            $ionicLoading.hide();

        });

    };

    //cargarPedido();
    $scope.$on('$ionicView.enter', function(event, data) {

        cargarPedido();

    });

};
angular.module('starter.cobrar')
    .controller('cobrarCtrl', cobrarCtrl)
    .controller('cobrarPendientesCtrl', cobrarPendientesCtrl)
    .controller('cobrarHistoricoCtrl', cobrarHistoricoCtrl)
    .controller('cobrarFiltrarCtrl', cobrarFiltrarCtrl)
    .controller('cobrarVerPedidoCtrl', cobrarVerPedidoCtrl)
    .controller('cobrarDevolucionCtrl', cobrarDevolucionCtrl);
