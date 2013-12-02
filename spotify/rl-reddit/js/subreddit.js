RLViews = {};

require(
       ['$api/models', '$views/list#List', '$views/image#Image'],
function(models,        List,               Image) 
{

function Subreddit(data)
{
    // Build the subreddit HTML
    this.element = $($.parseHTML(
        "<div class='subreddit'><div class='title' /><div class='img-wrapper' /><div class='list-wrapper'/></div>"));

    // Set the sub title
    this.element.find('.title').text(data.name);

    this.data = data;
}

RLViews.Subreddit = Subreddit;

// Returns a promise
Subreddit.prototype.init = function()
{
    var promise = new models.Promise();
    
    // Now entering callback hell
    models.Playlist.createTemporary(this.data.name.replace(/\//g, '')).done(this, function(playlist)
    {
        this.log('createTemporary done');

        this.playlist = playlist;
        playlist.load('tracks').done(this, function()
        {
            this.log('tracks loaded');

            // the old tracks are always here, even calling removeTemporary...
            playlist.tracks.clear();

            var trackUris = $.map(this.data.tracks, function(track) { return track['sp-uri']; });
            trackUris = trackUris.slice(0, 9); // Limit to 9 visible tracks
            var tracks = $.map(trackUris, models.Track.fromURI.bind(models.Track));

            // Populate the playlist
            playlist.tracks.add(tracks).done(this, function()
            {
                this.log('tracks added');
                imageForTempPlaylist(playlist, this.data.name).done(this, function(image)
                {
                    this.log('image created');
                    this.element.find(".img-wrapper").append(image.node);
                    promise.setDone(this);
                });

                // Set the sub list
                var list = List.forPlaylist(playlist, { style: 'rounded' });
                list.init();
                this.element.find(".list-wrapper").append(list.node);
            })
            .fail(function(){console.log('add tracks fail'); promise.setFail(); });
        })
        .fail(function(){console.log('load "tracks" fail'); promise.setFail(); });
    })
    .fail(function(){console.log('create temp playlist fail'); promise.setFail(); });

    return promise;
};

Subreddit.prototype.log = function(msg)
{
    log(this.data.name + ": " + msg);
}

Subreddit.prototype.dispose = function()
{
    // Sometimes this fails because it thinks the playlist is null
    try
    {
        return models.Playlist.removeTemporary(this.playlist);
    }
    catch (e)
    {
        var p = new models.Promise();
        p.setDone();
        return p;
    }
};

// Image.fromPlaylist for temp playlists is "not implemented", assholes
var imgSize = 250;
function imageForTempPlaylist(playlist, name)
{
    var imageUri = "spotify:mosaic:";
    var promise = new models.Promise();
    playlist.tracks.snapshot(0, 4)
        .done(function(snapshot)
        {
            var trackImgUris = $.map(snapshot._meta, function(m) { return m.image; });
            if (trackImgUris.length >= 4)
                imageUri += trackImgUris.slice(0, 4).join(":");
            else if (trackImgUris.length > 0)
                imageUri += trackImgUris[0];

            imageUri = imageUri.replace(/spotify:image:/g, '');

            // player won't work here because this image is created from a uri instead of a playlist.
            // maybe can hack around it - create 2 images, extract the image part of one and insert in the DOM of the playlist one.
            promise.setDone(Image.fromSource(imageUri, { player: true, width: imgSize, height: imgSize, overlay: [name] }));
        })
        .fail(function() {
            promise.setFail("Snapshot failed");
        });

    return promise;
}

});