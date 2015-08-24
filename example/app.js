(function (angular, undefined) {
    'use strict';

    var app = angular.module('ngPromiseDemo', [
        'ngPromise'
    ]);

    app.run(function ($rootScope, $timeout, $q) {
        var singleRestartTimeout,
            arrayRestartTimeout,
            objectRestartTimeouts = {};

        $rootScope.objectOfTimeouts = {};
        $rootScope.animateCssOptions = {duration: 1};

        function cancelTimeouts (value) {
            if (value !== undefined) {
                if (value.$$state) {
                    $timeout.cancel(value);
                } else if (angular.isObject(value)) {
                    angular.forEach(value, function (promise) {
                        $timeout.cancel(promise);
                    });
                }
            }
        }

        $rootScope.$watch('singleTimeoutActive', function (newActive) {
            newActive ? startSingleTimeout() : stopSingleTimeout();
        });

        $rootScope.$watch('arrayOfTimeoutsActive', function (newActive) {
            newActive ? startArrayOfTimeouts() : stopArrayOfTimeouts();
        });

        $rootScope.$watch('objectOfTimeoutsActive', function (newActive) {
            newActive ? startObjectOfTimeouts() : stopObjectOfTimeouts();
        });

        function startSingleTimeout () {
            $rootScope.singleTimeout = $timeout(function () {
                singleRestartTimeout = $timeout(startSingleTimeout, 5000); // wait a bit before reloading
                throwingRandomly();
            }, 4000);
        }

        function stopSingleTimeout () {
            cancelTimeouts(singleRestartTimeout);
            cancelTimeouts($rootScope.singleTimeout);
        }

        function startArrayOfTimeouts () {
            $rootScope.arrayOfTimeouts = [
                $timeout(throwingRandomly, 4000),
                $timeout(throwingRandomly, 5000),
                $timeout(throwingRandomly, 6000)
            ];

            $q
                .all($rootScope.arrayOfTimeouts)
                .finally(function () {
                    arrayRestartTimeout = $timeout(startArrayOfTimeouts, 5000);
                });
        }

        function stopArrayOfTimeouts () {
            cancelTimeouts(arrayRestartTimeout);
            cancelTimeouts($rootScope.arrayOfTimeouts);
        }

        function startObjectPropertyTimeout (key, fn, delay) {
            $rootScope.objectOfTimeouts[key] = $timeout(function () {
                objectRestartTimeouts[key] = $timeout(function () {
                    startObjectPropertyTimeout(key, fn, delay);
                }, 5000);
                fn();
            }, delay);
        }

        function startObjectOfTimeouts () {
            startObjectPropertyTimeout('first', throwingRandomly, 7000);
            startObjectPropertyTimeout('second', throwingRandomly, 8000);
            startObjectPropertyTimeout('third', throwingRandomly, 9000);
        }

        function stopObjectOfTimeouts () {
            cancelTimeouts(objectRestartTimeouts);
            cancelTimeouts($rootScope.objectOfTimeouts);
        }

        function throwingRandomly() {
            var shouldThrow = (Math.floor((Math.random() * 100) + 1)) % 5 === 0;

            if (shouldThrow) {
                throw 'Error';
            }
        }
    });
}(angular));
