module.exports = function($compile, $parse) {
  'use strict';
  return {
    scope: true, // required to be able to clear watchers safely
    compile: function(el) {
      var template = getElementAsHtml(el);
      return function link(scope, $el, attrs) {
        var stopWatching = scope.$parent.$watch(attrs.forceRecompile, function(_new, _old) {
          if (!_new || _new === _old) {
            return;
          }

          // recompile
          var newEl = $compile(template)(scope.$parent);
          $el.replaceWith(newEl);

          // Destroy old scope, reassign new scope.
          stopWatching();
          scope.$destroy();
        });
      };
    }
  };

  function getElementAsHtml(el) {
    return angular.element('<a></a>').append(el.clone()).html();
  }
};
