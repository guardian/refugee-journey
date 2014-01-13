var JOURNEY = JOURNEY || {};
JOURNEY.Game = function(el) {
    'use strict';
    var container = el;
    var sceneContainerEl;
    var currentScene;
    var cachedImages = [];
    var firstTime = true;

    function Player() {
        return {
            scenes: [],
            success: null
        };
    }
    var player = new Player();

    function setupDOM() {
        container.innerHTML = JOURNEY.html.base_layout;
        sceneContainerEl = jQuery('.scene_container', container);

        // Bind events
        sceneContainerEl.on('click', '.restart', newGame);
        sceneContainerEl.on('click', '.share-facebook', shareFacebook);
        sceneContainerEl.on('click', '.share-twitter', shareTwitter);
        sceneContainerEl.on('click', '.choice-btn', function() { clickedChoice(this); });
    }

    function newGame() {
        player = new Player();
        sceneContainerEl.empty();
        currentScene = 's0';
        render();
    }

    function cacheNextImages(scene) {
        if (!scene.choice || !scene.choice.options)
            return;

        scene.choice.options.forEach(function(option) {
            var nextScene = JOURNEY.data[option.destination];
            if (!option.destination || nextScene === undefined || !nextScene.coverImg)
                return;

            var imgPath = JOURNEY.data[option.destination].coverImg;
            var img = new Image();
            img.src = imgPath;
            cachedImages.push(img);
        });
    }

    function render() {
        var scene = JOURNEY.data[currentScene];

        if (typeof scene === 'undefined') {
            console.log('Missing scene: %s', currentScene);
            return;
        }

        jQuery('.choice-btn', sceneContainerEl).off().attr('disabled', true).addClass('disabled');

        var sceneHTML = Mustache.render(JOURNEY.html.view_scene, {
            title: (scene.title) ? scene.title : '',
            sceneContent: JOURNEY.content[scene.contentFile],
            choiceText: (scene.choice) ? scene.choice.text : '',
            buttons: (scene.choice) ? scene.choice.options : '',
            coverCredit: (scene.coverCredit) ? scene.coverCredit : '',
            insertImg: scene.insertImg
        });

        var sceneEl = jQuery(sceneHTML);

        cacheNextImages(scene);

        if (scene.coverImg)
            sceneEl.css('background-image', 'url(' + scene.coverImg + ')');

        sceneContainerEl.append(sceneEl);

        // Animate new scene into view
        jQuery('html, body').stop();
        if (!firstTime) {
            jQuery('html, body').animate({
                scrollTop: sceneEl.offset().top
            }, 800);
        }

        if (scene.end === true) {
            player.success = scene.success;
            jQuery('.scene-inner', sceneEl).append(jQuery(JOURNEY.content.share_and_replay));
            sceneEl.addClass('end');
        }

        updatePlayer();
        firstTime = false;
    }

    function loadScenes(scenes) {
        sceneContainerEl.empty();

        scenes.forEach(function(sceneName) {
            if (!JOURNEY.data.hasOwnProperty(sceneName))
                return;
            currentScene = sceneName;
            render();
        });
    }

    function updatePlayer() {
        player.scenes.push(currentScene);
    }

    function clickedChoice(elm) {
        currentScene = jQuery(elm).data('destination');
        render();
    }

    // http://stackoverflow.com/a/901144
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]"); // jshint ignore:line
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " ")); // jshint ignore:line
    }

    function areValidScenes(scenes) {
        return scenes.every(function(sceneName) {
            return JOURNEY.data.hasOwnProperty(sceneName);
        });
    }

    function getShareURL() {
        var shareURL = 'http://example.com/share/example/';
        // if (player.scenes.length > 0) {
        //     shareURL += '?journey=' + encodeURIComponent(player.scenes.join(','));
        // }
        return shareURL;
    }

    function openShareWindow(url, options) {
        var targetUrl = url;
        for (var k in options) {
            if (options.hasOwnProperty(k))
                targetUrl += k + '=' + options[k] + '&';
        }

        window.open(
            targetUrl,
            'Share',
            'width=640,height=500,resizable,scrollbars=yes,status=1'
        );
    }

    function shareTwitter(event) {
        event.preventDefault();
        var options = {
            related: 'guardian',
            text: 'Refugee journey tweet text',
            via: 'guardian',
            url: getShareURL(),
            hashtags: 'TEST,HASH,TAGS'
        };

        openShareWindow('https://twitter.com/share?', options);
    }

    function shareFacebook(event) {
        event.preventDefault();
        var options = {
            'p[title]': 'PAGE TITLE',
            'p[summary]': 'Refugee journey SUMMARY TEXT',
            'p[url]': getShareURL(),
            'p[images][0]': 'http://placehold.it/960x500'
        };

        openShareWindow('http://www.facebook.com/sharer.php?s=100&', options);
    }

    function init() {
        setupDOM();
        var userProvidedScenes = getParameterByName('journey').split(',');

        if (userProvidedScenes.length > 0 && areValidScenes(userProvidedScenes)) {
            loadScenes(userProvidedScenes);
        } else {
            newGame();
        }
    }

    init();
    return this;
};
