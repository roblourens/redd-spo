"use strict";

App = Ember.Application.create()

App.Router.map(-> 
  # put your routes here
);

App.IndexRoute = Ember.Route.extend({
  model: () ->
    ['red', 'yellow', 'blue']
})

###
require(
 ['$api/models', '$views/list#List', '$views/image#Image'],
  (models,        List,               Image) ->
    categories = {}
    tabContentSelector = "#wrapper"
    connectErrMsgSelector = "#connectErrMsg"
    activeCategory = null

    cleanUp = ->
        activeCategory.hide() if activeCategory?

    drawCurTab = ->
        return unless models.session.online

        cleanUp()

        tabIdToDraw = curTabId()
        selectedCategory = categories[tabIdToDraw]
        if !selectedCategory?
            selectedCategory = new RLViews.Category(tabIdToDraw);
            categories[tabIdToDraw] = selectedCategory;
            $(tabContentSelector).append(selectedCategory.element);

        activeCategory = selectedCategory;
        selectedCategory.show()
            .done ->
                hideConnectError()
            .fail ->
                return if selectedCategory != activeCategory
                showConnectError()

    curTabId = ->
        return models.application.arguments[models.application.arguments.length - 1]

    hideConnectError = ->
        $(connectErrMsgSelector).hide()
        $(tabContentSelector).show()

    showConnectError = ->
        $(tabContentSelector).hide()
        $(connectErrMsgSelector).show()

    checkOnline = ->
        if models.session.online
            hideConnectError()
            drawCurTab()
        else
            showConnectError()

    models.Promise.join(
        models.application.load('arguments'),
        models.session.load('online'))
    .done(->
        checkOnline()

        # Listen to tab change and online/offline events
        models.application.addEventListener('arguments', drawCurTab)
        models.session.addEventListener('change:online', checkOnline)
    )
)
###