"use strict";

require(
       ['$api/models', '$api/library#Library', '$views/list#List', '$views/image#Image', '$views/buttons#Button'],
function(models,        Library,                List,               Image,                Button)
{

function Subreddit(data)
{
    // Build the subreddit HTML
    this.element = $($.parseHTML(
        "<div class='subreddit'><div class='subreddit-header'><span class='title' /></div><div class='img-wrapper' /><div class='list-wrapper'/></div>"));

    this.tracks = data.tracks || [];
    this.name = data.name;

    // Set the sub title
    this.element.find('.title').text(this.name);

    // Set up the Save as Playlist button
    this.addButton = Button.withLabel("Save as Playlist");
    this.addButton.setIcon("res/add.png");
    this.addButton.setAccentuated(true);
    this.element.find('.subreddit-header').append(this.addButton.node);
    $(this.addButton.node).click(this.playlistButtonClicked.bind(this));
}

RLViews.Subreddit = Subreddit;

// Returns a promise
Subreddit.prototype.init = function()
{
    var promise = new models.Promise();
    
    // Now entering callback hell
    var trackUris = $.grep(this.tracks, function(uri) { return uri != null; });
    trackUris = trackUris.slice(0, 9); // Limit to 9 visible tracks
    var tracks = $.map(trackUris, models.Track.fromURI.bind(models.Track));

    Util.playlistWithTracks(this.name.replace(/\//g, ''), tracks, true).done(
        this,
        function(playlist)
        {
            this.playlist = playlist;
            imageForTempPlaylist(playlist, this.name).done(this, function(image)
            {
                this.element.find(".img-wrapper").append(image.node);

                promise.setDone(this);
            });

            // Set the sub list
            var list = List.forPlaylist(playlist, { style: 'rounded' });
            list.init();
            this.element.find(".list-wrapper").append(list.node);
        });

    return promise;
};

Subreddit.prototype.playlistButtonClicked = function()
{
    if (this.playlist)
    {
        this.addButton.setLabel('Saved as playlist');
        this.addButton.setIcon(null);
        this.addButton.setDisabled(true);
        this.playlist.tracks.snapshot().done(this, function(snapshot)
        {
            Util.playlistWithTracks(this.name, snapshot.toArray());
        });
    }
};

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

var imgSize = 250;
function imageForTempPlaylist(playlist, name)
{
    // Create image
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

            promise.setDone(Image.fromSource(imageUri, { player: true, width: imgSize, height: imgSize, overlay: [name], playerItem: playlist }));
        })
        .fail(function()
        {
            promise.setFail("Snapshot failed");
        });

    return promise;
}

});