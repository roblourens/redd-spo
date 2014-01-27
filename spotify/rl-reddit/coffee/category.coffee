"use strict";

require(
 ['$api/models', '$views/throbber#Throbber'],
  (models,        Throbber) ->
    class Category
        constructor: (@id) ->
            @timeRendered = 0
            @rendering = false
            @shown = false
            @subreddits = []
            @element = $(document.createElement 'div')
            @element.addClass "category category-" + id

        show: ->
            @shown = true

            p = new models.Promise()
            if @needsRendering() && !@rendering
                @removeAllSubreddits()
                @element.show()
                @render(p)
            else
                @element.show()
                p.setDone()

            return p

        hide: ->
            @element.hide()
            @shown = false

        render: (p) ->
            @rendering = true
            @showLoading()
            
            Data.getCategoryJson(@id)
                .done (subredditDatas) =>
                    try
                        @hideLoading()
                        subredditDatas.forEach(@renderSubreddit)
                        @timeRendered = Util.timeMs()
                    catch e
                        console.log 'Category rendering failed: ' + e
                    finally
                        p.setDone()
                .fail ->
                    p.setFail('net')
                .always =>
                    @rendering = false

        showLoading: ->
            # Apparently not meant to be reused - the size is always wrong the second time
            @throbber = Throbber.forElement @element[0]
            @throbber.setSize 'small'
            @throbber.show()

        hideLoading: ->
            @throbber.hide()
            @throbber = null

        renderSubreddit: (subredditData) =>
            subreddit = new RLViews.Subreddit(subredditData)
            subreddit.init()

            if subreddit.tracks.length > 0
                @subreddits.push(subreddit)
                @element.append(subreddit.element)

        removeAllSubreddits: ->
            @subreddits.forEach (subreddit) ->
                subreddit.element.remove()
                subreddit.destroy()

            @subreddits = []

        needsRendering: ->
            return Config.AlwaysRerender or (Util.timeMs() - @timeRendered > 30*60*1000) # 30 min

    RLViews.Category = Category
)