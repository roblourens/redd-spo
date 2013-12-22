"use strict";

require(
       ['$api/models', '$views/throbber#Throbber'],
function(models, Throbber)
{
    function Category(id)
    {
        this.id = id;
        this.timeRendered = 0;
        this.shown = false;

        this.element = $(document.createElement('div'));
        this.element.addClass("category category-" + id);
    }

    RLViews.Category = Category;

    Category.prototype.show = function()
    {
        this.shown = true;

        var p = new models.Promise();
        if (this.needsRendering())
        {
            this.element.empty();
            this.showLoading();
            
            Data.getCategoryJson(this.id)
                .done((function(subreddits)
                {
                    this.hideLoading();
                    subreddits.forEach(this.renderSubreddit.bind(this));
                    p.setDone();

                    this.timeRendered = Util.timeMs();
                }).bind(this))
                .fail((function()
                {
                    p.setFail('net');
                }).bind(this));
        }
        else
        {
            p.setDone();
        }

        this.element.show();

        return p;
    }

    Category.prototype.hide = function()
    {
        this.element.hide();
        this.shown = false;
    }

    Category.prototype.showLoading = function() {
        if (!this.throbber)
        {
            this.throbber = Throbber.forElement(this.element[0]);
            this.throbber.setSize('small');
        }

        this.throbber.show();
    }

    Category.prototype.hideLoading = function() {
        this.throbber.hide();
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
        return Util.timeMs() - this.timeRendered > 30*60*1000; // 30 min
    }
});