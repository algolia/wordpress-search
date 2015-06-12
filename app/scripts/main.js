'use strict';

var angular = require('angular');
require('angular-sanitize');
require('algoliasearch/src/browser/builds/algoliasearch.angular');

var SearchCtrl = require('./controllers/SearchCtrl');
var facet = require('./filters/facet');

var app = angular.module('myApp', ['ngSanitize', 'algoliasearch']);

app.controller('SearchCtrl', ['$scope', '$sce', '$timeout', '$location', 'algolia', SearchCtrl]);

app.filter('facetTitle', facet.titleFilter);
app.filter('facetValue', facet.valueFilter);
