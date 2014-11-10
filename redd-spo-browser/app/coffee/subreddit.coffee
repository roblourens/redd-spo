"use strict"

require(
 ['$api/models', '$api/library#Library', '$views/list#List', '$views/image#Image', '$views/buttons#Button'],
  (models,        Library,                List,               Image,                Button) ->
    class Subreddit extends Container
        constructor: (@name) ->
            super

            # Build the subreddit HTML
            @element = $($.parseHTML(
                "<div class='subreddit collapsed' data-appear-top-offset='400'><div class='subreddit-header'><span class='title' /></div><div class='img-wrapper' /><div class='list-wrapper'/></div>"))

            @imageInitialized = false

            # Set the sub title
            @element.find('.title').text('/r/' + @name)

            # Set up the Save as Playlist button
            @addButton = Button.withLabel("Save as Playlist")
            @addButton.setIcon("res/add.png")
            $(@addButton.node).addClass('add-button')
            @addButton.setAccentuated(true)
            @element.find('.subreddit-header').append(@addButton.node)
            $(@addButton.node).click(@playlistButtonClicked)

            # Bind to a subreddit click and swallow clicks on some inner elements
            @element.click @clicked
            @element.find('.img-wrapper, .list-wrapper, .add-button').click (e) ->
                e.stopPropagation()

        # Returns a promise
        render: ->
            promise = new models.Promise()

            # Now entering callback hell
            Data.getSubredditData(@name).done((data) =>            
                trackUris = $.grep(data.tracks, (uri) -> uri != null)
                trackUris = trackUris.slice(0, 25) # Limit to 9 visible tracks
                @tracks = $.map(trackUris, models.Track.fromURI.bind(models.Track))

                if @tracks.length > 0
                    @element.show()
                else
                    @element.remove()

                Util.playlistWithTracks(@name.replace(/\//g, ''), @tracks, true).done(
                    this,
                    (playlist) =>
                        @playlist = playlist
                        
                        @element.appear().on('appear', @onElementVisible)
                        if @element.is(':appeared')
                            @onElementVisible())

            ).fail(=>
                @element.remove()
                promise.setFail())

            return promise

        playlistButtonClicked: =>
            if @playlist
                @addButton.setLabel('Saved as playlist')
                @addButton.setIcon(null)
                @addButton.setDisabled(true)
                @playlist.tracks.snapshot().done this, (snapshot) ->
                    Util.playlistWithTracks(@name, snapshot.toArray())

        clicked: =>
            @element.toggleClass('collapsed')
            Util.setNaturalSize(@element.find('.list-wrapper > div'), "height")

        onElementVisible: =>
            @initImage() if !@imageInitialized
            @initList() if !@listInitialized

        initImage: ->
            @imageInitialized = true
            imageForTempPlaylist(@playlist, @name).done this, (image) ->
                @element.find(".img-wrapper").append image.node

        initList: ->
            @listInitialized = true
            @list = List.forPlaylist(@playlist, { style: 'rounded', throbber: 'show-content' })
            @children.push(@list)
            @element.find(".list-wrapper").append(@list.node)
            @list.init()

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