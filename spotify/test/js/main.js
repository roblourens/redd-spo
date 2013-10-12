"use strict";

require(
       ['$api/models', '$views/list#List', '$views/image#Image'],
function(models,        List,               Image) 
{
    function drawTab()
    {
        console.log(models.application.arguments);

        $('#wrapper').empty();
        $.get("http://rl-reddspo.s3-website-us-east-1.amazonaws.com/data3.json", drawData);
    }

    function drawData(data)
    {
        var curTabId = models.application.arguments[models.application.arguments.length - 1];
        var catData = data[curTabId];
        catData.forEach(drawSub);
    }

    function drawSub(category)
    {
        // Build the subreddit HTML
        var itemStr = "<div class='item'><h1 class='title' /><div class='img-wrapper' /><div class='list-wrapper'/></div>"
        var item = $($.parseHTML(itemStr));

        // Set the sub title
        item.find('.title').text(category.name);

        // Create a temp playlist
        models.Playlist.createTemporary(category.name.replace(/\//g, 'd')).done(function(subPl)
        {
	        subPl.load('tracks').done(function()
	        {
	        	// Populate the playlist
	        	subPl.tracks.add($.map(category.songs, models.Track.fromURI.bind(models.Track))).done(function()
	        	{
	        		//function() { subPl.load('image').done(function() {
		        	// Set the sub image
		        	//var image = Image.forPlaylist(subPl, {width: 300, height: 300, player: true, overlay: [category.name]});
		        	var image = Image.fromSource("spotify:mosaic:0a0b99e9d7b2d5e23410a8da246049cf44af8b1d:f353c56bcb66a853900d422fda67dd5b747c58d5:042989c5171a408017f8613d236ab2f0e8ee1a56:636933716c523d55a8dbbf4826763fb3661fd35e", {width: 300, height: 300, player: true, overlay: [category.name]});
		        	item.find(".img-wrapper").append(image.node);

		        	var pl2 = models.Playlist.fromURI("spotify:user:roblourens:playlist:6AkrmKPrqxsP5FJssg6wcO");
		        	var image2 = Image.forPlaylist(pl2, {width: 300, height: 300, player: true, overlay: [category.name]});
		        	item.find(".img-wrapper").append(image2.node);

			        // Set the sub list
			        var list = List.forPlaylist(subPl);
			        list.init();
			        item.find(".list-wrapper").append(list.node);

			        $('#wrapper').append(item);
	        	//}).fail(function(_, e) {console.log(e); console.log('fail')}); 
	        	}).fail(function(){console.log('add tracks fail')});
	        }).fail(function(){console.log('load "tracks" fail')});
        }).fail(function(){console.log('create temp playlist fail')});
    }

    models.application.load('arguments').done(
        function() {
        	$('button').click(function(){
        		console.log('clicked');
            	drawTab();
            });
            models.application.addEventListener('arguments', drawTab);
        });
});