**ngPromise attribute directive**

Addds classes to elements which reflect outcome of promise(s).

*Example*

**Promise and Array of Promises ($q.all)**
<element ng-promise="oneOrArray"/>

1) Add ng-promise-initial class
<element class="ng-promise-initial" ng-promise="oneOrArray"/>

2) Promise is excecuted and pending
<element class="ng-promise-pending" ng-promise="oneOrArray"/>

3) Promise is resolved or reject and settles
<element class="ng-promise-resolved" ng-promise="oneOrArraye"/>
<element class="ng-promise-rejected" ng-promise="oneOrArray"/>

**Object  of Promises**

$scope.object = {
  first: Promise,
  second: Promise,
  third: Promise,
}

<element ng-promise="object">
  <element ng-promised="first"/>
  <element ng-promised="second"/>
  <element ng-promised="third"/>
</element>

1) Add ng-promise-initial class to element for each  Promise in Object (note how nested ng-promised maps to the object keys)
<element class="ng-promise-initial-first ng-promise-initial-second ng-promise-initial-third" ng-promise="object">
  <element class="ng-promise-initial" ng-promised="first"/>
  <element class="ng-promise-initial" ng-promised="second"/>
  <element class="ng-promise-initial" ng-promised="third"/>
</element>

2) Object Promises are excecuted and pending
<element class="ng-promise-pending-first ng-promise-pending-second ng-promise-pending-third" ng-promise="object">
  <element class="ng-promise-pending" ng-promised="first"/>
  <element class="ng-promise-pending" ng-promised="second"/>
  <element class="ng-promise-pending" ng-promised="third"/>
</element>

3) Object Promises are resolved or reject, therafter settled
<element class="ng-promise-resolved-first ng-promise-settled-first ng-promise-rejected-second ng-promise-settled-second ng-promise-resolved-third ng-promise-settled-third" ng-promise="object">
  <element class="ng-promise-resolved ng-promise-settled" ng-promised="first"/>
  <element class="ng-promise-rejected ng-promise-settled" ng-promised="second"/>
  <element class="ng-promise-resolved ng-promise-settled" ng-promised="third"/>
</element>