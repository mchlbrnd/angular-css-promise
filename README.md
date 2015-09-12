#README is outdated and will be updated soon! :)#

Example at: http://michaelwolbert.nl/angular-css-promise/example/

#ngPromise attribute directive#

Adds classes to elements which reflect outcome of promise(s).

##Promise and Array of Promises ($q.all)##

```html
<element ng-promise="oneOrArray"/>
```

**Directive steps:**

1) Add ng-promise class

```html
<element class="ng-promise" ng-promise="oneOrArray"/>
```

2) Promise is excecuted and pending

```html
<element class="ng-promise-pending" ng-promise="oneOrArray"/>
```

3) Promise is resolved or reject and settles
```html
<element class="ng-promise-resolved" ng-promise="oneOrArraye"/>
<element class="ng-promise-rejected" ng-promise="oneOrArray"/>
```

##Object of Promises##

```javascript
$scope.object = {
  first: Promise,
  second: Promise,
  third: Promise,
};
```

```html
<element ng-promise="object">
  <element ng-promised="first"/>
  <element ng-promised="second"/>
  <element ng-promised="third"/>
</element>
```

*Directive steps:*

1) Add ng-promise class to element for each Promise in Object (note how nested ng-promised maps to the object keys)

```html
<element class="ng-promise-initial-first ng-promise-initial-second ng-promise-initial-third" ng-promise="object">
  <element class="ng-promise-initial" ng-promised="first"/>
  <element class="ng-promise-initial" ng-promised="second"/>
  <element class="ng-promise-initial" ng-promised="third"/>
</element>
```

2) Object Promises are excecuted and pending

```html
<element class="ng-promise-pending-first ng-promise-pending-second ng-promise-pending-third" ng-promise="object">
  <element class="ng-promise-pending" ng-promised="first"/>
  <element class="ng-promise-pending" ng-promised="second"/>
  <element class="ng-promise-pending" ng-promised="third"/>
</element>
```

3) Object Promises are resolved or reject, therafter settled

```html
<element class="ng-promise-resolved-first ng-promise-settled-first ng-promise-rejected-second ng-promise-settled-second ng-promise-resolved-third ng-promise-settled-third" ng-promise="object">
  <element class="ng-promise-resolved ng-promise-settled" ng-promised="first"/>
  <element class="ng-promise-rejected ng-promise-settled" ng-promised="second"/>
  <element class="ng-promise-resolved ng-promise-settled" ng-promised="third"/>
</element>
```

##ngPromiseAnimateCssOptions attribute##
Bind options to pass to $animateCss calls.

```html
<element class="ng-promise-resolved" ng-promise="onePromise" ng-promise-animate-css-options="{duration: 1}"/>
```
