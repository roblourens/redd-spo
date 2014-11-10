(function() {
  var Container;

  window.RLViews = {};

  window.Util = {};

  Util.timeMs = function() {
    return (new Date()).valueOf();
  };

  require(['$api/models'], function(models) {
    return Util.playlistWithTracks = function(name, tracks, temp) {
      var p, playlistP;
      p = new models.Promise();
      playlistP = temp ? models.Playlist.createTemporary(name) : models.Playlist.create(name);
      playlistP.done(function(playlist) {
        return playlist.load('tracks').done(function() {
          playlist.tracks.clear();
          return playlist.tracks.add(tracks).done(function() {
            return p.setDone(playlist);
          });
        });
      });
      return p;
    };
  });

  Container = (function() {
    function Container() {
      this.children = [];
    }

    Container.prototype.destroy = function() {
      var child, _i, _len, _ref;
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child.destroy != null) {
          child.destroy();
        }
      }
      return this.children = [];
    };

    return Container;

  })();

  window.Container = Container;

  Util.setNaturalSize = function(el, prop) {
    var elem, height, width;
    elem = $(el).clone().css({
      "height": "auto",
      "width": "auto"
    }).appendTo("body");
    height = elem.css("height");
    width = elem.css("width");
    elem.remove();
    if (prop === "height") {
      return el.height(height);
    } else if (prop === "width") {
      return el.width(width);
    }
  };

}).call(this);
