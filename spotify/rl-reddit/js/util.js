// The usual 
// var a = a || {}
// fails - because of strict mode?
RLViews = {};
Util = {};

Util.timeMs = function()
{
    return (new Date()).valueOf();
}


require(
       ['$api/models'],
function(models)
{
    Util.playlistWithTracks = function(name, tracks, temp)
    {
        var p = new models.Promise();

        var playlistP = temp ?
            models.Playlist.createTemporary(name)
            : models.Playlist.create(name);

        playlistP.done(function(playlist)
        {
            playlist.load('tracks').done(function()
            {
                // the old tracks are always here, even calling removeTemporary...
                playlist.tracks.clear();

                // Populate the playlist
                playlist.tracks.add(tracks).done(function()
                {
                    p.setDone(playlist);
                });
            });
        });

        return p;
    }
});