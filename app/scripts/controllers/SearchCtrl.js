"use strict";

var algoliasearchHelper = require('algoliasearch-helper');

var SearchCtrl = function($scope, $sce, $timeout, algolia) {
  $scope.client = algolia.Client('latency', 'f394cda609ddd0db79743b7c5182af09');
  $scope.helper = algoliasearchHelper($scope.client, 'wordpress_plugins', {
    facets: ['tags', 'author']
  });
  $scope.q = '';

  var blurring = null;
  var blurredAt = new Date().getTime();
  var delayedContent = null;
  var unblur = function(content) {
    $scope.blurred = false;
    if (blurring) {
      $timeout.cancel(blurring);
      blurring = null;
    }
    blurredAt = new Date().getTime();
    $scope.content = content;
  };

  $scope.helper.on('result', function(content) {
    $scope.$apply(function() {
      var now = new Date().getTime();
      if (!$scope.blurred || !$scope.q || ($scope.content && $scope.content.hits.length === 0) || blurredAt + 1000 < now) {
        unblur(content);
      } else {
        delayedContent = content;
      }
    })
  });

  $scope.$watch('q', function(q) {
    $scope.blurred = true;
    blurring && $timeout.cancel(blurring);
    blurring = $timeout(function() {
      unblur(delayedContent);
    }, 200);

    $scope.helper.setQuery(q).search();
  });

  $scope.toggleRefine = function($event, facet, value) {
    $event.preventDefault();
    $scope.helper.toggleRefine(facet, value).search();
  };

  $scope.submit = function() {
    unblur(delayedContent || $scope.content);
  };
};

module.exports = SearchCtrl;
