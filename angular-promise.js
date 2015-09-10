(function (angular, undefined) {
    'use strict';

    var ngModule = angular.module('ngPromise', ['ngAnimate']);

    var defaultAnimateOptions = {
        duration: 1
    };

    ngModule.value('$promiseOptions', {
        class: {
            animateOptions: defaultAnimateOptions
        },
        pending: {
            name: 'ng-promise-pending',
            animateOptions: defaultAnimateOptions
        },
        settle: {
            name: 'ng-promise-settled',
            animateOptions: defaultAnimateOptions
        },
        resolve: {
            name: 'ng-promise-resolved',
            animateOptions: defaultAnimateOptions
        },
        reject: {
            name: 'ng-promise-rejected',
            animateOptions: defaultAnimateOptions
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
                ngPromiseOptions = $scope.$eval($attrs.ngPromiseOptions) || {};

            self.$$promise = null;

            ngPromiseOptions = angular.merge({}, $promiseOptions, ngPromiseOptions, {
                class: {
                    name: $element[0].classList[0] || $promiseOptions.class.name
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

            function extendAnimateOptions (state) {
                return function () {
                    var args = [{}, state ? ngPromiseOptions[state].animateOptions : {}].concat(Array.prototype.slice.call(arguments));
                    return angular.extend.apply(this, args);
                }
            }

            function wrap (animateOptionsFn, options, state, afterAnimateFn) {
                var _options = angular.copy(options || ngPromiseOptions);
                if (options === undefined) delete _options.class.name;
                _options = extendAnimateOptions(state)((animateOptionsFn || angular.noop)(_options));

                $animateCss($element, _options)
                    .start()
                    .done(function () {
                        (afterAnimateFn || angular.noop)();
                    });

                (self.$$parentPromise[state] || angular.noop)(ngPromiseOptions);
            }

            self.initialize = function () {
                function getOptions () {
                    return {
                        addClass: ngPromiseOptions.class.name
                    };
                }

                wrap(getOptions);
            };

            self.pending = function (childOptions) {
                function getOptions (options) {
                    return {
                        addClass: joinClassNames('-')(options.class.name, options.pending.name || ngPromiseOptions.pending.name),
                        removeClass: joinClassNames(' ').apply(null, [
                            joinClassNames('-')(options.class.name, options.settle.name || ngPromiseOptions.settle.name),
                            joinClassNames('-')(options.class.name, options.resolve.name || ngPromiseOptions.resolve.name),
                            joinClassNames('-')(options.class.name, options.reject.name || ngPromiseOptions.reject.name)
                        ])
                    };
                }

                wrap(getOptions, childOptions, 'pending');
            };

            self.resolve = function (childOptions) {
                function getOptions (options) {
                    return {
                        addClass: joinClassNames('-')(options.class.name, options.resolve.name || ngPromiseOptions.resolve.name),
                        removeClass: joinClassNames('-')(options.class.name, options.pending.name || ngPromiseOptions.pending.name)
                    };
                }

                wrap(getOptions, childOptions, 'resolve', settle);
            };

            self.reject = function (childOptions) {
                function getOptions (options) {
                    return {
                        addClass: joinClassNames('-')(options.class.name, options.reject.name || ngPromiseOptions.reject.name),
                        removeClass: joinClassNames('-')(options.class.name, options.pending.name || ngPromiseOptions.pending.name)
                    };
                }

                wrap(getOptions, childOptions, 'reject', settle);
            };

            function settle () {
                if (self.$$promise) self.settle();
            }

            self.settle = function (childOptions) {
                function getOptions (options) {
                    return {
                        addClass: joinClassNames('-')(options.class.name, options.settle.name || ngPromiseOptions.settle.name)
                    };
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

            $scope.$watchCollection(function () {
                return $scope.$eval($attrs.ngPromiseOptions);
            }, function (newAnimateOptions) {
                ngPromiseOptions = angular.extend({}, $promiseOptions, ngPromiseOptions, newAnimateOptions || {});
            });
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
