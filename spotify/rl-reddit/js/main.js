"use strict";

require(
       ['$api/models', '$views/list#List', '$views/image#Image'],
function(models,        List,               Image) 
{
    var categories = {};
    var tabContentSelector = "#wrapper";
    var activeCategory;

    function cleanUp()
    {
        if (activeCategory) activeCategory.hide();
    }

    // For now, going to wipe the page and start over whenever refreshing. Maybe have a better refresh scheme later
    function drawCurTab()
    {
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

    models.application.load('arguments').done(
        function() {
        	drawCurTab();
            models.application.addEventListener('arguments', drawCurTab.bind(this));
        });
});