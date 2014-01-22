"use strict";

var Data = {};
require(
       ['$api/models', '$views/list#List', '$views/image#Image'],
function(models)
{
    Data.getCategoryJson = function(tabId)
    {
        var p = new models.Promise();

        $.get(Config.UrlBase + tabId + ".json?" + Util.timeMs()) // spotify cache??
            .done(function(data)
            {
                if (typeof data == "string") data = JSON.parse(data);

                p.setDone(data);
            })
            .fail(function()
            {
                p.setFail();
            });

        return p;
    }
});