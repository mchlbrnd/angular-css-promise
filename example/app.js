(function (angular, undefined) {
    'use strict';

    var app = angular.module('ngPromiseDemo', [
        'ngPromise'
    ]);

    app.run(function ($rootScope, $timeout, $interval, $q) {
        function throwingRandomly() {
            var shouldThrow = (Math.floor((Math.random() * 100) + 1)) % 5 === 0;

            if (shouldThrow) {
                throw 'Error';
            }
        }

        function cancel (cancelFn) {
            var promises = Array.prototype.slice.call(arguments, 1);

            angular.forEach(promises, function (promise) {
                if (promise && promise.then) {
                    cancelFn.call(null, promise);
                } else if (angular.isObject(promise)) {
                    var promises = Object.keys(promise).map(function (key) {
                        return promise[key];
                    });
                    cancel.apply(null, [cancelFn].concat(promises));
                }
            });
        }

        var cancelTimeouts = cancel.bind(null, $timeout.cancel),
            cancelIntervals = cancel.bind(null, $interval.cancel);

        $rootScope.ngPromiseOptions = {
            resolve: {
                name: 'done'
            },
            notify: {
                name: 'working-on-it'
            },
            pending: {
                name: 'busy'
            },
            reject: {
                name: 'oops'
            },
            settle: {
                name: 'ready'
            }
        };

        /* $timeout Promise */
        $rootScope.startSingleTimeout = function () {
            $rootScope.singleTimeout = $timeout(throwingRandomly, 5000);
            $rootScope.singleTimeout
                .then(function () {
                    delete $rootScope.singleTimeout;
                });
        };

        $rootScope.stopSingleTimeout = function () {
            $rootScope.singleTimeout = cancelTimeouts($rootScope.singleTimeout);
        };

        /* Array of $timeout Promises */
        $rootScope.startArrayOfTimeouts = function () {
            $rootScope.arrayOfTimeouts = [
                $timeout(throwingRandomly, 4000),
                $timeout(throwingRandomly, 5000),
                $timeout(throwingRandomly, 6000)
            ];

            $q
                .all($rootScope.arrayOfTimeouts)
                .then(function () {
                    delete $rootScope.arrayOfTimeouts;
                });
        };

        $rootScope.stopArrayOfTimeouts = function () {
            $rootScope.arrayOfTimeouts = cancelTimeouts($rootScope.arrayOfTimeouts);
        };

        /* Object of $timeout Promises */
        $rootScope.startObjectOfTimeouts = function () {
            $rootScope.objectOfTimeouts = {
                first: $timeout(throwingRandomly, 4000),
                second: $timeout(throwingRandomly, 5000),
                third: $timeout(throwingRandomly, 6000)
            };

            $q
                .all($rootScope.objectOfTimeouts)
                .then(function () {
                    delete $rootScope.objectOfTimeouts;
                });
        };

        $rootScope.stopObjectOfTimeouts = function () {
            $rootScope.objectOfTimeouts = cancelTimeouts($rootScope.objectOfTimeouts);
        };

        /* $interval Promise */
        $rootScope.startSingleInterval = function startSingleInterval () {
            $rootScope.singleInterval = $interval(null, 5000, 5);
            $rootScope.singleInterval
                .then(function () {
                    delete $rootScope.singleInterval;
                });
        };

        $rootScope.stopSingleInterval = function () {
            $rootScope.singleInterval = cancelIntervals($rootScope.singleInterval);
        };

        /* Array of $interval Promises */
        $rootScope.startArrayOfIntervals = function () {
            $rootScope.arrayOfIntervals = [
                $interval(null, 3000, 2),
                $interval(null, 4000, 2),
                $interval(null, 5000, 2)
            ];

            $q
                .all($rootScope.arrayOfIntervals)
                .then(function () {
                    delete $rootScope.arrayOfIntervals;
                });
        };

        $rootScope.stopArrayOfIntervals = function () {
            $rootScope.arrayOfIntervals = cancelIntervals($rootScope.arrayOfIntervals);
        };

        /* Object of $interval Promises */
        $rootScope.startObjectOfIntervals = function () {
            $rootScope.objectOfIntervals = {
                first: $interval(null, 3000, 5),
                second: $interval(null, 4000, 5),
                third: $interval(null, 5000, 5)
            };

            $q
                .all($rootScope.objectOfIntervals)
                .then(function () {
                    delete $rootScope.objectOfIntervals;
                });
        };

        $rootScope.stopObjectOfIntervals = function () {
            $rootScope.objectOfIntervals = cancelIntervals($rootScope.objectOfIntervals);
        }
    });
}(angular));
