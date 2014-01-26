window.RLViews = {}
window.Util = {}

Util.timeMs = ->
    return (new Date()).valueOf()

require(
 ['$api/models'],
  (models) ->
    Util.playlistWithTracks = (name, tracks, temp) ->
        p = new models.Promise()

        playlistP = 
            if temp 
            then models.Playlist.createTemporary(name)
            else models.Playlist.create(name)

        playlistP.done (playlist) ->
            playlist.load('tracks').done ->
                # the old tracks are always here, even calling removeTemporary...
                playlist.tracks.clear()

                # Populate the playlist
                playlist.tracks.add(tracks).done ->
                    p.setDone(playlist)

        return p
)

class Container
    constructor: ->
        @children = []

    destroy: ->
        child.destroy() for child in @children when child.destroy?
        @children = []

window.Container = Container