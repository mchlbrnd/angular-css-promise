(function(angular) {
  'use strict';

  var CLASS_NG_PROMISE = 'ng-promise';
  var CLASS_NG_PROMISE_INITIAL = 'ng-promise-initial';
  var CLASS_NG_PROMISE_PENDING = 'ng-promise-pending';
  var CLASS_NG_PROMISE_SETTLED = 'ng-promise-settled';
  var CLASS_NG_PROMISE_RESOLVED = 'ng-promise-resolved';
  var CLASS_NG_PROMISE_REJECTED = 'ng-promise-rejected';

  var app = angular.module('ngPromiseDemo', ['ngAnimate']);

  app.directive('ngPromise', ['$animateCss', function ngPromiseDirective ($animateCss) {
    function NgPromiseController ($scope, $element, $attrs, $q) {
      var self = this;

      self.$$promise = null;
      self.$$promises = {};
      self.$$element = $element;
      self.$$animateCssOptions = $scope.$eval($attrs.ngPromiseAnimateOptions) || {};

      self.init = function (element) {
        var animator = $animateCss(element, {
          addClass: CLASS_NG_PROMISE
        });

        animator.start();
      };

      self.initialize = function (element, animateCssOptions, className) {
        if (!element) {
          return;
        }

        className = className || '';

        var classesToRemove = [
          CLASS_NG_PROMISE_INITIAL + className,
          CLASS_NG_PROMISE_SETTLED + className,
          CLASS_NG_PROMISE_RESOLVED + className,
          CLASS_NG_PROMISE_REJECTED + className
        ].join(' ');

        var options = angular.extend({}, animateCssOptions || self.$$animateCssOptions, {
          addClass: CLASS_NG_PROMISE_PENDING + className,
          removeClass: classesToRemove
        });

        var animator = $animateCss(element, options);
        animator.start();
      };

      self.resolve = function (element, animateCssOptions, className) {
        var options = angular.extend({}, animateCssOptions || self.$$animateCssOptions, {
          addClass: CLASS_NG_PROMISE_RESOLVED + (className || '')
        });

        var animator = $animateCss(element, options);
        animator.start();
      };

      self.reject = function (element, animateCssOptions, className) {
        var options = angular.extend({}, animateCssOptions || self.$$animateCssOptions, {
          addClass: CLASS_NG_PROMISE_REJECTED + (className || '')
        });

        var animator = $animateCss(element, options);
        animator.start();
      };

      self.finally = function (element, animateCssOptions, className) {
        var options = angular.extend({}, animateCssOptions || self.$$animateCssOptions, {
          addClass: CLASS_NG_PROMISE_SETTLED + (className || ''),
          removeClass: CLASS_NG_PROMISE_PENDING + (className || '')
        });
        var animator = $animateCss(element, options);
        animator.start();
      };

      function process (promise) {
        self.initialize($element);

        return promise
          .then(function () {
            self.resolve($element);
          })
          .catch(function () {
            self.reject($element);
          })
          .finally(function () {
            self.finally($element);
          });
      }

      function watch (value) {
        if (angular.isUndefined(value)) {
          return;
        }

        if (value && angular.isFunction(value.then)) {
          self.$$promise = process(value);
        } else if (angular.isArray(value)) {
          self.$$promise = process($q.all(value.map(function (_value) {
            return $q.when(_value);
          })));
        } else if (angular.isObject(value)) {
          self.$$promises = value;
        } else {
          self.$$promise = process($q.when(value));
        }
      }
      $scope.$watch($attrs.ngPromise, watch);
      
      self.init($element);
    }

    return {
      restrict: 'A',
      controllerAs: '$promise',
      bindToScope: true,
      controller: NgPromiseController
    };
  }]);

  app.directive('ngPromised', function ngPromisedDirective () {
    return {
      restrict: 'A',
      require: '^ngPromise',
      link: function (scope, element, attrs, $promise) {
        var $element = angular.element(element);
        var key = attrs.ngPromised;
        var classNamePostfix = '-' + key;

        scope.$watch(function () {
          return $promise.$$promises[key];
        }, function (promise) {
          var animationCssOptions = scope.$eval(attrs.animateOptions) || $promise.$$animateCssOptions;

          $promise.initialize(element, animationCssOptions);
          $promise.initialize($promise.$$element, classNamePostfix);

          promise
            .then(function () {
              $promise.resolve($element, animationCssOptions);
              $promise.resolve($promise.$$element, classNamePostfix);
            })
            .catch(function () {
              $promise.reject($element, animationCssOptions);
              $promise.reject($promise.$$element, classNamePostfix);
            })
            .finally(function () {
              $promise.finally($element, animationCssOptions);
              $promise.finally($promise.$$element, classNamePostfix);
            });
          });

        $promise.init($element);
      }
    };
  });
}(angular));
