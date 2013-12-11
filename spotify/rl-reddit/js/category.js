"use strict";

function Category(id)
{
    this.id = id;
    this.timeRendered = 0;
    this.shown = false;

    this.element = $(document.createElement('div'));
    this.element.addClass("category-" + id);
}

RLViews.Category = Category;

// Async when not rendered yet...?
Category.prototype.show = function()
{
    this.shown = true;

    if (this.needsRendering())
    {
        NProgress.set(0, true);
        NProgress.start();

        // todo errors
        Data.getCategoryJson(this.id).done((function(subreddits)
        {
            subreddits.forEach(this.renderSubreddit.bind(this));
        }).bind(this))
        .always((function()
        {
            if (this.shown)
                NProgress.done();
        }).bind(this));

        this.timeRendered = timeMs();
    }

    this.element.show();
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

    this.element.append(subreddit.element);
}

Category.prototype.needsRendering = function()
{
    return timeMs() - this.timeRendered > 30*60*1000; // 30 min
}