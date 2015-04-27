var Pedidos = function ($q, $http, CONFIG) {
	'use strict';

	var get = function (datosPedido) {

        var deferred = $q.defer();
		$http({
            url: CONFIG.APIURL + "pedidos",
            method: "GET",
            params: {pagina: datosPedido.pagina, estado:datosPedido.estado}
        })
            .success(function (data, status, headers, config) {
                deferred.resolve(data.response);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(status);
            });

        return deferred.promise;
    };

	var post = function (pedidos) {
        var deferred = $q.defer();
        $http({
            url:     CONFIG.APIURL + "pedidos/search",
            method:  "POST",
            data :   "fecha_i=" + pedidos.fecha_i + "&fecha_f=" + pedidos.fecha_f + "&importe_i=" + pedidos.importe_i + "&importe_f=" + pedidos.importe_f + "&pagina=" + pedidos.pagina + "&estado=" + pedidos.estado,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .success(function (data) {
                deferred.resolve(data.response);
            })
            .error(function (status) {
                deferred.reject(status);
            });
        return deferred.promise;
    };

    var devolucion = function (pedidos) {
        var deferred = $q.defer();
        $http({
            url:     CONFIG.APIURL + "pedidos/devolucion",
            method:  "GET",
            //params: {pagina: datosPedido.pagina, estado:datosPedido.estado}
           // data :   "fecha_i=" + pedidos.fecha_i + "&fecha_f=" + pedidos.fecha_f + "&importe_i=" + pedidos.importe_i + "&importe_f=" + pedidos.importe_f + "&pagina=" + pedidos.pagina + "&estado=" + pedidos.estado,
            //headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .success(function (data) {
                deferred.resolve(data.response);
            })
            .error(function (status) {
                deferred.reject(status);
            });
        return deferred.promise;
    };

    return {
        get : get,
		post : post,
        'devolucion' : devolucion
    };

};

var Pedido = function ($q, $http, CONFIG) {
    'use strict';
    var get = function (id) {
        var deferred = $q.defer();
        $http({
            url: CONFIG.APIURL + "pedidos/pedido",
            method: "GET",
            params: {id: id}
        })
            .success(function (data) {
                deferred.resolve(data.response);
            })
            .error(function (status) {
                deferred.reject(status);
            });
        return deferred.promise;
    };

    var devolucion = function (pedido) {
        console.log(pedido);
        var deferred = $q.defer();
        $http({
            url:     CONFIG.APIURL + "pedidos/devolucion",
            method:  "PUT",
            //params: {id : pedido.id, tipo : pedido.tipo, motivo : pedido.motivo},
            data :   "id=" + pedido.id + "&tipo=" + pedido.tipo + "&motivo=" + pedido.motivo,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .success(function (data) {
                deferred.resolve(data.response);
            })
            .error(function (status) {
                deferred.reject(status);
            });
        return deferred.promise;
    };

    var valorar = function (pedido) {
        console.log(pedido);
        var deferred = $q.defer();
        $http({
            url:     CONFIG.APIURL + "pedidos/valoracion",
            method:  "PUT",
            //params: {id : pedido.id, tipo : pedido.tipo, motivo : pedido.motivo},
            data :   "id=" + pedido.id + "&valoracion=" + pedido.valoracion + "&id_vendedor=" + pedido.id_vendedor,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .success(function (data) {
                deferred.resolve(data.response);
            })
            .error(function (status) {
                deferred.reject(status);
            });
        return deferred.promise;
    };

    var pagar = function (pedidos) {
        var deferred = $q.defer();
        $http({
            url:     CONFIG.APIURL + "pedidos",
            method:  "POST",
            data :   "fecha_i=" + pedidos.fecha_i + "&fecha_f=" + pedidos.fecha_f + "&importe_i=" + pedidos.importe_i + "&importe_f=" + pedidos.importe_f + "&pagina=" + pedidos.pagina + "&estado=" + pedidos.estado,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .success(function (data) {
                deferred.resolve(data.response);
            })
            .error(function (status) {
                deferred.reject(status);
            });
        return deferred.promise;
    };

    return {
        get : get,
        devolucion : devolucion,
        valorar : valorar,
        pagar : pagar
    };


};

var Camara = function ($q, $http, CONFIG) {
    'use strict';

    var get = function (options) {

        var deferred = $q.defer();
        navigator.camera.getPicture(function(result) {
        // Do any magic you need
        deferred.resolve(result);
      }, function(err) {
        deferred.reject(err);
      }, options);
        return deferred.promise;
    };

    var post = function (pedidos) {
        var deferred = $q.defer();
        $http({
            url:     CONFIG.APIURL + "pedidos/subir",
            method:  "POST",
            data :   "imagen=" + pedidos,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .success(function (data) {
                deferred.resolve(data.response);
            })
            .error(function (status) {
                deferred.reject(status);
            });
        return deferred.promise;
    };



    return {
        get : get,
        post:post
    };


};


angular.module('starter.cobrar')
    .factory('Pedido', Pedido)
    .factory('Pedidos', Pedidos)
    .factory('Camara', Camara)

