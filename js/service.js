var Imagen = function ($q, $http, CONFIG, $cordovaFileTransfer) {

    var get = function (imagen, destino) {
         var deferred = $q.defer();
        if( !destino ){
            var destino = {};
            destino.directorio = "data";
            destino.tipo = LocalFileSystem.TEMPORARY;

        }
        window.requestFileSystem(destino.tipo, 0, function (fs) {
            // window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
            fs.root.getDirectory(destino.directorio, {
                create: true
            }, createFile);

            function createFile() {
                //console.log(imagen.nombre);
                fs.root.getFile( destino.directorio + "/" + imagen.nombre, {
                        create: true,
                        exclusive: false
                    },
                    function (entry) {
                        var p = entry.toURL();
                        var ft = new FileTransfer();
                        var trustHosts = true
                        var options = {};
                        $cordovaFileTransfer.download(imagen.url, p, options, trustHosts).then(function (result) {
                            deferred.resolve(result);
                            // Success!
                            /*filesystem: FileSystem
                            fullPath: "/data/image.jpg"
                            isDirectory: false
                            isFile: true
                            name: "image.jpg"
                            nativeURL: "file:///storage/emulated/0/Android/data/com.ionicframework.trocoplace746624/cache/data/image.jpg"*/
                            //return result;
                        }, function (err) {
                            // Error
                            deferred.reject(err);
                        })
                    },
                    function (err) {
                        deferred.reject(err);
                    });
            }

        });
        return deferred.promise;
    };

    return {
        get: get
    };

}


var ScrollRender = function (){
    this.render = function(content) {
        return (function(global) {

            var docStyle = document.documentElement.style;

            var engine;
            if (global.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
                engine = 'presto';
            } else if ('MozAppearance' in docStyle) {
                engine = 'gecko';
            } else if ('WebkitAppearance' in docStyle) {
                engine = 'webkit';
            } else if (typeof navigator.cpuClass === 'string') {
                engine = 'trident';
            }

            var vendorPrefix = {
                trident: 'ms',
                gecko: 'Moz',
                webkit: 'Webkit',
                presto: 'O'
            }[engine];

            var helperElem = document.createElement("div");
            var undef;

            var perspectiveProperty = vendorPrefix + "Perspective";
            var transformProperty = vendorPrefix + "Transform";

            if (helperElem.style[perspectiveProperty] !== undef) {

                return function(left, top, zoom) {
                    content.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(' + zoom + ')';
                };

            } else if (helperElem.style[transformProperty] !== undef) {

                return function(left, top, zoom) {
                    content.style[transformProperty] = 'translate(' + (-left) + 'px,' + (-top) + 'px) scale(' + zoom + ')';
                };

            } else {

                return function(left, top, zoom) {
                    content.style.marginLeft = left ? (-left / zoom) + 'px' : '';
                    content.style.marginTop = top ? (-top / zoom) + 'px' : '';
                    content.style.zoom = zoom || '';
                };

            }
        })(this);
    };
}

