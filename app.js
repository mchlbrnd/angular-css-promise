(function(angular) {
  'use strict';

  var app = angular.module('ngPromiseDemo');

  app.run(function ($rootScope, $timeout, $q) {
    function throwingRandomly () {
      var shouldThrow = (Math.floor((Math.random() * 100) + 1)) % 5 === 0;

      if(shouldThrow) {
        throw 'Error';
      }
    }

    var getOnePromise = function () {
      $rootScope.onePromise = $timeout(throwingRandomly, 2000).finally(function () {
        $timeout(getOnePromise, 2000); // wait a bit before reloading
      });
    };

    getOnePromise();

    var getArrayOfPromises = function () {
      $rootScope.arrayOfPromises = [
        $timeout(throwingRandomly, 2000),
        $timeout(throwingRandomly, 3000),
        $timeout(throwingRandomly, 4000)
      ];

      $q.all($rootScope.arrayOfPromises).finally(function () {
        $timeout(getArrayOfPromises, 2000);
      });
    };

    getArrayOfPromises();

    $rootScope.objectOfPromises = {};
    var getObjectPropertyPromise = function (key, fn, delay) {
      $rootScope.objectOfPromises[key] = $timeout(fn, delay).finally(function () {
          $timeout(function () {
            getObjectPropertyPromise(key, fn, delay);
          }, 2000);
      });
    };

    getObjectPropertyPromise('first', throwingRandomly, 5000);
    getObjectPropertyPromise('second', throwingRandomly, 6000);
    getObjectPropertyPromise('third', throwingRandomly, 7000);
  });
}(angular));
