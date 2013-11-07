RLViews = {};

require(
       ['$api/models', '$views/list#List', '$views/image#Image'],
function(models,        List,               Image) 
{

// Returns a promise that resolves to a subreddit
RLViews.createSubreddit = function(data)
{
    var s = new Subreddit();
    return s.init(data);
}

function Subreddit()
{
}

// Returns a promise
Subreddit.prototype.init = function(data)
{
    var promise = new models.Promise();

    // Build the subreddit HTML
    var item = $($.parseHTML(
        "<div class='subreddit'><div class='title' /><div class='img-wrapper' /><div class='list-wrapper'/></div>"));

    // Set the sub title
    item.find('.title').text(data.name);

    // Create a temp playlist
    models.Playlist.createTemporary(data.name.replace(/\//g, '')).done(this, function(playlist)
    {
        this.playlist = playlist;
        playlist.load('tracks').done(this, function()
        {
            // the old tracks are always here, even calling removeTemporary...
            playlist.tracks.clear();

            var trackUris = $.map(data.tracks, function(item) { return item['sp-uri']; });
            var tracks = $.map(trackUris, models.Track.fromURI.bind(models.Track));

            // Populate the playlist
            playlist.tracks.add(tracks).done(this, function()
            {
                imageForTempPlaylist(playlist, data.name).done(this, function(image)
                {
                    item.find(".img-wrapper").append(image.node);
                    this.node = item;

                    promise.setDone(this);
                });

                // Set the sub list
                var list = List.forPlaylist(playlist, { style: 'rounded', height: 'fixed' });
                list.init();
                item.find(".list-wrapper").append(list.node);
            })
            .fail(function(){console.log('add tracks fail'); promise.setFail(); });
        })
        .fail(function(){console.log('load "tracks" fail'); promise.setFail(); });
    })
    .fail(function(){console.log('create temp playlist fail'); promise.setFail(); });

    return promise;
};

Subreddit.prototype.dispose = function()
{
    return models.Playlist.removeTemporary(this.playlist);
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