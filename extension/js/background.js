/*****************************
	Twitch Emotes by Simego
 *****************************/
var timeout;
$("#app").bind("DOMSubtreeModified", function(evt) {
	if($(evt.target).hasClass('app-wrapper-main')) {
		if(!timeout) {
			timeout = setTimeout(function() {
					var contactList = $('.infinite-list-viewport');
					contactList.children().each(function(idx, elem) {
					// console.debug(elem)
					elem.addEventListener('click', runTwitchEmotesLoader);
					console.debug('WhatsTwitch Emotes loaded');
					var first = $(".menu.menu-horizontal").children().first();
					if(first.find(".twitch").length == 0) {
						$(".menu.menu-horizontal").children().first().prepend('<div class="menu-item twitch" data-toggle="tooltip" data-placement="bottom" title="Twitch Emotes by Simego" ><img src="https://www.twitch.tv/favicon.ico"/></div>');
						$(".menu.menu-horizontal").children().first().children().first().tooltip();
					}
				});
			}, 1000);
		}
	}
});

var TWEmotes;
$.get('https://twitchemotes.com/api_cache/v2/global.json')
.done(function(response) {
	TWEmotes = response
});

var runTwitchEmotesLoader = function() {
	console.debug('Running TwitchEmotesLoader.')

	var run = function() {
		var messageList = $("#main > div > div:nth-child(1) > div > div.message-list");

		parseMessages(messageList.find('.msg:not(.twitched)'));

		var functionToRun = function(evt) {
	    	parseMessages($(evt.target).find('.msg:not(.twitched)'));
		};
		var functionToBind = function() {
			messageList.bind("DOMSubtreeModified", function(evt) {
				if($(evt.target).hasClass('message-list')) {
					$(this).unbind("DOMSubtreeModified");
					setTimeout(function() {
						functionToRun(evt);
						setTimeout(functionToBind, 10);
					}, 200);
				}
			});
		};
		functionToBind();
	};
	setTimeout(run, 10);
}

var parseMessages = function(messages) {
	if(messages.length == 0) {
		return;
	}
	console.debug('parsing ' + messages.length + ' messages');
	messages.each(function(idx, message) {
		message = $(message);
		message.addClass('twitched');
		var messageText = message.find('span.emojitext.selectable-text');
		var text = messageText.text();
		// console.debug('new message: ' + text);

		var matches = text.match(/([^\s\\]|[a-zA-Z0-9]+)\b/g);
		if(matches && matches.length > 0) {
			var uniqueMatches = [];
			$.each(matches, function(i, el){
			    if($.inArray(el, uniqueMatches) === -1) uniqueMatches.push(el);
			});

			uniqueMatches.forEach(function(textToken) {
				var emote = TWEmotes.emotes[textToken];
				if(emote) {
					var re = new RegExp(textToken, "g");
					var imageId = emote.image_id;
			    	var url = TWEmotes.template.small.replace('{image_id}', imageId);
			    	var tooltipInfo = 'data-toggle="tooltip" data-placement="bottom" title="'+ textToken +'"';
			    	messageText.html( messageText.html().replace(re, '<img src="'+ url +'" '+ tooltipInfo +' />') );
		    	}
			});
		}
	});
	messages.find('img[data-toggle="tooltip"]').tooltip({container: 'body'});
}