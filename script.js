/**
 * Safe version of local storage getter.
 * @param {string} name the name of the object to fetch
 * @return {*} the object stored in local storage
 */
var storageGet = function storageGet(name) {
    var ret = null;
    try { ret = localStorage.getItem(name); }
    catch(e) { }
    return ret;
};

/**
 * Safe version of local storage setter.
 * @param {string} name the name of the object to set
 * @param {*} value the value to set
 */
var storageSet = function storageSet(name, value) {
    try { localStorage.setItem(name, value); }
    catch(e) { }
};

/**
 * Given an object describing the channels, this creates the DOM structure
 * and inserts it into the page.
 * @param {Object} json the JSON loaded from the HD Home Run
 */
var loadChannelsDom = function loadChannelsDom(json) {
    var domChannels = document.getElementById('channels');
    json = json || [];

    domChannels.innerHTML = json.reduce(function(html, channel) {
        var links = [ {
            name: 'VLC (720p)',
            href: 'vlc-x-callback://x-callback-url/stream?url=' +
                encodeURIComponent(channel.URL + '?transcode=mobile')
        }, {
            name: 'VLC (1080p)',
            href: 'vlc-x-callback://x-callback-url/stream?url=' +
                encodeURIComponent(channel.URL + '?transcode=heavy')
        }, {
            name: 'Raw (720p)',
            href: channel.URL + '?transcode=mobile'
        }, {
            name: 'Raw (1080p)',
            href: channel.URL + '?transcode=heavy'
        }];

        return html +
        '<li>' +
            '<div class="channel-namerow">' +
                '<span class="channel-name">' + channel.GuideName + '</span>' +
                (channel.HD ? '<span class="channel-hd">HD</span>' : '') +
            '</div>' +
            '<ol class="channel-links">' +
                links.reduce(function(links, link) { return links + 
                    '<li class="channel-linkitem">' +
                        '<a href="' + link.href +'">' + link.name + '</a>' +
                    '</li>';
                }, '') +
            '</ol>' +
        '</li>';
    }, '');
};

/**
 * Given an IP address of a HD Home Run device, query that IP and then
 * load the resulting channel list into the dom.
 * @param {string} ip the IP address
 */
var loadChannels = function loadChannels(ip) {
    storageSet('ip', ip);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://' + ip + '/lineup.json', true);
    xhr.onload = function lineupLoad() {
        if (xhr.readyState === xhr.DONE) {
            if (xhr.status === 200) {
                var jsonResp = null;
                try { jsonResp = JSON.parse(xhr.responseText); }
                catch(e) {}
                loadChannelsDom(jsonResp);
            }
        }
    };

    xhr.send(null);
};

/**
 * Program entry point: load IP address from local storage or listen for
 * the load button to re-load the IP address and channels of an HD Home Run
 */
document.addEventListener('DOMContentLoaded', function() {
    var lastIp = storageGet('ip');

    if (lastIp) {
        document.getElementById('ip-field').value = lastIp;
        loadChannels(lastIp);
    }

    document.getElementById('ip-load').addEventListener('click', function(ev) {
        var ipField = document.getElementById('ip-field');
        loadChannels(ipField.value);
    });
});
