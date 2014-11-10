"use strict"

window.Data = {}
require(
 ['$api/models'],
  (models) ->

    getJson = (url) ->
        p = new models.Promise()

        $.get(url + "?" + Util.timeMs())
            .done((data) ->
                if typeof data == "string"
                    data = JSON.parse(data)

                p.setDone(data))
            .fail((e) ->
                p.setFail(e))

        return p

    Data.getSubredditsForCategory = (categoryId) ->
        p = new models.Promise()
        if !Data.Categories?
                getJson(Config.CategoriesUrl + "?" + Util.timeMs())
                    .done((data) =>
                        Data.Categories = data
                        p.setDone(Data.Categories[categoryId]))
        else
            p.setDone(Data.Categories[categoryId])

        return p

    Data.getSubredditData = (subredditName) ->
        getJson(Config.UrlBase + "data/" + subredditName + ".json")       
)