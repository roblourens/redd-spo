(function() {
  "use strict";
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  require(['$api/models', '$views/throbber#Throbber'], function(models, Throbber) {
    var Category;
    Category = (function() {
      function Category(id) {
        this.id = id;
        this.renderSubreddit = __bind(this.renderSubreddit, this);
        this.timeRendered = 1;
        this.rendering = false;
        this.shown = false;
        this.subreddits = [];
        this.element = $(document.createElement('div'));
        this.element.addClass("category category-" + id);
      }

      Category.prototype.show = function() {
        var p;
        this.shown = true;
        p = new models.Promise();
        if (this.needsRendering() && !this.rendering) {
          this.removeAllSubreddits();
          this.element.show();
          this.render(p);
        } else {
          this.element.show();
          p.setDone();
        }
        return p;
      };

      Category.prototype.hide = function() {
        this.element.hide();
        return this.shown = false;
      };

      Category.prototype.render = function(p) {
        this.rendering = true;
        this.showLoading();
        return Data.getSubredditsForCategory(this.id).done((function(_this) {
          return function(subredditNames) {
            var e;
            try {
              _this.hideLoading();
              subredditNames.forEach(_this.renderSubreddit);
              return _this.timeRendered = Util.timeMs();
            } catch (_error) {
              e = _error;
              return console.log('Category rendering failed: ' + e);
            } finally {
              p.setDone();
            }
          };
        })(this)).fail(function() {
          return p.setFail('net');
        }).always((function(_this) {
          return function() {
            return _this.rendering = false;
          };
        })(this));
      };

      Category.prototype.showLoading = function() {
        this.throbber = Throbber.forElement(this.element[0]);
        this.throbber.setSize('small');
        return this.throbber.show();
      };

      Category.prototype.hideLoading = function() {
        this.throbber.hide();
        return this.throbber = null;
      };

      Category.prototype.renderSubreddit = function(subredditName) {
        var subreddit;
        subreddit = new RLViews.Subreddit(subredditName);
        subreddit.render();
        this.subreddits.push(subreddit);
        return this.element.append(subreddit.element);
      };

      Category.prototype.removeAllSubreddits = function() {
        this.subreddits.forEach(function(subreddit) {
          subreddit.element.remove();
          return subreddit.destroy();
        });
        return this.subreddits = [];
      };

      Category.prototype.needsRendering = function() {
        return Config.AlwaysRerender || (Util.timeMs() - this.timeRendered > 30 * 60 * 1000);
      };

      return Category;

    })();
    return RLViews.Category = Category;
  });

}).call(this);
