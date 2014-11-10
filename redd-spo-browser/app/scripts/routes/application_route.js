(function() {
  ReddSpoBrowser.ApplicationRoute = Ember.Route.extend({
    model: (function(_this) {
      return function() {
        return ['red', 'yellow', 'blue'];
      };
    })(this)
  });

}).call(this);
