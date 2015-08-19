(function (angular, undefined) {
    'use strict';

    var CLASS_NG_PROMISE = 'ng-promise';
    var CLASS_NG_PROMISE_PENDING = 'ng-promise-pending';
    var CLASS_NG_PROMISE_SETTLED = 'ng-promise-settled';
    var CLASS_NG_PROMISE_RESOLVED = 'ng-promise-resolved';
    var CLASS_NG_PROMISE_REJECTED = 'ng-promise-rejected';

    var app = angular.module('ngPromiseDemo', ['ngAnimate']);

    app.directive('ngPromise', ['$animateCss', function ngPromiseDirective($animateCss) {
        function NgPromiseController($scope, $element, $attrs, $q) {
            var self = this;

            self.$$promise = null;
            self.$$promises = {};
            self.$$element = $element;

            self.extendAnimateCssOptions = function (animateCssOptions) {
                return angular.extend({}, animateCssOptions, self.$$animateCssOptions || {});
            };

            self.initialize = function (element) {
                $animateCss(element, {
                    addClass: CLASS_NG_PROMISE
                }).start();
            };

            self.pending = function (element, animateCssOptions, className) {
                if (element === undefined) {
                    return;
                }

                className = className || '';

                var classesToRemove = [
                    CLASS_NG_PROMISE_SETTLED + className,
                    CLASS_NG_PROMISE_RESOLVED + className,
                    CLASS_NG_PROMISE_REJECTED + className
                ].join(' ');

                var options = self.extendAnimateCssOptions({
                    addClass: CLASS_NG_PROMISE_PENDING + className,
                    removeClass: classesToRemove
                });

                var animator = $animateCss(element, options);
                animator.start();
            };

            self.resolve = function (element, animateCssOptions, className) {
                var resolvedClass = CLASS_NG_PROMISE_RESOLVED + (className || '');
                var options = self.extendAnimateCssOptions({
                    addClass: resolvedClass,
                    removeClass: CLASS_NG_PROMISE_PENDING + (className || '')
                });

                $animateCss(element, options)
                    .start()
                    .done(function () {
                        settle(element, className);
                    });
            };

            self.reject = function (element, animateCssOptions, className) {
                var rejectedClass = CLASS_NG_PROMISE_REJECTED + (className || '');
                var options = self.extendAnimateCssOptions({
                    addClass: rejectedClass,
                    removeClass: CLASS_NG_PROMISE_PENDING + (className || '')
                });

                $animateCss(element, options)
                    .start()
                    .done(function () {
                        settle(element, className);
                    });
            };

            function settle (element, className) {
                var options = self.extendAnimateCssOptions({
                    addClass: CLASS_NG_PROMISE_SETTLED + (className || '')
                });

                $animateCss(element, options).start();
            }

            function process(promise) {
                self.pending($element);

                return promise
                    .then(function () {
                        self.resolve($element);
                    })
                    .catch(function () {
                        self.reject($element);
                    });
            }

            function ngPromiseChanged(value) {
                if (value === undefined) {
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

            $scope.$watch($attrs.ngPromise, ngPromiseChanged);

            self.getAnimateCssOptions = function (newOptions) {
                if (newOptions === undefined) {
                    return self.$$animateCssOptions;
                }
                return self.$$animateCssOptions = $scope.$eval($attrs.ngPromiseAnimateCssOptions) || {};
            };

            $scope.$watch(function () {
                return $attrs.ngPromiseAnimateCssOptions;
            }, self.getAnimateCssOptions);

            self.initialize($element);
        }

        return {
            restrict: 'A',
            controllerAs: '$promise',
            bindToScope: true,
            controller: NgPromiseController
        };
    }]);

    app.directive('ngPromised', function ngPromisedDirective() {
        return {
            restrict: 'A',
            require: '^ngPromise',
            link: function (scope, element, attrs, $promise) {
                var $element = angular.element(element);
                var key = attrs.ngPromised;

                if (key === undefined || key === '') {
                    throw 'ngPromised is not set or empty String';
                }

                var classNamePostfix = '-' + key;

                function objectValueChanged(promise) {
                    if (promise === undefined) {
                        return;
                    }

                    var animationCssOptions = scope.$eval(attrs.ngPromiseAnimateCssOptions) || $promise.getAnimateCssOptions();

                    $promise.pending(element, animationCssOptions);
                    $promise.pending($promise.$$element, animationCssOptions, classNamePostfix);

                    promise
                        .then(function () {
                            $promise.resolve($element, animationCssOptions);
                            $promise.resolve($promise.$$element, animationCssOptions, classNamePostfix);
                        })
                        .catch(function () {
                            $promise.reject($element, animationCssOptions);
                            $promise.reject($promise.$$element, animationCssOptions, classNamePostfix);
                        });
                }

                function watchObjectValue() {
                    return $promise.$$promises[key];
                }

                scope.$watch(watchObjectValue, objectValueChanged);

                $promise.initialize($element);
            }
        };
    });
}(angular));
