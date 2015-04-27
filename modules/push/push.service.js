(function () {
    'use strict';
    angular.module('starter')
        .factory("pushService", ["$http", "$q", "CONFIG", "store", '$cordovaPush', '$state', function ($http, $q, CONFIG, store, $cordovaPush, $state) {
            var storeDeviceToken = function (type, regId) {
                // Create a random userid to store with it
                var data = {
                    type: type,
                    token: regId
                };
                store.set('pushId', regId);
                console.log("Post token for registered device with data " + JSON.stringify(data));
                $http.post(CONFIG.APIURL + 'auth/push', data)
                    .success(function (data, status) {
                        console.log("Token stored, device is successfully subscribed to receive push notifications.");
                        store.set('pushId', regId);
                    })
                    .error(function (data, status) {
                        console.log("Error storing device token." + data + " " + status);
                    });
            };
            return {
                register: function () {
                    var config = null;
                    if (ionic.Platform.isAndroid()) {
                        config = {
                            "senderID": "905812551656" // REPLACE THIS WITH YOURS FROM GCM CONSOLE - also in the project URL like: https://console.developers.google.com/project/434205989073
                        };
                    } else if (ionic.Platform.isIOS()) {
                        config = {
                            "badge": "true",
                            "sound": "true",
                            "alert": "true"
                        };
                    }
                    $cordovaPush.register(config).then(function (result) {
                        console.log("Register success " + result);
                        //  $cordovaToast.showShortCenter('Registered for push notifications');
                        //$scope.registerDisabled=true;
                        // ** NOTE: Android regid result comes back in the pushNotificationReceived, only iOS returned here
                        if (ionic.Platform.isIOS()) {
                            storeDeviceToken("ios", result);
                        }
                    }, function (err) {
                        console.log("Register error " + err);
                    });
                },
                handleNotification: function (event, notification) {
                    console.log(JSON.stringify([notification]));
                    // Android Notification Received Handler
                    var handleAndroid = function (notification) {
                        // ** NOTE: ** You could add code for when app is in foreground or not, or coming from coldstart here too
                        // via the console fields as shown.
                        console.log("In foreground " + notification.foreground + " Coldstart " + notification.coldstart);
                        if (notification.event == "registered") {
                            storeDeviceToken("android", notification.regid);
                        } else if (notification.event == "message") {
                            if (notification.payload.goto) {
                                $state.go(notification.payload.goto);
                            }
                            /*$cordovaDialogs.alert(notification.message, "Push Notification Received");
                            $scope.$apply(function () {
                                $scope.notifications.push(JSON.stringify(notification.message));
                            });*/
                        } else if (notification.event === "error") {
                            $cordovaDialogs.alert(notification.msg, "Push notification error event");
                        } else {
                            $cordovaDialogs.alert(notification.event, "Push notification handler - Unprocessed Event");
                        }
                    },
                        // IOS Notification Received Handler
                    handleIOS = function (notification) {
                        // The app was already open but we'll still show the alert and sound the tone received this way. If you didn't check
                        // for foreground here it would make a sound twice, once when received in background and upon opening it from clicking
                        // the notification when this code runs (weird).
                        if (notification.foreground == "1") {
                            // Play custom audio if a sound specified.
                            if (notification.sound) {
                                var mediaSrc = $cordovaMedia.newMedia(notification.sound);
                                mediaSrc.promise.then($cordovaMedia.play(mediaSrc.media));
                            }
                            if (notification.body && notification.messageFrom) {
                                $cordovaDialogs.alert(notification.body, notification.messageFrom);
                            } else {
                                $cordovaDialogs.alert(notification.alert, "Push Notification Received");
                            }
                            if (notification.badge) {
                                $cordovaPush.setBadgeNumber(notification.badge).then(function (result) {
                                    console.log("Set badge success " + result);
                                }, function (err) {
                                    console.log("Set badge error " + err);
                                });
                            }
                        }
                        // Otherwise it was received in the background and reopened from the push notification. Badge is automatically cleared
                        // in this case. You probably wouldn't be displaying anything at this point, this is here to show that you can process
                        // the data in this situation.
                        else {
                            if (notification.body && notification.messageFrom) {
                                $cordovaDialogs.alert(notification.body, "(RECEIVED WHEN APP IN BACKGROUND) " + notification.messageFrom);
                            } else $cordovaDialogs.alert(notification.alert, "(RECEIVED WHEN APP IN BACKGROUND) Push Notification Received");
                        }
                    };
                    if (ionic.Platform.isAndroid()) {
                        handleAndroid(notification);
                    } else if (ionic.Platform.isIOS()) {
                        handleIOS(notification);
                        $scope.$apply(function () {
                            $scope.notifications.push(JSON.stringify(notification.alert));
                        });
                    }
                },
                unregister: function () {
                    var tkn = {
                        "token": store.get('pushId')
                    };
                    $http.post('http://192.168.1.16:8000/unsubscribe', JSON.stringify(tkn))
                        .success(function (data, status) {
                            console.log("Token removed, device is successfully unsubscribed and will not receive push notifications.");
                        })
                        .error(function (data, status) {
                            console.log("Error removing device token." + data + " " + status);
                        });
                }

            };
        }]);
}());
