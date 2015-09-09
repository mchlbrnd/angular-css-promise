(function (angular, undefined) {
    'use strict';

    var ngModule = angular.module('ngPromise', ['ngAnimate']);

    ngModule.value('$promiseOptions', {
        stateOptions: {
            class: 'ng-promise',
            pending: 'ng-promise-pending',
            settled: 'ng-promise-settled',
            resolved: 'ng-promise-resolved',
            rejected: 'ng-promise-rejected'
        },
        animateOptions: {
            duration: 1
        }
    });

    ngModule.directive('ngPromise', ['$animateCss', '$q', function ngPromiseDirective ($animateCss, $q) {
        function ngPromiseCompile () {
            return {
                pre: ngPromisePreLink,
                post: ngPromisePostLink
            };
        }

        function ngPromisePreLink (scope, element, attrs, $promise) {
            scope.$promise.$$parentPromise = $promise || {};
        }

        function ngPromisePostLink (scope, element, attrs, $promise) {
            ($promise && $promise.initialize || angular.noop)();
        }

        var ngPromiseController = ['$scope', '$element', '$attrs', '$promiseOptions', function ($scope, $element, $attrs, $promiseOptions) {
            var self = this,
                defaultOptions = {stateOptions: {}, animateOptions: {}},
                ngPromiseOptions = $scope.$eval($attrs.ngPromiseOptions) || {};

            self.$$promise = null;

            ngPromiseOptions = angular.merge({}, $promiseOptions, ngPromiseOptions, {
                stateOptions: {
                    class: $element[0].classList[0] || $promiseOptions.stateOptions.class
                }
            });

            function joinClassNames(separator) {
                return function () {
                    var args = Array.prototype.slice.call(arguments);
                    return args.filter(function (arg) {
                       return angular.isString(arg);
                    }).join(separator);
                };
            }

            function extendAnimateCssOptions () {
                var args = [{}, ngPromiseOptions.animateOptions].concat(Array.prototype.slice.call(arguments));
                return angular.extend.apply(this, args);
            }

            self.initialize = function () {
                var options = extendAnimateCssOptions({
                    addClass: joinClassNames(' ')(ngPromiseOptions.stateOptions.class)
                });

                $animateCss($element, options).start();
            };

            self.pending = function (childOptions) {
                childOptions = childOptions || defaultOptions;
                var options = extendAnimateCssOptions({
                    addClass: joinClassNames('-')(childOptions.stateOptions.class, childOptions.stateOptions.pending || ngPromiseOptions.stateOptions.pending),
                    removeClass: joinClassNames(' ').apply(null, [
                        joinClassNames('-')(childOptions.stateOptions.class, childOptions.stateOptions.settled || ngPromiseOptions.stateOptions.settled),
                        joinClassNames('-')(childOptions.stateOptions.class, childOptions.stateOptions.resolved || ngPromiseOptions.stateOptions.resolved),
                        joinClassNames('-')(childOptions.stateOptions.class, childOptions.stateOptions.rejected || ngPromiseOptions.stateOptions.rejected)
                    ])
                });

                $animateCss($element, options).start();

                (self.$$parentPromise.pending || angular.noop)(ngPromiseOptions);
            };

            self.resolve = function (childOptions) {
                childOptions = childOptions || defaultOptions;
                var options = extendAnimateCssOptions({
                    addClass: joinClassNames('-')(childOptions.stateOptions.class, childOptions.stateOptions.resolved || ngPromiseOptions.stateOptions.resolved),
                    removeClass: joinClassNames('-')(childOptions.stateOptions.class, childOptions.stateOptions.pending || ngPromiseOptions.stateOptions.pending)
                });

                $animateCss($element, options)
                    .start()
                    .done(function () {
                        if (self.$$promise) self.settle();
                    });

                (self.$$parentPromise.resolve || angular.noop)(ngPromiseOptions);
            };

            self.reject = function (childOptions) {
                childOptions = childOptions || defaultOptions;
                var options = extendAnimateCssOptions({
                    addClass: joinClassNames('-')(childOptions.stateOptions.class, childOptions.stateOptions.rejected || ngPromiseOptions.stateOptions.rejected),
                    removeClass: joinClassNames('-')(childOptions.stateOptions.class, childOptions.stateOptions.pending || ngPromiseOptions.stateOptions.pending)
                });

                $animateCss($element, options)
                    .start()
                    .done(function () {
                        if (self.$$promise) self.settle();
                    });

                (self.$$parentPromise.reject || angular.noop)(ngPromiseOptions);
            };

            self.settle = function (childOptions) {
                childOptions = childOptions || defaultOptions;
                var options = extendAnimateCssOptions({
                    addClass: joinClassNames('-')(childOptions.stateOptions.class, childOptions.stateOptions.settled || ngPromiseOptions.stateOptions.settled)
                });

                $animateCss($element, options).start();

                (self.$$parentPromise.settle || angular.noop)(ngPromiseOptions);
            };

            function process (promise) {
                self.$$promise = promise;
                self.pending();

                self.$$promise
                    .then(function () {
                        self.resolve();
                    })
                    .catch(function () {
                        self.reject();
                    });
            }

            function ngPromiseChanged(newPromise) {
                if (newPromise === undefined) return;

                if (newPromise && angular.isFunction(newPromise.then)) {
                    process(newPromise);
                } else if (angular.isArray(newPromise)) {
                    process($q.all(newPromise.map(function (_value) {
                        return $q.when(_value);
                    })));
                } else if (!angular.isObject(newPromise)) {
                    process($q.when(newPromise));
                }
            }

            $scope.$watch(function () {
                return $scope.$eval($attrs.ngPromise);
            }, ngPromiseChanged);

            $scope.$watch(function () {
                var options = $scope.$eval($attrs.ngPromiseOptions) || {};
                return options.animateOptions;
            }, function (newAnimateOptions) {
                ngPromiseOptions.animateOptions = angular.extend({}, $promiseOptions.animateOptions, ngPromiseOptions.animateOptions, newAnimateOptions || {});
            }, true);
        }];

        return {
            restrict: 'AC',
            controllerAs: '$promise',
            bindToScope: true,
            controller: ngPromiseController,
            compile: ngPromiseCompile,
            require: '?^^ngPromise'
        };
    }]);
}(angular));
