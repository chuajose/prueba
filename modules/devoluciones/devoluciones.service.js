var Devoluciones = function($q, $http, CONFIG){
  'use strict';
    var get = function (datosPedido) {

        var deferred = $q.defer();
		$http({
            url: CONFIG.APIURL + "pedidos/devolucion",
            method: "GET",
            params: {pagina: datosPedido.pagina}
        })
            .success(function (data, status, headers, config) {
                deferred.resolve(data.response);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(status);
            });

        return deferred.promise;
    };

     return {
        get : get,

    };
}

angular.module('starter.devoluciones')
  .factory('Devoluciones', Devoluciones)
