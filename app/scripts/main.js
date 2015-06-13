'use strict';

var angular = require('angular');
require('angular-sanitize');
require('angular-moment');
require('algoliasearch/src/browser/builds/algoliasearch.angular');

var SearchCtrl = require('./controllers/SearchCtrl');
var facet = require('./filters/facet');
var moment = require('./filters/moment');
var scrolled = require('./directives/scrolled');

var app = angular.module('myApp', ['ngSanitize', 'algoliasearch', 'angularMoment']);

app.controller('SearchCtrl', ['$scope', '$sce', '$timeout', '$location', 'algolia', SearchCtrl]);

app.filter('facetTitle', facet.titleFilter);
app.filter('facetValue', facet.valueFilter);
app.filter('fromNow', ['moment', moment.fromNow]);

app.directive('scrolled', ['$window', '$document', scrolled]);
