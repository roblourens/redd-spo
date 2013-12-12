"use strict";

require(
       ['$api/models', '$views/list#List', '$views/image#Image'],
function(models,        List,               Image) 
{
    var categories = {};
    var tabContentSelector = "#wrapper";
    var connectErrMsgSelector = "#connectErrMsg";
    var activeCategory;

    function cleanUp()
    {
        if (activeCategory) activeCategory.hide();
    }

    function drawCurTab()
    {
        if (!models.session.online) return;

        cleanUp();

        var tabIdToDraw = curTabId();
        var selectedCategory = categories[tabIdToDraw];
        if (!selectedCategory)
        {
            selectedCategory = new RLViews.Category(tabIdToDraw);
            categories[tabIdToDraw] = selectedCategory;
            $(tabContentSelector).append(selectedCategory.element);
        }

        activeCategory = selectedCategory;
        selectedCategory.show()
            .done(function()
            {
                hideConnectError();
            })
            .fail(function()
            {
                if (selectedCategory != activeCategory) return;

                showConnectError();
            });
    }

    function curTabId()
    {
        return models.application.arguments[models.application.arguments.length - 1];
    }

    function hideConnectError()
    {
        $(connectErrMsgSelector).hide();
        $(tabContentSelector).show();
    }

    function showConnectError()
    {
        $(tabContentSelector).hide();
        $(connectErrMsgSelector).show();
    }

    function checkOnline()
    {
        if (models.session.online)
        {
            hideConnectError();
            drawCurTab();
        }
        else
            showConnectError();
    }

    models.Promise.join(
        models.application.load('arguments'),
        models.session.load('online'))
    .done(function() {
        checkOnline();

        // Listen to tab change and online/offline events
        models.application.addEventListener('arguments', drawCurTab.bind(this));
        models.session.addEventListener('change:online', checkOnline.bind(this));
    });
});