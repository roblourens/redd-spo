"use strict";

require(
       ['$api/models', '$views/list#List', '$views/image#Image'],
function(models,        List,               Image) 
{
    var activeSubreddits = [];
    var loadingSubredditPromises = [];

    function drawSub(subredditData)
    {
        var subreddit = new RLViews.Subreddit(subredditData);
        var initPromise = subreddit.init();

        // Assume any past the 4th won't be visible at first, so don't need to track those promises
        if (loadingSubredditPromises.length < 4)
            loadingSubredditPromises.push(initPromise);

        activeSubreddits.push(subreddit);
        $('#wrapper').append(subreddit.element);
    }

    function drawData(subreddits)
    {
        subreddits.forEach(drawSub);
        models.Promise.join(loadingSubredditPromises).always(function()
        {
            loadingSubredditPromises = [];

            // Give everything a chance to finish being drawn, then kill the progress indicator
            setTimeout(function() { NProgress.done(); }, 0)
        });
    }

    function cleanUp()
    {
        $('#wrapper').empty();
        return models.Promise.join($.map(activeSubreddits, function(s){ s.dispose(); }));
    }

    function getCategoryJson(tabId)
    {
        var p = new models.Promise();
        $.get(
            "http://rl-reddspo.s3-website-us-east-1.amazonaws.com/" + tabId + ".json?" + (new Date()).valueOf(), // spotify cache??
            function(data)
            {
                if (typeof data == "string")
                    data = JSON.parse(data);

                p.setDone(data);
            });

        return p;
    }

    // For now, going to wipe the page and start over whenever refreshing. Maybe have a better refresh scheme later
    function drawCurTab()
    {
        NProgress.start();

        setTimeout(function()
        {
            var curTabId = models.application.arguments[models.application.arguments.length - 1];
            models.Promise.join(getCategoryJson(curTabId), cleanUp()).done(function(results)
            {
                var data = results[0]; // from getCategoryJson
                drawData(data);
            });    
        }, 0);
    }

    models.application.load('arguments').done(
        function() {
        	drawCurTab();
            models.application.addEventListener('arguments', drawCurTab);
        });
});