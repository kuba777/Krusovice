/*global define,window*/

define("krusovice/music", ["krusovice/thirdparty/jquery-bundle", "krusovice/core", "krusovice/utils"], function($, krusovice, utils) {
"use strict";

krusovice.music = krusovice.music || {};

krusovice.music.Registry = $.extend(true, {}, utils.Registry, {

    /**
     * Dummy audio filed used play when no song is selected.
     * <audio> element will still feed clock to the process.
     *
     */
    noAudioClip : null,

    /**
     * Rhytm URL -> associated rhytm data object mappings.
     *
     * XXX: Never released. Figure out smarter way to
     * carry this data around.
     */
    rhythms : {},

    /**
     * Load music data from JSON file
     *
     * @param {String} url URL to songs.json
     *
     * @param {String} mediaURL Base URL to image and video data
     */
    loadData : function(url, mediaURL, callback, errorCallback) {
        var self = this;

        console.log("Loading songs:" + url);

        var dfd = $.getJSON(url, function(data) {
            console.log("Got song data");
            console.log(data);
            self.processData(data, mediaURL);
            callback();
        });

        dfd.error(function() {
            console.error("Bad music db:" + url);
            errorCallback();
        });

    },


    /**
     * Decode song bank data to internal format.
     */
    processData : function(data, mediaURL) {
        var self = this;
        data.forEach(function(obj) {
            self.fixMediaURLs(obj, mediaURL);
            self.register(obj);
        });
    },

    /**
     * Make image URLs loadable
     */
    fixMediaURLs : function(obj, mediaURL) {


        if(obj.mp3 && typeof(obj.mp3) == "string") {
            if(!obj.mp3.match("^http")) {
                // Convert background source url from relative to absolute
                obj.mp3 = krusovice.tools.url.joinRelativePath(mediaURL, obj.mp3);
            }
        }

    },



    /**
     * Load rhythm data for MP3;
     */
    loadRhythmData : function(file, callback) {

    },

    /**
     * Load a song into audio element and load related rhytm data too.
     *
     * Song URL must be preprocessed to be platform compatible.
     *
     * @param {Object} audio HTMLAudio element used for music playback, or null if only to load rhytm data
     *
     * @param {Function} callback(songURL, rhytmhURL, rhytmData) called when all done
     *
     * @param {boolean} prelisten Load low quality audio version
     *
     */
    loadSong : function(songURL, rhythmURL, audio, callback, prelisten) {

        var rhythmDone = false;
        var songDone = false;
        var song;
        var self = this;
        var rhythmData = null;

        console.log("Loading song URL " + songURL + " for audio element:" + audio + " with rhythm data:" + rhythmURL);

        function allDone() {
            if(rhythmDone && songDone) {
                callback(songURL, rhythmURL, rhythmData);
            }
        }

        function onRhythmData(data) {
            rhythmDone = true;
            rhythmData = data;
            allDone();
        }

        function onMusicBuffered() {
            songDone = true;
            allDone();
        }

        var xhr = $.getJSON(rhythmURL, onRhythmData);

        // Did not get rhytm data - proceed still
        xhr.fail(function() {
            console.error("Could not load rhythm data:" + rhythmURL);
            rhythmDone = true;
            rhythmData = null;
            allDone();
        });

        if(audio) {
            $(audio).one("canplay", onMusicBuffered);
            $(audio).attr("src", songURL);
        } else {
            songDone = true;
        }

    },

    /**
     * Load a song based on krusovice.Design object.
     *
     * Song can be id (stock) or custom URL.
     */
    loadSongFromDesign : function(design, audio, callback, prelisten) {

        var songURL;

        if(design.songData && design.songData.url) {
            songURL = design.songData.url;
        } else if(design.songId) {
            songURL = this.getAudioURL(design.songId);
        } else {
            console.error(design);
            throw "Cannot load song - no song defined";
        }

        var rhythmURL = songURL.replace(".mp3", ".json");

        if(prelisten) {
            songURL = this.convertToPrelistenURL(songURL);
        }

        return this.loadSong(songURL, rhythmURL, audio, callback, prelisten);

    },

    convertToPrelistenURL : function(url) {

        var audio = document.createElement("audio");

        var needAAC = audio.canPlayType('audio/mp4; codecs="mp4a.40.5"') !== "";
        var needOGG = audio.canPlayType('audio/ogg; codecs="vorbis"') !== "";

        url = url.replace(".mp3", ".prelisten.mp3");

        if(needOGG) {
            url = url.replace(".mp3", ".ogg");
        } else if(needAAC){
            url = url.replace(".mp3", ".m4a");
        } else {
            console.error("Could not detect prelisten audio format support");
        }

        return url;
    },

    /**
     * @param {Boolean} prelisten Get low quality preview version
     */
    getAudioURL : function(songId, prelisten) {

        var song = this.get(songId);

        var url = song.mp3;

        if(prelisten) {
            return this.convertToPrelistenURL(url);
        }

        return url;
    }


});
});
