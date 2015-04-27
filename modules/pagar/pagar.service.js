var Pagar = function($q, $http, store, CONFIG){
  /*return $http({
                url: APIURL+"servidor_rest/datos_economicos_usuario/troco/dgonzalez@circulogacela.com/11111111"
            }).success(function(data){

            }).error(function(){

            });*/
  return {
    AddEmpresaFavorita: function(id, empresasFavoritasStorage){
            empresasFavoritasStorage.push(id);
            store.set('empresasFavoritasStorage', empresasFavoritasStorage);
            return empresasFavoritasStorage;

    },
    AddEmpresaReciente: function(id, empresasRecientesStorage){
            if(empresasRecientesStorage.indexOf(id) == -1)
            {
                empresasRecientesStorage.push(id);
                store.set('empresasRecientesStorage', empresasRecientesStorage);
            }
            return empresasRecientesStorage;

    },
    getEmpresasRecientes: function(id){
        var deferred = $q.defer();
        $http({
                url: CONFIG.APIURL+"pedidos/",
                method:  "GET",
                params: {
                    id:     id,
                    tipo:   0,
                    limite: 50
                }
        })
        .success(function(data) {
            console.log('service', data.response.solicitudes);
            if(data.response.solicitudes.length > 0)
            {
                var empresas = [];
                var empresaId = 0;
                for (var i = 0; i < data.response.solicitudes.length; i++)
                {
                    empresaId = data.response.solicitudes[i].Usuario.Id;
                    if(empresas.indexOf(empresaId) == -1) empresas.push(empresaId)
                };
                store.set('empresasRecientesStorage', empresas);
            }
            deferred.resolve(data.response.solicitudes);
        })
        .error(function(data) {
            console.log('error');
            deferred.reject(status);
        });
        return deferred.promise;
    },
    realizarPago: function (id,importe){
        var deferred = $q.defer();
        $http({
                url: CONFIG.APIURL+"pedidos",
                method:  "POST",
                data :   "id="+id+"&importe="+importe,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .success(function(data) {
            deferred.resolve(data);
        })
        .error(function(error) {
            if (error.response) {
                deferred.reject(error.response);
            } else {
                deferred.reject('El servicio no está disponible');
            }
        });
        return deferred.promise;

    }
  }
}

angular.module('starter.pagar')
  .factory('Pagar', Pagar)
