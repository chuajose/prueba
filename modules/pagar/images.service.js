
var Imagen = function($q, $http, CONFIG,$cordovaFileTransfer){

  var get = function (imagen) {

        window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, function(fs){
       // window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
        fs.root.getDirectory("data", {create: true}, createFile);

            function createFile(){
                console.log(imagen.nombre);
                fs.root.getFile("data/"+imagen.nombre, {create: true, exclusive: false},
                  function(entry){
                     var p = entry.toURL();
                     var ft = new FileTransfer();
                     var trustHosts = true
                     var options = {};
                     $cordovaFileTransfer.download(imagen.url, p,options, trustHosts).then(function(result) {
                        // Success!
                                 alert(JSON.stringify(result));
                              }, function(error) {
                                // Error
                         console.log(error);
                                alert(JSON.stringify(error));
                              }
                                             )
                }
                , function(){
                    alert("file create error");
                    });
            }

        });
    };




    return {
        get : get
    };

}

angular.module('starter.inicio')
  .factory('Imagen', Imagen)
