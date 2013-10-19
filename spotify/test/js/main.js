"use strict";

require(
       ['$api/models', '$views/list#List', '$views/image#Image'],
function(models,        List,               Image) 
{
    var activeSubreddits = [];

    function drawSub(subredditData)
    {
       RLViews.createSubreddit(subredditData).done(function(subreddit)
       {
            activeSubreddits.push(subreddit);
            $('#wrapper').append(subreddit.node);
       });
    }

    function drawData(data)
    {
        var curTabId = models.application.arguments[models.application.arguments.length - 1];
        var subreddits = data[curTabId];
        subreddits.forEach(drawSub);
    }

    function cleanUp()
    {
        $('#wrapper').empty();
        return models.Promise.join($.map(activeSubreddits, function(s){ s.dispose(); }));
    }

    function getJson()
    {
        var p = new models.Promise();
        $.get("http://rl-reddspo.s3-website-us-east-1.amazonaws.com/results.json?" + (new Date()).valueOf(), function(data) {
            p.setDone(JSON.parse(data));
        });

        return p;
    }

    // For now, going to wipe the page and start over whenever refreshing. Maybe have a better refresh scheme later
    function drawTab()
    {
        // This actually loads data for all tabs. Maybe load one at a time later
        models.Promise.join(getJson(), cleanUp()).done(function(results)
        {
            var data = results[0]; // from getJson
            drawData(data);
        });
    }

    models.application.load('arguments').done(
        function() {
        	drawTab();
            models.application.addEventListener('arguments', drawTab);
        });
});