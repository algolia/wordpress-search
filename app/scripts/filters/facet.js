"use strict";

var titleFilter = function() {
  return function(name) {
    switch (name) {
      case "author": return "Author";
      case "tags": return "Tags";
      case "rating": return "Ratings";
      default: return "N/A";
    }
  };
};

var valueFilter = function() {
  return function(value, facet) {
    if (facet === 'tags') {
      return value.slice(0, 1).toUpperCase() + value.slice(1);
    }
    return value;
  };
};

module.exports = {
  titleFilter: titleFilter,
  valueFilter: valueFilter
};
