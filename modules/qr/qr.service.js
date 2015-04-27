var Qr = function($cordovaFile, $http, $q, CONFIG, $cordovaFileTransfer){
    var path = '';
    var file = '';
    var id = '';

    var showQr =  function(id){
        this.file = id+'_qr.png';
        this.id = id;
        var _self = this;

        var deferred = $q.defer();

        window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, function(fileSystem){
            var sucessFile = function (fileEntry) {
                    //console.log('sucessFile', fileEntry);
                    var sucessMetadata = function(metadatos){
                        //console.log('sucessMetadata', metadatos);
                        if(metadatos.size > 0) deferred.resolve(fileEntry.nativeURL);
                        else
                        {
                            this.path = fileEntry.toURL();
                            //console.log('this.path', this.path);
                            _self.generateQr(_self.id).then(function(successGenerate){
                                deferred.resolve(successGenerate);
                            }, function(errorGenerate){
                                deferred.reject(errorGenerate);
                            });
                            //console.log('sucessMetadataNO', metadatos);
                        }
                    };
                    var errorMetadata = function(errormetadatos){
                         deferred.reject(errormetadatos);
                    };

                    fileEntry.getMetadata(sucessMetadata, errorMetadata);

                };
                var errorFile = function(errorFileData){
                    deferred.reject(errorFileData);
                };

                fileSystem.root.getFile(_self.file, {create: true}, sucessFile, errorFile);

        }, function(e){
            deferred.reject(e);
        });
        return deferred.promise;

        /*//'/data/data/com.ionicframework.trocoplace746624/';

        console.log('SERVICE ID', id);

        var deferred = $q.defer();
        $cordovaFile.readAsDataURL(path, file).then(function (success) {
            console.log('ok', success);
            deferred.resolve(success);
        }, function (error) {
            console.log('error', error);
            console.log('SERVICE-PROMISE ID', id);
            _self.generateQr(id).then(function(successGenerate){
                deferred.resolve(successGenerate);
            }, function(errorGenerate){
                deferred.reject(errorGenerate);
            });
        });
        return deferred.promise;*/
    };
    var generateQr = function(id){
        var _self = this;
        var deferred = $q.defer();
        $http({
                url: CONFIG.APIURL+"users/qr",
                method:  "GET",
                params: {
                    id: id
                }
        })
        .success(function(url) {

            //console.log('service', dataOk);
            var downloadSucceess = function(downloadOk){
                //console.log('downloadSucceess');
            }
            var downloadError = function(downloadError){
                //console.log(downloadError);
            }

            var filePath = this.path;
            $cordovaFileTransfer.download(url.response, filePath, {}, true).then(downloadSucceess, downloadError)

        })
        .error(function(dataError) {
            deferred.reject(status);
        });
        return deferred.promise;
    }
    return {
        showQr: showQr,
        generateQr: generateQr
    }
}

angular.module('starter.qr')
  .factory('Qr', Qr)
