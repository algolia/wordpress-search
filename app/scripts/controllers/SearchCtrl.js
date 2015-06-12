"use strict";

var algoliasearchHelper = require('algoliasearch-helper');
var forEach = require('lodash.foreach');
var parseInt = require('lodash.parseint');

var SearchCtrl = function($scope, $sce, $timeout, $location, algolia) {
  $scope.client = algolia.Client('YE0A9ATLJG', '1abceba46dace8485375bc325f0144b5');
  $scope.helper = algoliasearchHelper($scope.client, 'wordpress_plugins', {
    facets: ['tags', 'author'],
    attributesToRetrieve: ['name', 'slug', 'num_ratings', 'downloaded', 'last_updated', 'ratings'],
    attributesToHighlight: ['name', 'short_description', 'author', 'tags']
  });
  $scope.q = $location.search().q || '';
  $scope.page = 0;

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

    if (!content || content.page === 0) {
      $scope.content = content;
    } else {
      forEach(content.hits, function(hit) {
        hit.concatenated = true;
      });
      $scope.content.hits = $scope.content.hits.concat(content.hits);
    }

    if (content && content.query) {
      $location.search('q', content.query).replace();
    }
  };

  $scope.helper.on('result', function(content) {
    forEach(content.hits, function(hit) {
      var rating = hit.num_ratings == 0 ? 0 : (parseInt(hit.ratings['1']) +
        parseInt(hit.ratings['2']) * 2 +
        parseInt(hit.ratings['3']) * 3 +
        parseInt(hit.ratings['4']) * 4 +
        parseInt(hit.ratings['5']) * 5) / hit.num_ratings;
      hit.stars = [];
      for (var i = 1; i <= 5; ++i) {
        if (rating >= i + 0.5) {
          hit.stars.push(1);
        } else if (rating < i) {
          hit.stars.push(0);
        } else {
          hit.stars.push(0.5);
        }
      }
    });

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
    $scope.page = 0;
    blurring && $timeout.cancel(blurring);
    blurring = $timeout(function() {
      unblur(delayedContent);
    }, 100);

    $scope.helper.setQuery(q).search();
  });

  $scope.toggleRefine = function($event, facet, value) {
    $event.preventDefault();
    $scope.helper.state = $scope.helper.state.setPage(0); // FIXME
    $scope.helper.toggleRefine(facet, value).search();
  };

  $scope.submit = function() {
    unblur(delayedContent || $scope.content);
  };

  $scope.loadMore = function() {
    $scope.page += 1;
    $scope.helper.state = $scope.helper.state.setPage($scope.page); // FIXME
    $scope.helper.search();
  };
};

module.exports = SearchCtrl;
