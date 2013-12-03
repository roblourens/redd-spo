"use strict";

function CacheItem(data)
{
    this.data = data;
    this.time = timeMs();
}

// Instantiates a Cache with given item lifespan given in ms.
// Once an item is older than lifespan, Cache.isStaleOrMissing will return true for that item.
function Cache(lifespan)
{
    this.items = {};
    this.lifespan = lifespan;
}

Cache.prototype.add = function(k, v)
{
    this.items[k] = new CacheItem(v);
}

Cache.prototype.get = function(k)
{
    var item = this.items[k];
    
    return item ? item.data : null;
}

Cache.prototype.isStaleOrMissing = function(k)
{
    var item = this.items[k];
    return !item || timeMs() - item.time > this.lifespan;
}

var Data = {};
require(
       ['$api/models', '$views/list#List', '$views/image#Image'],
function(models)
{
    var cache = new Cache(30*60*1000); // 30 min

    Data.getCategoryJson = function(tabId)
    {
        var p = new models.Promise();

        if (cache.isStaleOrMissing(tabId))
        {
            console.log('GETting...');
            $.get(
                "http://rl-reddspo.s3-website-us-east-1.amazonaws.com/" + tabId + ".json?" + timeMs(), // spotify cache??
                function(data)
                {
                    if (typeof data == "string") data = JSON.parse(data);

                    cache.add(tabId, data); // todo - validate somehow before caching? What if we cache bad data for half an hour?
                    p.setDone(data);
                });
        }
        else
        {
            console.log('cached...')
            p.setDone(cache.get(tabId));
        }

        return p;
    }
});