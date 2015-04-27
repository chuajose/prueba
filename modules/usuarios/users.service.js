(function () {
    'use strict';
    angular.module('starter')
        .factory("usersService", ["$http", "$q", "CONFIG", "store", function ($http, $q, CONFIG, store) {
            return {
                getUser: function getUser(id) {
                    if (id) {
                        id = '?id=' + id;
                    } else {
                        id = '';
                    }
                    var deferred = $q.defer(),
                        promise = $http({
                            method: 'GET',
                            skipAuthorization: false,
                            url: CONFIG.APIURL + 'users/user' + id
                        }).then(function (res) {
                            if (!id) {
                                store.set('my_user', res.data.response);
                            }
                            if (res.data.token) {
                                store.set('token', res.data.token);
                            }
                            deferred.resolve(res.data.response);
                        }, function (error) {
                            if (!id) {
                                var my_user = store.get("my_user") || null;
                                if (my_user) {
                                    deferred.resolve(my_user);
                                } else {
                                    deferred.reject('El servicio no está disponible, comprueba tu conexión a internet');
                                }
                            }
                            else {
                                if (error.data && error.data.response) {
                                    deferred.reject(error.data.response);
                                } else {
                                    deferred.reject('El servicio no está disponible, comprueba tu conexión a internet');
                                }
                            }
                        });
                    return deferred.promise;
                },
                getUsers: function getUsers(ids) {
                    var deferred = $q.defer(),
                    promise = $http({
                        method: 'GET',
                        skipAuthorization: false,
                        url: CONFIG.APIURL + 'users/list',
                        params: {
                            'ids[]' : ids
                        }
                    }).then(function (respuesta){
                            deferred.resolve(respuesta.data.response);
                        }, function (error){
                            deferred.reject(error);
                        });
                    return deferred.promise;

                },
                usersby_nombre: function usersby_nombre(nombre) {
                    var deferred = $q.defer(),
                    promise = $http({
                        method: 'GET',
                        skipAuthorization: false,
                        url: CONFIG.APIURL + 'users/listby_nombre',
                        params: {
                            'nombre' : nombre
                        }
                    }).then(function (respuesta){
                            if(typeof respuesta.data == 'string')
                            {
                                if(respuesta.data.length > 0) deferred.reject('Hubo un problema con el servidor inténtelo más tarde');
                                else deferred.reject('No hay empresas con ese nombre');
                            }
                            else deferred.resolve(respuesta.data.response);
                        }, function (error){
                            deferred.reject('Hubo un problema con el servidor inténtelo más tarde');
                        });
                    return deferred.promise;

                },
                getUserByCommerceCode: function getUserByCommerceCode(ccomercio){
                    var ccomercio_str = '';
                    var id            = '';
                    ccomercio_str = ccomercio.toString();
                    id            = ccomercio_str.substr(3);
                    return parseInt(id);
                }
            };
        }]);
}());
