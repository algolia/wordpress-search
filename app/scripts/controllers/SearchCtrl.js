"use strict";

var algoliasearchHelper = require('algoliasearch-helper');
var forEach = require('lodash.foreach');

var SearchCtrl = function($scope, $sce, $timeout, $location, algolia) {
  $scope.client = algolia.Client('YE0A9ATLJG', '1abceba46dace8485375bc325f0144b5');
  $scope.helper = algoliasearchHelper($scope.client, 'wordpress_plugins', {
    facets: ['tags', 'author'],
    disjunctiveFacets: ['rating'],
    attributesToRetrieve: ['name', 'slug', 'rating', 'num_ratings', 'downloaded', 'last_updated', 'ratings'],
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
    content.ratingFacet = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    forEach(content.hits, function(hit) {
      var rating = hit.rating;
      hit.stars = [];
      for (var i = 1; i <= 5; ++i) {
        if (rating >= i) {
          hit.stars.push(true);
        } else {
          hit.stars.push(false);
        }
      }
    });

    forEach(content.disjunctiveFacets, function(facet) {
      if (facet.name === 'rating') {
        forEach(facet.data, function(count, value) {
          var rating = +value;
          if (rating < 1) {
            // skip
          } else if (rating < 2) {
            content.ratingFacet[1] += count;
          } else if (rating < 3) {
            content.ratingFacet[2] += count;
          } else if (rating < 4) {
            content.ratingFacet[3] += count;
          } else if (rating < 5) {
            content.ratingFacet[4] += count;
          } else {
            content.ratingFacet[5] += count;
          }
        });
        content.facets = [content.facets[0], facet].concat(content.facets.slice(1));
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

  $scope.range = function(v) {
    return new Array(v);
  };
};

module.exports = SearchCtrl;
