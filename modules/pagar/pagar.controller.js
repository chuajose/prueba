var pagarCtrl = function ($scope, store, $ionicListDelegate, $ionicNavBarDelegate, $ionicTabsDelegate, Pagar) {
    'use strict';
    /*$scope.$on('$ionicView.enter', function () {
        $scope.empresasFavoritasStorage = store.get('empresasFavoritasStorage') || [];
    });
    .controller('TabsCtrl', function($scope, $ionicTabsDelegate) {
  $scope.goHome = function() {
    console.log($ionicTabsDelegate.$getByHandle('my-tabs'));
    console.log($ionicTabsDelegate.$getByHandle('my-tabs').selectedIndex());
    $ionicTabsDelegate.$getByHandle('my-tabs').select(0);

  }
})*/
};

var map = false;
var pagarCercanosCtrl = function ($scope, Geoloc, store, $ionicScrollDelegate, $ionicListDelegate, $timeout, Pagar, $ionicLoading, $rootScope) {
     'use strict';
    var position = store.get('position') || {
                        lat: 0,
                        lng: 0,
                        zoom: 14,
                    },
        local_icons_per = Geoloc.getIcon(),
        timer = false,
        marcas = {},
        collectionMarkers = [],
        i = 0,
        user = store.get('my_user'),
        db;

    if (!position.zoom) position.zoom = 14;

    if (map) {
        var div_map = document.querySelector('#map_canvas._gmaps_cdv_');
        map.remove();
        if (div_map) div_map.remove();
    }

    var onMapReady = function onMapReady() {

        var onSuccess = function (location) {

            position.lat = location.latLng.lat;
            position.lng = location.latLng.lng;
            store.set('position', position);
            //Comentado porque al mover la camara hace una nueva llamada al omMapCameraChange con lo cual hacia de inicio 3 cargas
            /*
            var my = new plugin.google.maps.LatLng(location.latLng.lat, location.latLng.lng);
            map.animateCamera({
                'target': my,
                'tilt': 0,
                'zoom': position.zoom,
                'bearing': 0
            });
            //setMarkers();*/
        };
        var onError = function (msg) {
            console.log(msg);
            position.lat = user.Geoposicion.lat;
            position.lng = user.Geoposicion.lng;
        };

        map.getMyLocation(onSuccess, onError);
    };

    var onMapCameraChanged = function onMapCameraChanged(positionChanged) {
        var changed = true;
        if (positionChanged.zoom > position.zoom && position.lat == positionChanged.target.lat && position.lng == positionChanged.target.lng) {
            changed = false;
        }
        position.zoom = positionChanged.zoom;
        // position.lat = positionChanged.target.lat;
        // position.lng = positionChanged.target.lng;

        //Selecionamos los rangos de lat lng de la pantalla
        map.getVisibleRegion(function (latLngBounds) {
            position.northeast = latLngBounds.northeast.toUrlValue();
            position.southwest = latLngBounds.southwest.toUrlValue();
        });

        store.set('position', position);

        if (changed) {

            if(position.zoom > 8) {
            setMarkers();
            } else {
                window.plugins.toast.showShortBottom('Necesitas hacer zoom para ver mas empresas');
            }
        }
    };

    var onCreateMarker = function onCreateMarker (marker){

        marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, function (event) {

            event.getPosition(function (latLng) {
                map.animateCamera({
                    'target': latLng,
                    'zoom': position.zoom,
                    'duration': 500
                });
            });

        });
    }


    var initMap = function initMap() {

        var div = document.getElementById('map_canvas'),
            params = {},
            currentView = document.querySelector('ion-view[nav-view="active"]');

        if (position.lat && position.lng) {
            var latLng = new plugin.google.maps.LatLng(position.lat, position.lng);
            params = {
                'camera': {
                    'latLng': latLng,
                    'tilt': 0,
                    'zoom': position.zoom
                },
                'controls': {
                    'compass': true,
                    'myLocationButton': true,
                    'indoorPicker': true,
                    // 'zoom': true // Only for Android
                },
            }
        }

        map = plugin.google.maps.Map.getMap(div, params);
        // Wait until the map is ready status.
        map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);

        map.on(plugin.google.maps.event.CAMERA_CHANGE, onMapCameraChanged);

        div.classList.add("map-active");

        $scope.setClickeable = function(bool){
            map.setClickable(bool);
        };

    };

    var setMarkers = function setMarkers() {

        console.log(position.zoom);

        //Si es la primera ver que se llama, se carga si tiempo de Retraso
        if (i == 0) {
            var timeDelay = 1;
        } else {// Sino esperamos un segundo para cargarlo

            var timeDelay = 1000;
        }

        $scope.cargando = true;

        if (timer) {
            $timeout.cancel(timer);
        }

        timer = $timeout(function () {

            var response = Geoloc.get(position);

            response.then(function (obj) {

                 var marcas = obj.marcas, //Recogo el listado de empresas
                    yolatLng = new plugin.google.maps.LatLng(position.lat, position.lng);//Recogo el objeto de mi posicion para calcular el disanceTo

               // map.clear();

                /*
                Recorremos todas las marcars para calcular su distancia respecto a la posicion del usuario
                 */

                for (var i = 0; i < marcas.length; i++) {

                    var marca = marcas[i],
                        sector = marcas[i].sector,
                        //loc             = new L.LatLng(marca.lat, marca.lng),
                        latLng = new plugin.google.maps.LatLng(marca.lat, marca.lng),
                        lat = marcas[i].lat,
                        lng = marcas[i].lng,
                        icon = local_icons_per[sector] || 'blue';

                    var existe = collectionMarkers.indexOf(marcas[i].id);

                    if(existe == -1){

                        map.addMarker({
                            position: latLng,
                            icon: icon,
                            title: marca.razon_social,
                            snippet: marcas[i].direccion + "\n" + marcas[i].actividad,
                            disableAutoPan: true
                        }, function (marker) {

                            onCreateMarker(marker);
                            //collectionMarkers.push(marcas[i].id);

                        });
                        collectionMarkers.push(marcas[i].id);
                    }

                    marcas[i].distancia = Geoloc.distance(yolatLng, latLng) / 1000;



                };

                $scope.markers = marcas; //Envio las empresas al scope
                $scope.cargando = false;
            });

            i++;

        }, timeDelay);

    }

    $scope.marcar = function marcar (id, p) {
        var sector = $scope.markers[id].sector + '_hover',
            LatLng = new plugin.google.maps.LatLng($scope.markers[id].lat, $scope.markers[id].lng);

        map.setCenter(LatLng);
        map.addMarker({
            position: LatLng,
            icon: local_icons_per[sector] || 'green',
            title: $scope.markers[id].razon_social,
            snippet: $scope.markers[id].direccion + "\n" + $scope.markers[id].actividad
        }, function (marker) {

            marker.showInfoWindow();

        });
        $ionicScrollDelegate.scrollTop(true); //Vamos al top de la pagina

    }

     $scope.$on('$ionicView.enter', function () {
        initMap();
    });

}


