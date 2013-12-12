"use strict";

require(
       ['$api/models', '$views/list#List', '$views/image#Image'],
function(models,        List,               Image) 
{
    var categories = {};
    var tabContentSelector = "#wrapper";
    var offlineMsgSelector = "#offlineMsg";
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

        activeCategory = categories[tabIdToDraw];
        if (!activeCategory)
        {
            activeCategory = new Category(tabIdToDraw);
            categories[tabIdToDraw] = activeCategory;
            $(tabContentSelector).append(activeCategory.element);
        }

        activeCategory.show();
    }

    function curTabId()
    {
        return models.application.arguments[models.application.arguments.length - 1];
    }

    function checkOnline()
    {
        if (models.session.online)
        {
            $(offlineMsgSelector).hide();
            $(tabContentSelector).show();

            drawCurTab();
        }
        else
        {
            $(tabContentSelector).hide();
            $(offlineMsgSelector).show();
        }
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