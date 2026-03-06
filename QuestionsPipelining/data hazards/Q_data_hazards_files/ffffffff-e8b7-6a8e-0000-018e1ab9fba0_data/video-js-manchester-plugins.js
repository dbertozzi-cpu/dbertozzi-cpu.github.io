// UI elements for subtitle download buttons
var MenuButton = videojs.getComponent("MenuButton");
var MenuItem = videojs.getComponent("MenuItem");
var DownloadsMenuItem = videojs.extend(MenuItem, {
    constructor: function(player, options) {
        MenuItem.call(this, player, options);
        this.on('keydown', event => this.handleKeyDown(event))
    },
    handleKeyDown: function(event) {
        if (event.code === 'Space' || event.code === 'Enter') {
          this.el_.getElementsByTagName('a')[0].click();
        }
    },
});
var DownloadsButton = videojs.extend(MenuButton, {
    constructor: function(player, options) {
        MenuButton.call(this, player, options);
        this.controlText("Download Subtitles and Transcription");
        this.addClass('vjs-downloads-button');
    },
    createItems: function(items = []) {
        subsItem = new DownloadsMenuItem(this.player_,{label: '<a id="downloadSubtitles">Download&nbsp;subtitles&nbsp;(.vtt)</a>'});
        items.push(subsItem);
        transcriptItem = new DownloadsMenuItem(this.player_,{label: '<a id="downloadTranscription">Download&nbsp;transcript&nbsp;(.txt)</a>'});
        items.push(transcriptItem);
        return items;
    },
});

videojs.registerComponent("DownloadsButton", DownloadsButton);


// TitleBarLink is a link back to video portal
var Component = videojs.getComponent('Component');

var TitleBarLink = videojs.extend(Component, {
    constructor: function(player, options) {
        Component.apply(this, arguments);
    },

    createEl: function() {
        var content = ''
        var title = this.options_.title;
        var link = this.options_.link;
        if (!link || 0 === link.length) {
            content = title;
        } else {
            content = '<a href="' + link + '" target="_blank">' + title + '</a>'
        }
        return videojs.createEl('div', {
            className: 'vjs-title-bar-link',
            innerHTML: content
        });
    },
});

// Register the component with Video.js, so it can be used in players.
videojs.registerComponent('TitleBarLink', TitleBarLink);
