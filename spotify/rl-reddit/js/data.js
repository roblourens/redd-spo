"use strict";

var Data = {};
require(
       ['$api/models', '$views/list#List', '$views/image#Image'],
function(models)
{
    Data.getCategoryJson = function(tabId)
    {
        var p = new models.Promise();

        $.get(
            "http://rl-reddspo.s3-website-us-east-1.amazonaws.com/" + tabId + ".json?" + timeMs(), // spotify cache??
            function(data)
            {
                if (typeof data == "string") data = JSON.parse(data);

                p.setDone(data);
            });

        return p;
    }
});