var Geoloc = function($q, $http, CONFIG){

    var updateMarker = function () {


        $http({
                url:     CONFIG.APIURL+"geoloc",
                method:  "POST",
                data :   "lat=0&lng=0&zoom=14&northeast=0&southwest=0",
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .success(function(data) {
            function errorCB(err) {
                console.log(err);
    alert("Error processing SQL: "+err.code);
}
            var marcas = data.response.marcas;
            db.transaction(function(tx)
            {
            tx.executeSql('DROP TABLE IF EXISTS markers');
            tx.executeSql('CREATE TABLE IF NOT EXISTS markers(id integer primary key, razon_social text, direccion text, sector text, actividad text, lat, lng)',[], function(tx, res)
            {
                console.log('insertamos empresas');
                console.log(marcas.length);

                for (var i = 0; i < marcas.length; i++) {
                        tx.executeSql('INSERT INTO markers (id, razon_social,direccion,sector,actividad,lat,lng) VALUES (?,?,?,?,?,?,?) ',[marcas[i].id, marcas[i].razon_social, marcas[i].direccion, marcas[i].sector, marcas[i].actividad, marcas[i].lat ,marcas[i].lng ]);



                    console.log( marcas[i].razon_social);
                 /*if (i==0) {
                    query = 'INSERT INTO markers (id, razon_social,direccion,sector,actividad,lat,lng)';
                }
                else {
                    query += ' UNION';
                }

                query += ' SELECT "'+marcas[i].id+'", "'+marcas[i].razon_social+'", "'+marcas[i].direccion+'", "'+marcas[i].sector+'", "'+marcas[i].actividad+'", "'+marcas[i].lat+'", "'+marcas[i].lng+'" ';

                if (i!=0 && i%499==0) {
                    tx.executeSql(query);
                }

                    console.log(i);
                  */
                }
               /* if (i%499!=0) {
                    tx.executeSql(query);
                }*/

                tx.executeSql("CREATE INDEX gelocalizar on markers (lat, lng);");
            });
                },errorCB);
        })
        .error(function(erro) {
            console.log(erro);
        });

    };

    var getSQL = function (data) {
        var northeast = data.northeast.split(",");
        var southwest = data.southwest.split(",");
       // console.log(northeast[0]+"|"+southwest[0]);
      //  console.log(northeast[1]+"|"+southwest[1]);
        var deferred, result = {};

        result.marcas = [];
        deferred = $q.defer();
        db.transaction(function(tx)
        {
            tx.executeSql('CREATE TABLE IF NOT EXISTS markers(id integer primary key, razon_social text, direccion text, sector text, actividad text, lat, lng)');
            tx.executeSql("select * from markers where lat between "+southwest[0]+" and "+northeast[0]+" and lng between "+southwest[1]+" and "+northeast[1], [], function(tx, res)
            //tx.executeSql("select * from markers", [], function(tx, res)
            //tx.executeSql("select * from markers where lat between '"+southwest[0]+"' and '"+northeast[0]+"' and lng between '"+northeast[1]+"' and '"+southwest[1]+"'", [], function(tx, res)
            {
                for(var i = 0; i < res.rows.length; i++)
                {
                    result.marcas.push({id : res.rows.item(i).id, razon_social : res.rows.item(i).razon_social,direccion : res.rows.item(i).direccion,sector : res.rows.item(i).sector,actividad : res.rows.item(i).actividad,lat : res.rows.item(i).lat,lng : res.rows.item(i).lng })
                    //console.log(res.rows.item(i).lat+"|"+res.rows.item(i).lng);
                }
                deferred.resolve(result);
            });
        });
        return deferred.promise;
    };
    var get = function (loc) {
        var deferred = $q.defer();
        $http({
                url:     CONFIG.APIURL+"geoloc",
                method:  "POST",
                data :   "lat="+loc.lat+"&lng="+loc.lng+"&zoom="+loc.zoom+"&northeast="+loc.northeast+"&southwest="+loc.southwest,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .success(function(data) {
            deferred.resolve(data.response);
        })
        .error(function(data) {
            deferred.reject(status);
        });
        return deferred.promise;
    };

    // distance between two geographical points using spherical law of cosines approximation
    var distance = function (latlng1, latlng2) {
        var rad = Math.PI / 180,
            lat1 = latlng1.lat * rad,
            lat2 = latlng2.lat * rad,
            a = Math.sin(lat1) * Math.sin(lat2) +
                Math.cos(lat1) * Math.cos(lat2) * Math.cos((latlng2.lng - latlng1.lng) * rad);

        return 6378137 * Math.acos(Math.min(a, 1));
    }

    var getIcon = function(){
        var local_icons_per = new Object();

        var sectores = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019,1020,1021,1022,1023,1024,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,1036,1037,1038,1039,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1061,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,1072,1073,1074,1075,1076,1077,1078,1080,1081,1082,1083,1084,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103,1104,1105,1106,1107,1108,1109,1110,1111,1112,1113,1114,1115,1116,1117,1118,1119,1120,1121,1122,1123,1124,1125,1126,1127,1128,1129,1130,1131,1132,1133,1134,1135,1136,1137,1138,1139,1140,1141,1142,1143,1144,1145,1146,1147,1148,1149,1150,1151,1152,1153,1154,1155,1156,1157,1158,1159,1160,1161,1162,1163,1164,1165,1166,1167,1168,1169,1170,1171,1172,1173,1174,1175,1176,1177,1178,1179,1180,1181,1182,1183,1184,1185,1186,1187,1188,1189,1190,1191,1192,1193,1194,1195,1196,1197,1198,1199,1200,1201,1202,1203,1204,1205,1206,1207,1208,1209,1210,1211,1212,1213,1214,1215,1216,1217,1218,1219,1220,1221,1222,1223,1224,1225,1226,1227,1228,1229,1230,1231,1232,1233,1234,1235,1236,1237,1238,1239,1240,1241,1242,1243,1244,1245,1246,1247,1248,1249,1250,1251,1252,1253,1254,1255,1256,1257,1258,1259,1260,1261,1262,1263,1264];

        for (var i = 0; i < sectores.length; i++)
        {
            var sector        = sectores[i];
            //var id            = sector[];
            //var nombre        = i;
            var icono         = new Object();
            icono.iconUrl     = 'lib/maps/iconos/'+sector+'.png';
            icono.iconSize    = [30, 45];
            icono.iconAnchor  = [30, 45];
            icono.popupAnchor = [1, -34];
            icono.shadowSize  = [45, 45];

            local_icons_per[sector] = 'www/lib/maps/iconos/'+sector+'.png';

            var nombre_hover        = sector+'_hover';
            var icono_hover         = new Object();
            icono_hover.iconUrl     = 'lib/maps/iconos/'+sector+'_hover.png';
            icono_hover.iconSize    = [30, 45];
            icono_hover.iconAnchor  = [30, 45];
            icono_hover.popupAnchor = [1, -34];

            local_icons_per[nombre_hover] = 'www/lib/maps/iconos/'+sector+'_hover.png';
        };
        return  local_icons_per;
    }

    return {
        updateMarker: updateMarker,
        get:      get,
        distance: distance,
        getIcon:  getIcon
    }
}

var appService = function($http, $q, CONFIG){

}

angular.module('starter.service')
    .factory("appService", appService)
    .factory('Imagen', Imagen)
    .service('ScrollRender', ScrollRender)
    .factory('Geoloc', Geoloc)
