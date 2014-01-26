"use strict"

require(
 ['$api/models', '$api/library#Library', '$views/list#List', '$views/image#Image', '$views/buttons#Button'],
  (models,        Library,                List,               Image,                Button) ->
    class Subreddit extends Container
        constructor: (data) ->
            super

            # Build the subreddit HTML
            @element = $($.parseHTML(
                "<div class='subreddit'><div class='subreddit-header'><span class='title' /></div><div class='img-wrapper' /><div class='list-wrapper'/></div>"))

            @tracks = data.tracks || []
            @name = data.name

            # Set the sub title
            @element.find('.title').text(@name)

            # Set up the Save as Playlist button
            @addButton = Button.withLabel("Save as Playlist")
            @addButton.setIcon("res/add.png")
            @addButton.setAccentuated(true)
            @element.find('.subreddit-header').append(@addButton.node)
            $(@addButton.node).click(@playlistButtonClicked)

        # Returns a promise
        init: ->
            promise = new models.Promise()
            
            # Now entering callback hell
            trackUris = $.grep(@tracks, (uri) -> uri != null )
            trackUris = trackUris.slice(0, 9) # Limit to 9 visible tracks
            tracks = $.map(trackUris, models.Track.fromURI.bind(models.Track))

            Util.playlistWithTracks(@name.replace(/\//g, ''), tracks, true).done(
                this,
                (playlist) =>
                    @playlist = playlist
                    imageForTempPlaylist(playlist, @name).done this, (image) ->
                        @element.find(".img-wrapper").append image.node
                        promise.setDone(this)

                    # Set the sub list
                    @list = List.forPlaylist(@playlist, { style: 'rounded', throbber: 'show-content' })
                    @children.push(@list)
                    @element.find(".list-wrapper").append(@list.node)
                    @list.init())

            return promise

        playlistButtonClicked: ->
            if @playlist
                @addButton.setLabel('Saved as playlist')
                @addButton.setIcon(null)
                @addButton.setDisabled(true)
                @playlist.tracks.snapshot().done this, (snapshot) ->
                    Util.playlistWithTracks(@name, snapshot.toArray())

        destroy: ->
            super

            # Unbind listeners
            $(@addButton.node).unbind('click', @playlistButtonClicked)

            # Sometimes this fails because it thinks the playlist is null
            try
                return models.Playlist.removeTemporary(@playlist)
            catch e
                p = new models.Promise()
                p.setDone()
                return p

    RLViews.Subreddit = Subreddit
    imgSize = 250
    imageForTempPlaylist = (playlist, name) ->
        # Create image
        imageUri = "spotify:mosaic:"
        promise = new models.Promise()
        playlist.tracks.snapshot(0, 4)
            .done (snapshot) ->
                trackImgUris = $.map(snapshot._meta, (m) -> m.image)
                if (trackImgUris.length >= 4)
                    imageUri += trackImgUris.slice(0, 4).join(":")
                else if (trackImgUris.length > 0)
                    imageUri += trackImgUris[0]

                imageUri = imageUri.replace(/spotify:image:/g, '')

                promise.setDone(Image.fromSource(imageUri, { player: true, width: imgSize, height: imgSize, overlay: [name], playerItem: playlist }))
            .fail ->
                promise.setFail("Snapshot failed")

        return promise
)