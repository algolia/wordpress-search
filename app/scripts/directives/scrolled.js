module.exports = function($window, $document) {
  return {
    restrict: 'A',
    link: function(scope, elm, attr) {
      var raw = elm[0];
      $document.bind('scroll', function() {
        if (raw.scrollTop + $window.innerHeight >= raw.scrollHeight) {
          scope.$apply(attr.scrolled);
        }
      });
    }
  };
};
