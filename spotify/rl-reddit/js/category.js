"use strict";

require(
       ['$api/models'],
function(models)
{
    function Category(id)
    {
        this.id = id;
        this.timeRendered = 0;
        this.shown = false;

        this.element = $(document.createElement('div'));
        this.element.addClass("category-" + id);
    }

    RLViews.Category = Category;

    Category.prototype.show = function()
    {
        this.shown = true;

        var p = new models.Promise();
        if (this.needsRendering())
        {
            NProgress.set(0, true);
            NProgress.start();
            this.element.empty();
            
            Data.getCategoryJson(this.id)
            .done((function(subreddits)
            {
                subreddits.forEach(this.renderSubreddit.bind(this));
                p.setDone();
                this.timeRendered = timeMs();
            }).bind(this))
            .always((function()
            {
                if (this.shown)
                    NProgress.done();
            }).bind(this))
            .fail((function()
            {
                p.setFail('net');
            }).bind(this));
        }
        else
        {
            p.setDone();
            NProgress.done();
        }

        this.element.show();

        return p;
    }

    Category.prototype.hide = function()
    {
        this.element.hide();
        this.shown = false;
    }

    Category.prototype.renderSubreddit = function(subredditData)
    {
        var subreddit = new RLViews.Subreddit(subredditData);
        subreddit.init();

        if (subreddit.tracks.length > 0)
            this.element.append(subreddit.element);
    }

    Category.prototype.needsRendering = function()
    {
        return timeMs() - this.timeRendered > 30*60*1000; // 30 min
    }
});