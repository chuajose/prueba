var zoomable = function (ScrollRender){
return {
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                // Intialize layout
                var container = document.getElementById("container");
                var content = document.getElementById("content");
                var clientWidth = 0;
                var clientHeight = 0;

                // Initialize scroller
                var scroller = new Scroller(ScrollRender.render(content), {
                    scrollingX: true,
                    scrollingY: true,
                    animating: true,
                    bouncing: true,
                    locking: true,
                    zooming: true,
                    minZoom: 0.5,
                    maxZoom: 2
                });

                // Initialize scrolling rect
                var rect = container.getBoundingClientRect();
                scroller.setPosition(rect.left + container.clientLeft, rect.top + container.clientTop);

                var image = document.getElementById('image-scrollable');
                var contentWidth = image.width;
                var contentHeight = image.height;

                // Reflow handling
                var reflow = function() {
                    clientWidth = container.clientWidth;
                    clientHeight = container.clientHeight;
                    scroller.setDimensions(clientWidth, clientHeight, contentWidth, contentHeight);
                };


                window.addEventListener("resize", reflow, false);
                reflow();

                if ('ontouchstart' in window) {

                    container.addEventListener("touchstart", function(e) {
                        // Don't react if initial down happens on a form element
                        if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
                            return;
                        }

                        scroller.doTouchStart(e.touches, e.timeStamp);
                        e.preventDefault();
                    }, false);

                    document.addEventListener("touchmove", function(e) {
                        scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
                    }, false);

                    document.addEventListener("touchend", function(e) {
                        scroller.doTouchEnd(e.timeStamp);
                    }, false);

                    document.addEventListener("touchcancel", function(e) {
                        scroller.doTouchEnd(e.timeStamp);
                    }, false);

                } else {

                    var mousedown = false;

                    container.addEventListener("mousedown", function(e) {
                        if (e.target.tagName.match(/input|textarea|select/i)) {
                            return;
                        }

                        scroller.doTouchStart([{
                            pageX: e.pageX,
                            pageY: e.pageY
                        }], e.timeStamp);

                        mousedown = true;
                    }, false);

                    document.addEventListener("mousemove", function(e) {
                        if (!mousedown) {
                            return;
                        }

                        scroller.doTouchMove([{
                            pageX: e.pageX,
                            pageY: e.pageY
                        }], e.timeStamp);

                        mousedown = true;
                    }, false);

                    document.addEventListener("mouseup", function(e) {
                        if (!mousedown) {
                            return;
                        }

                        scroller.doTouchEnd(e.timeStamp);

                        mousedown = false;
                    }, false);

                    container.addEventListener(navigator.userAgent.indexOf("Firefox") > -1 ? "DOMMouseScroll" : "mousewheel", function(e) {
                        scroller.doMouseZoom(e.detail ? (e.detail * -120) : e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
                    }, false);
                }
            });
        }
    };
}

var starRating = function (){
    return {
        restrict : 'E',
        template : '<ul class="rating">'
             + '  <li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">'
             + '<i class="ion-ios-star"></i>'
             + '</li>'
             + '</ul>',
        scope : {
          ratingValue : '=',
          max : '=',
          noUpdate : '=',
          onRatingSelected : '&',
          ratingDefault : ' = ',
        },
        link : function(scope, elem, attrs) {
          var updateStars = function() {
              scope.stars = [];
              for ( var i = 0; i < scope.max; i++) {
                scope.stars.push({
                  filled : i < scope.ratingValue
                });
              }
          };
          //alert(scope.ratingValue);
          scope.toggle = function(index) {
              scope.ratingValue = index + 1;
              scope.onRatingSelected({
                rating : index + 1
              });
          };

          scope.$watch('ratingValue',
            function(oldVal, newVal) {
                updateStars();
            }
          );
        }
      };
}


var ionBack = function ($ionicHistory){
    return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
        elem.bind('click', function() {
            $ionicHistory.goBack();
            console.log('asdas');
      });
    }
  }
}


angular.module('starter')
    .directive('starRating',starRating)
    .directive('ionBack', ionBack)
    .directive('zoomable',zoomable);
