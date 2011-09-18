var krusovice = krusovice || {};

/**
 * InputElement is photo/text frame data with hints to be inserted on the timeline.
 *
 * This is the the source object which the end user edits. 
 */
krusovice.InputElement = function() {
    
}

/**
 * 
 */
krusovice.InputElement.prototype = {

    /**
     * @type String
     *
     * Unique id for this element (e.g. image URL)
     */    
    id : null,
    
    /**
     * @type String
     *
     * "image" or "text"
     */
    type : null,

	/**
	 * @type String
	 *
	 * Label text
	 */    
    label : null,

	/**
	 * @type Number
	 *
	 * Duration on the screen (sans transitions)
	 */
	duration : 5,
	
	/**
	 * @type String
	 *
	 * URL to the image source
	 */
	imageURL : null,

};
