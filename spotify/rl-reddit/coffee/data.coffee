"use strict"

window.Data = {}
require(
 ['$api/models'],
  (models) ->
    Data.getCategoryJson = (tabId) ->
        p = new models.Promise()

        $.get(Config.UrlBase + tabId + ".json?" + Util.timeMs()) # spotify cache??
            .done((data) ->
                if typeof data == "string"
                    data = JSON.parse(data)

                p.setDone(data))
            .fail(->
                p.setFail())

        return p
)