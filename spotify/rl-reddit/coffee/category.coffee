"use strict";

require(
 ['$api/models', '$views/throbber#Throbber'],
  (models,        Throbber) ->
    class Category
        constructor: (@id) ->
            @timeRendered = 0;
            @shown = false;

            @element = $(document.createElement 'div')
            @element.addClass "category category-" + id

        show: ->
            @shown = true

            p = new models.Promise()
            if @needsRendering()
                @element.empty()
                @showLoading()
                
                Data.getCategoryJson(@id)
                    .done (subreddits) =>
                        @hideLoading()
                        subreddits.forEach(@renderSubreddit)
                        p.setDone()

                        @timeRendered = Util.timeMs()
                    .fail(->
                        p.setFail('net'))
            else
                p.setDone()

            @element.show()

            return p

        hide: ->
            @element.hide()
            @shown = false

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