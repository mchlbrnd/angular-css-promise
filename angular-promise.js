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
                noOptions = {stateOptions: {}, animateOptions: {}},
                ngPromiseOptions = $scope.$eval($attrs.ngPromiseOptions) || {};

            self.$$promise = null;

            ngPromiseOptions = angular.merge({}, $promiseOptions, ngPromiseOptions, {
                stateOptions: {
                    class: $element[0].classList[0] || $promiseOptions.stateOptions.class
                }
            });

            function joinClassNames (separator) {
                return function () {
                    var args = Array.prototype.slice.call(arguments);
                    return args.filter(function (arg) {
                       return angular.isString(arg);
                    }).join(separator);
                };
            }

            function extendAnimateOptions () {
                var args = [{}, ngPromiseOptions.animateOptions].concat(Array.prototype.slice.call(arguments));
                return angular.extend.apply(this, args);
            }

            function wrap (animateOptionsFn, options, parentFnName, afterAnimateFn) {
                options = extendAnimateOptions((animateOptionsFn || angular.noop)(options || noOptions) || {});

                $animateCss($element, options)
                    .start()
                    .done(function () {
                        (afterAnimateFn || angular.noop)();
                    });

                (self.$$parentPromise[parentFnName] || angular.noop)(ngPromiseOptions);
            }

            self.initialize = function () {
                function getOptions () {
                    return {
                        addClass: joinClassNames(' ')(ngPromiseOptions.stateOptions.class)
                    };
                }

                wrap(getOptions);
            };

            self.pending = function (childOptions) {
                function getOptions (options) {
                    return {
                        addClass: joinClassNames('-')(options.stateOptions.class, options.stateOptions.pending || ngPromiseOptions.stateOptions.pending),
                        removeClass: joinClassNames(' ').apply(null, [
                            joinClassNames('-')(options.stateOptions.class, options.stateOptions.settled || ngPromiseOptions.stateOptions.settled),
                            joinClassNames('-')(options.stateOptions.class, options.stateOptions.resolved || ngPromiseOptions.stateOptions.resolved),
                            joinClassNames('-')(options.stateOptions.class, options.stateOptions.rejected || ngPromiseOptions.stateOptions.rejected)
                        ])
                    };
                }

                wrap(getOptions, childOptions, 'pending');
            };

            function settle () {
                if (self.$$promise) self.settle();
            }

            self.resolve = function (childOptions) {
                function getOptions (options) {
                    return extendAnimateOptions({
                        addClass: joinClassNames('-')(options.stateOptions.class, options.stateOptions.resolved || ngPromiseOptions.stateOptions.resolved),
                        removeClass: joinClassNames('-')(options.stateOptions.class, options.stateOptions.pending || ngPromiseOptions.stateOptions.pending)
                    });
                }

                wrap(getOptions, childOptions, 'resolve', settle);
            };

            self.reject = function (childOptions) {
                function getOptions (options) {
                    return extendAnimateOptions({
                        addClass: joinClassNames('-')(options.stateOptions.class, options.stateOptions.rejected || ngPromiseOptions.stateOptions.rejected),
                        removeClass: joinClassNames('-')(options.stateOptions.class, options.stateOptions.pending || ngPromiseOptions.stateOptions.pending)
                    });
                }

                wrap(getOptions, childOptions, 'reject', settle);
            };

            self.settle = function (childOptions) {
                function getOptions (options) {
                    return extendAnimateOptions({
                        addClass: joinClassNames('-')(options.stateOptions.class, options.stateOptions.settled || ngPromiseOptions.stateOptions.settled)
                    });
                }

                wrap(getOptions, childOptions, 'settle');
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

            function ngPromiseChanged (newPromise) {
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