var pagaRecientesCtrl = function($scope, store, Pagar, $ionicListDelegate, usersService, Geoloc){
    'use strict';
    /*-listado de empresas-*/
    $scope.empresasRecientes = [];

    var empresas_recientes = function (position) {
        $scope.MoreItemsAvailable = false;
        $scope.empresasRecientes = [];
        var pagina = 1;
        var empresasRec = [];
        var empresa = {};
        var mi_position = new plugin.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var empresa_position = {};
        var distancia = 0;
        var max = 10;
        var length = $scope.empresasRecientesStorage.length;
        var ids = [];

        $scope.loadMore = function (pagina) {
            ids = [];
            $scope.MoreItemsAvailable = false;
            if ((pagina * max) < length) $scope.MoreItemsAvailable = true;

            if (max < length) {
                for (var i = pagina * max; i < i + max; i++) {
                    if (i > length) break;
                    ids.push($scope.empresasRecientesStorage[i]);
                }
            } else ids = $scope.empresasRecientesStorage;

            usersService.getUsers(ids).then(function (data) {
                $scope.cargando = false;
                //console.log(data);
                for (var i = 0; i < data.length; i++) {
                    empresa = {};
                    empresa.Id = data[i].Id;
                    empresa.Razon_social = data[i].Razon_social;
                    empresa.Obligacion_venta = data[i].Obligacion_venta.Cantidad;
                    empresa.Valoracion = data[i].Valoracion;
                    empresa.actividad = data[i].Sector.Nombre;
                    empresa_position = new plugin.google.maps.LatLng(data[i].Geoposicion.lat, data[i].Geoposicion.lng);
                    empresa.distancia = Geoloc.distance(mi_position, empresa_position) / 1000;
                    $scope.empresasRecientes.push(empresa);
                };
                $scope.pagina++;
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };
        $scope.loadMore(pagina);
    };


    var onErrorGRPS = function (error) {
        alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
    };

    $scope.$on('$ionicView.enter', function () {

        $scope.cargando = true;
        $scope.empresasFavoritasStorage = store.get('empresasFavoritasStorage') || [];
        $scope.empresasRecientesStorage = store.get('empresasRecientesStorage') || [];

        if ($scope.empresasRecientesStorage.length < 1) {
            var user = store.get('my_user');
            var id = user.Id;
            var result = '';
            Pagar.getEmpresasRecientes(id).then(function () {
                $scope.empresasRecientesStorage = store.get('empresasRecientesStorage');
                //console.log($scope.empresasRecientesStorage);

                if($scope.empresasRecientesStorage)
                {
                    if(!map)
                    {
                        map = plugin.google.maps.Map.getMap();
                        map.getMyLocation(empresas_recientes, onErrorGRPS);
                    }
                    //$cordovaGeolocation.getCurrentPosition({enableHighAccuracy: true}).then(empresas_recientes, onErrorGRPS);
                    //navigator.geolocation.getCurrentPosition(empresas_recientes, onErrorGRPS, {enableHighAccuracy: true});
                } else {
                    $scope.empresasRecientes = false;
                    $scope.cargando = false;
                }
            });

        }
        else
        {
            if(!map)
            {
                map = plugin.google.maps.Map.getMap();
                map.getMyLocation(empresas_recientes, onErrorGRPS);
            }
            //navigator.geolocation.getCurrentPosition(empresas_recientes, onErrorGRPS, {enableHighAccuracy: true});
        }
    });

    /*-añado ids de las empresas favoritas a la memoria cache-*/
    $scope.AddEmpresaFavorita = function (id, empresasFavoritasStorage) {
        if (empresasFavoritasStorage.length > 19) alert('20 son lo máximo');
        else {
            $scope.empresasFavoritasStorage = Pagar.AddEmpresaFavorita(id, empresasFavoritasStorage)
        }

        $ionicListDelegate.closeOptionButtons();
    }


}


var pagarFavoritosCtrl = function($scope, store, $ionicListDelegate, usersService, Geoloc){
    'use strict';
    /*--
        listado de empresas favoritas
        consigo sus ids de la cache de memoria y luego busco en la API
    -*/


    $scope.$on('$ionicView.enter', function () {
        $scope.cargando = true;
        $scope.empresasFavoritas = [];
        $scope.empresasFavoritasStorage = store.get('empresasFavoritasStorage') || [];

        if ($scope.empresasFavoritasStorage.length > 1) {
            var onErrorGRPS = function (error) {
                alert('code: ' + error.code + '\n' +
                    'message: ' + error.message + '\n');
            };

            var empresas_favoritas = function (position) {

                    var successUser = function (successData) {
                        var empresa = {};
                        var empresa_position = {};
                        var mi_position = new plugin.google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                        for (var i = 0; i < successData.length; i++) {
                            empresa = {};
                            empresa.Id = successData[i].Id;
                            empresa.Razon_social = successData[i].Razon_social;
                            empresa.Obligacion_venta = successData[i].Obligacion_venta.Cantidad;
                            empresa.Valoracion = successData[i].Valoracion;
                            empresa.actividad = successData[i].Sector.Nombre;
                            empresa_position = new plugin.google.maps.LatLng(successData[i].Geoposicion.lat, successData[i].Geoposicion.lng);
                            empresa.distancia = Geoloc.distance(mi_position, empresa_position) / 1000;
                            $scope.empresasFavoritas.push(empresa);
                        };
                        $scope.cargando = false;
                    }
                    var errorUser = function (errorData) {
                        $scope.cargando = false;
                    }
                    usersService.getUsers($scope.empresasFavoritasStorage).then(successUser, errorUser);
                }
                /*-fin empresas favoritas-*/

            if(!map)
            {
                map = plugin.google.maps.Map.getMap();
                map.getMyLocation(empresas_favoritas, onErrorGRPS);
            }

        } else {
            $scope.cargando = false;
        }


    });

    /*--
        quito ids de las empresas favoritas a la memoria cache
        quito la empresa del array de empresas favoritas del escope
    -*/
    $scope.deleteEmpresaFavorita = function (id, $index) {
        for (var i = 0; i < $scope.empresasFavoritasStorage.length; i++) {
            if ($scope.empresasFavoritasStorage[i] == id) $scope.empresasFavoritas.splice(i, 1);
        };
        $scope.empresasFavoritasStorage.splice($index, 1);
        store.set('empresasFavoritasStorage', $scope.empresasFavoritasStorage);

        $ionicListDelegate.closeOptionButtons();
    }
}



var buscarCtrl = function($scope, store, usersService, Geoloc){
    'use strict';
    /*-listado de empresas-*/
    $scope.empresasFavoritasStorage = store.get('empresasFavoritasStorage') || [];
    $scope.empresasBuscar = [];
    var ids = [];
    var pagina = 1;
    var geoposition = {};
    var empresa = {};
    var max = 5;
    var total = 0;

    $scope.$on('$ionicView.enter', function () {
        $scope.empresasFavoritasStorage = store.get('empresasFavoritasStorage') || [];
        $scope.empresasBuscar = [];
        $scope.empresa = '';
        ids = [];
        pagina = 1;
        empresa = {};
    });

    $scope.buscarMore = function (pagina) {

        var more = false;
        var ids_pagina = [];
        total = pagina * max;

        var getIds = function () {
            ids_pagina = [];
            if (ids.length > total) more = true;
            else {
                $scope.empresasBuscarMore = true;
                max = ids.length;
            }
            for (var i = (pagina - 1) * max; i < total; i++) {
                //console.log(i);
                ids_pagina.push(ids[i]);
            }
            return ids_pagina;
        }

        var successBuscarMore = function (dataOk) {
            var mi_position = new plugin.google.maps.LatLng(geoposition.coords.latitude, geoposition.coords.longitude);
            var empresa_position = {};
            var distancia = 0;
            for (var i = 0; i < dataOk.length; i++) {
                empresa = {};
                empresa.Id = dataOk[i].Id;
                empresa.Razon_social = dataOk[i].Razon_social;
                empresa.Obligacion_venta = dataOk[i].Obligacion_venta.Cantidad;
                empresa.Valoracion = dataOk[i].Valoracion;
                empresa.actividad = dataOk[i].Sector.Nombre;
                if (typeof dataOk[i].Geoposicion.lat != 'undefined') {
                    empresa_position = new plugin.google.maps.LatLng(dataOk[i].Geoposicion.lat, dataOk[i].Geoposicion.lng);
                    empresa.distancia = Geoloc.distance(mi_position, empresa_position) / 1000;
                } else continue;
                $scope.empresasBuscar.push(empresa);
            };

            //console.log($scope.empresasBuscar);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.empresasBuscarMore = more;
            pagina++;
            $scope.pagina = pagina;
            $scope.cargando = false;

        }
        var erroruscarMore = function (dataFail) {
            $scope.cargando = false;
        }
        ids_pagina = getIds();
        if (ids_pagina.length > 0) usersService.getUsers(ids_pagina).then(successBuscarMore, erroruscarMore);

    }

    $scope.buscar = function (empresa) {
        $scope.cargando = true;
        $scope.errorBuscar = false;
        $scope.empresasBuscarMore = false;

        var onErrorGRPS = function (error) {
            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        };

        var buscquedaSuccess = function (dataSuccess) {
            ids = dataSuccess;

            if(!map)
            {
                map = plugin.google.maps.Map.getMap();
                map.getMyLocation(function(position){
                    geoposition = position;
                    $scope.buscarMore(pagina);
                }, onErrorGRPS);
            }

        }
        var buscquedaError = function (dataError) {
            //console.log('error', dataError);
            $scope.errorBuscar = dataError;
            $scope.cargando = false;
        }
        usersService.usersby_nombre(empresa).then(buscquedaSuccess, buscquedaError);
    }


    /*-añado ids de las empresas favoritas a la memoria cache-*/
    $scope.AddEmpresaFavorita = function (id, empresasFavoritasStorage) {
        if (empresasFavoritasStorage.length > 19) alert('20 son lo máximo');
        else {
            $scope.empresasFavoritasStorage = Pagar.AddEmpresaFavorita(id, empresasFavoritasStorage)
        }

        $ionicListDelegate.closeOptionButtons();
    }
}

var pagarEmpresaCtrl = function ($scope, $state, $stateParams, $ionicSlideBoxDelegate, $location, $ionicNavBarDelegate, $filter, $ionicGesture, store, Pagar, usersService, Pedido, Camara, CONFIG, $cordovaFileOpener2) {
    'use strict';

    var id = $stateParams.id;
    var user = {};
    $scope.empresasFavoritasStorage = store.get('empresasFavoritasStorage') || [];
    $scope.pagado = false;
    $scope.empresa = {};
    $scope.valoracion = 0;

    $scope.myActiveSlide = $stateParams.pago;

    $scope.pagarChange = function ($index) {
        /*-deshabilitamos el back y cambiamos el title-*/
    };


    $scope.goToPagar = function () {
        $ionicSlideBoxDelegate.next();
    }

    $scope.pagarTicket = function (importe) {
        $scope.pagado = false;
        $scope.cargando = true;
        $scope.errorTicket = false;
        $scope.operacionId = '';

        var pagoSuccess = function (dataSuccess) {
            $scope.cargando = false;
            if (dataSuccess.code > -1) {
                $scope.rating = 0;
                $scope.operacionId = dataSuccess.response.referencia;
                $scope.pedidoId = dataSuccess.response.id;
                $scope.pagado = true;
                $scope.empresasRecientesStorage = store.get('empresasRecientesStorage') || [];
                if ($scope.empresasRecientesStorage.length < 1) {
                    var user_session = store.get('my_user');
                    var id_session = user_session.Id;
                    var result = '';

                    Pagar.getEmpresasRecientes(id_session).then(function () {
                        $scope.empresasRecientesStorage = store.get('empresasRecientesStorage');
                        $scope.empresasRecientesStorage = Pagar.AddEmpresaReciente(id, $scope.empresasRecientesStorage);
                    });
                } else $scope.empresasRecientesStorage = Pagar.AddEmpresaReciente(id, $scope.empresasRecientesStorage);
            } else {
                $scope.errorTicket = true;
                $scope.pagado = false;
            }
        }
        var pagoError = function (dataError) {
            $scope.errorTicket = true;
            $scope.cargando = false;
            $scope.pagado = false;
            window.plugins.toast.showShortCenter(dataError);
        }
        Pagar.realizarPago($scope.empresa.Id, importe).then(pagoSuccess, pagoError);
    }

    /*-añado ids de las empresas favoritas a la memoria cache-*/
    $scope.AddEmpresaFavorita = function (id, empresasFavoritasStorage) {
        if (empresasFavoritasStorage.length > 19) alert('20 son lo máximo');
        else $scope.empresasFavoritasStorage = Pagar.AddEmpresaFavorita(id, empresasFavoritasStorage)
    }

    /*--
        quito ids de las empresas favoritas a la memoria cache
        quito la empresa del array de empresas favoritas del escope
    -*/
    $scope.deleteEmpresaFavorita = function (id) {
        for (var i = 0; i < $scope.empresasFavoritasStorage.length; i++) {
            if ($scope.empresasFavoritasStorage[i] == id) $scope.empresasFavoritasStorage.splice(i, 1);
        };
        store.set('empresasFavoritasStorage', $scope.empresasFavoritasStorage);

    }

    $scope.rateFunction = function (rating) {

        var rateSuccess = function (dataSuccess) {
            console.log('rateSucess: ', dataSuccess)
        }
        var rateError = function (dataError) {
            console.log(dataSuccess)
        }
        var pedido = {};
        pedido.id = $scope.pedidoId;
        pedido.valoracion = rating;
        pedido.id_vendedor = id;
        /*-pedido          = [id, valoracion, id_vendedor]-*/
        Pedido.valorar(pedido).then(rateSuccess, rateError)

    }

    $scope.subirTicket = function (e) {
        $scope.imagenURL = '';
        $scope.imagenes = [];
        var optionsImagen = {};
        optionsImagen.quality = 100;
        optionsImagen.targetWidth = 320;
        optionsImagen.targetHeight = 320;
        optionsImagen.saveToPhotoAlbum = false;

        var camaraSuccess = function (imageURI) {
            console.log(imageURI);
            $scope.imagenURL = imageURI;

            $scope.imagenes.push($scope.imagenURL);

            var options = new FileUploadOptions();
            options.fileKey = "post";
            options.chunkedMode = false;
            options.httpMethod = "POST";

            var params = {};
            params.value1 = "test";
            params.value2 = "param";

            options.params = params;

            options.headers = {
                'Authorization': localStorage.getItem('token')
            };
            var trustHosts = true
            var ft = new FileTransfer();

            var onUploadSuccess = function (imageData) {
                console.log(imageData);
                $scope.imagen = $scope.imagenURL;
                $scope.$apply();
                /* $scope.picData = "data:image/jpeg;base64," +imageData;
                 $scope.$apply();*/
            };
            var onUploadFail = function (err) {
                console.log(err);
            };

            ft.upload(imageURI, encodeURI(CONFIG.APIURL + 'pedidos/subir'), onUploadSuccess, onUploadFail, options, trustHosts);

        }
        var camaraError = function (dataErrorCamara) {
            console.log(dataErrorCamara);
        }

        Camara.get(optionsImagen).then(camaraSuccess, camaraError);
    }

    $scope.openImg = function (img) {
        $cordovaFileOpener2.open(
            img,
            'image/jpg'
        ).then(function () {
            console.log('okkkk');
        }, function (err) {
            console.log(err);
        });

    }

    $scope.$on('$ionicView.enter', function () {
        ionic.DomUtil.ready(function () {
            $scope.errorTicket = false;
            $scope.errorUser = false;
            $scope.pagado = false;

            var userSuccess = function (respuestaOk) {
                $scope.cargando = false;
                $scope.empresa = respuestaOk;
                $ionicNavBarDelegate.showBar(true);
                $ionicNavBarDelegate.showBackButton(true);
                $ionicNavBarDelegate.title('Pedido máximo: <strong>' + $filter('currency')($scope.empresa.Capacidad_pago.Cantidad, '€', 0) + '</strong>');
                $scope.cargando = false;
            }

            var userError = function (RespuestaError) {
                $scope.cargando = false;
                $scope.errorUser = true;
                $scope.errorUserTxt = RespuestaError.data.response;
            }

            if(typeof id == 'string') {
                userSuccess(angular.fromJson(id));
            } else {
                $scope.cargando = true;
                user = usersService.getUser(id);
                user.then(userSuccess, userError);
            }

            /*-galeria de imagenes quitamos el swipe de cambio de box-*/
            var $galleryEmpresa = angular.element(document.querySelector('.gallerympresa'));

            var dragFinish = function (e) {
                $ionicSlideBoxDelegate.enableSlide(true);
            };
            var releaseGesture = $ionicGesture.on('release', dragFinish, $galleryEmpresa);

            var dragInit = function (e) {
                $ionicSlideBoxDelegate.enableSlide(false);
            };
            var dragGesture = $ionicGesture.on('drag', dragInit, $galleryEmpresa);

            /*var dragHandlerInit = function(e) {
                console.log('dragHandlerInit');
                //$ionicSlideBoxDelegate.enableSlide(false);
            }
            var dragHandlerFinish = function(e) {
                console.log('dragHandlerFinish');
                //$ionicSlideBoxDelegate.enableSlide(true);
            }

            var dragGesture = $ionicGesture.on('drag', dragHandlerInit, $galleryEmpresa);
            var releaseGesture = $ionicGesture.on('release', dragHandlerFinish, $element);*/

            /*$scope.$on('$destroy', function () {
                console.log('asd');
              $ionicGesture.off(dragGesture, 'drag', function(){console.log('pppp');});
            });*/

        });
    });
}


angular.module('starter.pagar')
    .controller('pagarCtrl', ['$scope', 'store', '$ionicListDelegate', '$ionicNavBarDelegate', 'Pagar', pagarCtrl])
    .controller('pagarCercanosCtrl', ['$scope', 'Geoloc', 'store', '$ionicScrollDelegate', '$ionicListDelegate', '$timeout', 'Pagar', '$ionicLoading', '$rootScope', pagarCercanosCtrl])
    .controller('pagarRecientesCtrl', ['$scope', 'store', 'Pagar', '$ionicListDelegate', 'usersService', 'Geoloc', pagaRecientesCtrl])
    .controller('pagarFavoritosCtrl', ['$scope', 'store', '$ionicListDelegate', 'usersService', 'Geoloc', pagarFavoritosCtrl])
    .controller('buscarCtrl', ['$scope', 'store', 'usersService', 'Geoloc', buscarCtrl])
    .controller('pagarEmpresaCtrl', ['$scope', '$state', '$stateParams', '$ionicSlideBoxDelegate', '$location', '$ionicNavBarDelegate', '$filter', '$ionicGesture', 'store', 'Pagar', 'usersService', 'Pedido', 'Camara', 'CONFIG', '$cordovaFileOpener2', pagarEmpresaCtrl])
