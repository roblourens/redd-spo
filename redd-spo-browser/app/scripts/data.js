(function() {
  "use strict";
  window.Data = {};

  require(['$api/models'], function(models) {
    var getJson;
    getJson = function(url) {
      var p;
      p = new models.Promise();
      $.get(url + "?" + Util.timeMs()).done(function(data) {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        return p.setDone(data);
      }).fail(function(e) {
        return p.setFail(e);
      });
      return p;
    };
    Data.getSubredditsForCategory = function(categoryId) {
      var p;
      p = new models.Promise();
      if (Data.Categories == null) {
        getJson(Config.CategoriesUrl + "?" + Util.timeMs()).done((function(_this) {
          return function(data) {
            Data.Categories = data;
            return p.setDone(Data.Categories[categoryId]);
          };
        })(this));
      } else {
        p.setDone(Data.Categories[categoryId]);
      }
      return p;
    };
    return Data.getSubredditData = function(subredditName) {
      return getJson(Config.UrlBase + "data/" + subredditName + ".json");
    };
  });

}).call(this);
