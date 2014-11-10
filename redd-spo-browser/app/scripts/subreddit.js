(function() {
  "use strict";
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  require(['$api/models', '$api/library#Library', '$views/list#List', '$views/image#Image', '$views/buttons#Button'], function(models, Library, List, Image, Button) {
    var Subreddit, imageForTempPlaylist, imgSize;
    Subreddit = (function(_super) {
      __extends(Subreddit, _super);

      function Subreddit(name) {
        this.name = name;
        this.onElementVisible = __bind(this.onElementVisible, this);
        this.clicked = __bind(this.clicked, this);
        this.playlistButtonClicked = __bind(this.playlistButtonClicked, this);
        Subreddit.__super__.constructor.apply(this, arguments);
        this.element = $($.parseHTML("<div class='subreddit collapsed' data-appear-top-offset='400'><div class='subreddit-header'><span class='title' /></div><div class='img-wrapper' /><div class='list-wrapper'/></div>"));
        this.imageInitialized = false;
        this.element.find('.title').text('/r/' + this.name);
        this.addButton = Button.withLabel("Save as Playlist");
        this.addButton.setIcon("res/add.png");
        $(this.addButton.node).addClass('add-button');
        this.addButton.setAccentuated(true);
        this.element.find('.subreddit-header').append(this.addButton.node);
        $(this.addButton.node).click(this.playlistButtonClicked);
        this.element.click(this.clicked);
        this.element.find('.img-wrapper, .list-wrapper, .add-button').click(function(e) {
          return e.stopPropagation();
        });
      }

      Subreddit.prototype.render = function() {
        var promise;
        promise = new models.Promise();
        Data.getSubredditData(this.name).done((function(_this) {
          return function(data) {
            var trackUris;
            trackUris = $.grep(data.tracks, function(uri) {
              return uri !== null;
            });
            trackUris = trackUris.slice(0, 25);
            _this.tracks = $.map(trackUris, models.Track.fromURI.bind(models.Track));
            if (_this.tracks.length > 0) {
              _this.element.show();
            } else {
              _this.element.remove();
            }
            return Util.playlistWithTracks(_this.name.replace(/\//g, ''), _this.tracks, true).done(_this, function(playlist) {
              _this.playlist = playlist;
              _this.element.appear().on('appear', _this.onElementVisible);
              if (_this.element.is(':appeared')) {
                return _this.onElementVisible();
              }
            });
          };
        })(this)).fail((function(_this) {
          return function() {
            _this.element.remove();
            return promise.setFail();
          };
        })(this));
        return promise;
      };

      Subreddit.prototype.playlistButtonClicked = function() {
        if (this.playlist) {
          this.addButton.setLabel('Saved as playlist');
          this.addButton.setIcon(null);
          this.addButton.setDisabled(true);
          return this.playlist.tracks.snapshot().done(this, function(snapshot) {
            return Util.playlistWithTracks(this.name, snapshot.toArray());
          });
        }
      };

      Subreddit.prototype.clicked = function() {
        this.element.toggleClass('collapsed');
        return Util.setNaturalSize(this.element.find('.list-wrapper > div'), "height");
      };

      Subreddit.prototype.onElementVisible = function() {
        if (!this.imageInitialized) {
          this.initImage();
        }
        if (!this.listInitialized) {
          return this.initList();
        }
      };

      Subreddit.prototype.initImage = function() {
        this.imageInitialized = true;
        return imageForTempPlaylist(this.playlist, this.name).done(this, function(image) {
          return this.element.find(".img-wrapper").append(image.node);
        });
      };

      Subreddit.prototype.initList = function() {
        this.listInitialized = true;
        this.list = List.forPlaylist(this.playlist, {
          style: 'rounded',
          throbber: 'show-content'
        });
        this.children.push(this.list);
        this.element.find(".list-wrapper").append(this.list.node);
        return this.list.init();
      };

      Subreddit.prototype.destroy = function() {
        var e, p;
        Subreddit.__super__.destroy.apply(this, arguments);
        $(this.addButton.node).unbind('click', this.playlistButtonClicked);
        try {
          return models.Playlist.removeTemporary(this.playlist);
        } catch (_error) {
          e = _error;
          p = new models.Promise();
          p.setDone();
          return p;
        }
      };

      return Subreddit;

    })(Container);
    RLViews.Subreddit = Subreddit;
    imgSize = 250;
    return imageForTempPlaylist = function(playlist, name) {
      var imageUri, promise;
      imageUri = "spotify:mosaic:";
      promise = new models.Promise();
      playlist.tracks.snapshot(0, 4).done(function(snapshot) {
        var trackImgUris;
        trackImgUris = $.map(snapshot._meta, function(m) {
          return m.image;
        });
        if (trackImgUris.length >= 4) {
          imageUri += trackImgUris.slice(0, 4).join(":");
        } else if (trackImgUris.length > 0) {
          imageUri += trackImgUris[0];
        }
        imageUri = imageUri.replace(/spotify:image:/g, '');
        return promise.setDone(Image.fromSource(imageUri, {
          player: true,
          width: imgSize,
          height: imgSize,
          overlay: [name],
          playerItem: playlist
        }));
      }).fail(function() {
        return promise.setFail("Snapshot failed");
      });
      return promise;
    };
  });

}).call(this);
