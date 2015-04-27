(function () {
    'use strict';
    angular.module('starter.login')
        .factory("authFactory", ["$http", "$q", "CONFIG", function ($http, $q, CONFIG) {
            return {
                login: function (user, device) {
                    var deferred,
                        data = {email: user.email, password: user.password, platform: device.platform, version: device.version, model : device.model, uuid : device.uuid};
                    console.log(device);
                    deferred = $q.defer();

                    $http({
                        method: 'POST',
                        skipAuthorization: true,//no queremos enviar el token en esta petición
                        url: CONFIG.APIURL + 'auth/login',
                        data: data,
                        headers: {'Content-Type': 'application/json'}
                    })
                        .then(function (res) {
                            if (res.data.code === 0) {
                                var result = {
                                    token: res.data.token,
                                    response: res.data.response
                                };
                                deferred.resolve(result);
                            } else {
                                deferred.reject(res.data.response);
                            }
                        }, function (error) {
                            if (error.data && error.data.response) {
                                deferred.reject(error.data.response);
                            } else {
                                deferred.reject('El servicio no está disponible');
                            }
                        });
                    return deferred.promise;
                }
            };
        }]);
}());
