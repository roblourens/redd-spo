"use strict";

require(
 ['$api/models', '$views/throbber#Throbber'],
  (models,        Throbber) ->
    class Category
        constructor: (@id) ->
            @timeRendered = 0
            @rendering = false
            @shown = false

            @element = $(document.createElement 'div')
            @element.addClass "category category-" + id

        show: ->
            @shown = true

            p = new models.Promise()
            if @needsRendering() && !@rendering
                @render(p)
            else
                p.setDone()

            @element.show()

            return p

        hide: ->
            @element.hide()
            @shown = false

        render: (p) ->
            @rendering = true
            @element.empty()
            @showLoading()
            
            Data.getCategoryJson(@id)
                .done (subreddits) =>
                    try
                        @hideLoading()
                        subreddits.forEach(@renderSubreddit)
                        @timeRendered = Util.timeMs()
                    catch
                    finally
                        p.setDone()
                .fail ->
                    p.setFail('net')
                .always =>
                    @rendering = false

        showLoading: ->
            if !@throbber
                @throbber = Throbber.forElement @element[0]
                @throbber.setSize 'small'

            @throbber.show()

        hideLoading: ->
            @throbber.hide()

        renderSubreddit: (subredditData) =>
            subreddit = new RLViews.Subreddit(subredditData)
            subreddit.init()

            if subreddit.tracks.length > 0
                @element.append(subreddit.element)

        needsRendering: ->
            return Util.timeMs() - @timeRendered > 30*60*1000 # 30 min

    RLViews.Category = Category
)