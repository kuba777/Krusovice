"use strict";

var krusovice = krusovice || {};

krusovice.effects = krusovice.effects || {};

$.extend(krusovice.effects, {
   
 /**
  * Z distance from the camera for normal image viewing.
  *
  * If plane has this distance and has width of 1 and height of 1
  * it will fill the screen exactly.
  *
  */
 CAMERA_Z : 1,
 
 
 /**
  * Used when zooming out of infinity.
  */
 FAR_Z : 100000,
    
});

/**
 * Effect manager is responsible for registering animation effects.
 *
 * The managed data is used by the user interface and the internal
 * factory methods to map serialized effect ids to the actual animation code.
 *
 * @singleton
 */
krusovice.effects.Manager = {
    
    /**
     * Mapping of effect id -> constructor function  
     */
    data : {},
        
    register : function(effect) {

      if(!effect.id) {
          throw "Need id";
      }

      if(!effect.name) {
          throw "Need an effect name";
      }  
      
      this.data[effect.id] = effect;
      
      effect.init();
      
    },
    
    /**
     * Get registered effect by its id
     */
    get : function(id) {
        return this.data[id];
    },
    
    /**
     * Get human readable effect list
     *
     * @param {Boolean} all Set to true to return base classes too 
     *
     * @return [ { id : name}, { id : name} ] 
     */
    getVocabulary : function(all) {
        
        var data = [];
        
        
        $.each(this.data, function(id, effect) {
        
            if(all || effect.available) {
                data.push({id:effect.id, name:effect.name});                
            }       
        });
        
        return data;
    }    
};

/**
 * Effects base class.
 *
 * All effects are singleton instances
 *
 * @singleton
 */
krusovice.effects.Base = {
    
    /**
     * @type String
     
     * Serialization id of the effect
     */
    id : null,
        
    /**
     * @type String
     *
     * The human readable name of the effect
     */
    name : null,
    
    /**
     * @type Boolean
     *
     * Whether or not the end user can pick this effect from the list. Set
     * false for the base classes.
     */
    available : false,
    
    
    /**
     * @type Array
     *
     * Animation types for which this effect is available.
     */
    categories : ["transitionid", "transitionout", "onscreen"],
    
    /**
     * How we will interpolate values from this animation type to the next.
     *
     * One of options given by {@link krusovice.utils#ease} 
     */
    easing : "linear",
            
    /**
     * @type Object
     *
     * Declare effect interpolation.
     *
     * **source** and *target** contains endpoints of the interpoliated effect values.
     *
     * They are randomized with corresponding data in **sourceVariation** and **targetVariation**.
     *
     * Usually effects declare only source parameters, as the target is the source of the next animation.
     * However the exception is *onscreen* animation, as it will be usually matched to beat at the
     * beginning and the end of animation.
     *
     */
    parameters : {
     
        /**
         * @type Object
         *
         * Default values for various source values.
         *
         * May be computed in prepareAnimationParameters
         */
        source : {
            
        },
    
    
        /**
         * Random ranges for each parameter
         */
        sourceVariation : {
            
        },
    
        /**
         * @type Object
         *
         * Default values for various target values,
         * 
         * May be computed in prepareAnimationParameters
         */    
        target : {
            
        },
        
        targetVariation : {
                    
        }, 
        
    },
    
    
    /**
     * Called when the animation is registered.
     *
     * Useful to tune parameters for the effect.
     * 
     */
    init : function() {        
    },
    
    animate : function() {        
    },
    
    render : function() {        
    },
    
    /**
     * Get list of parameter ids used for this effect.
     */
    getParameterNames : function(parametersSlot) {
        var names = [];
        $.each(this.parameters[parametersSlot], function(key, val) {
            names.append(val);
        });
        
        return names;       
    },
    
    /**
     * Read effect parameters. 
     *
     * First try animation level parameter, then  
     * show level parameter and finally fall back 
     * to the value defined in the effect class itself.
     *
     */
    getParameter : function(name, slot, showConfig, animationConfig) {
        
        var value;
        
        if(animationConfig[slot]) {
            value = animationConfig[value];
            if(value !== undefined) {
                return value;
            }
        }
        
        if(showConfig[slot]) {
            value = showConfig[slot][value];            
            if(value !== undefined) {
                return value;
            }
        }
        
        if(this.parameters[slot]) {
            value = this.parameters[slot][value];            
            if(value !== undefined) {
                return value;
            }
        }


        throw "Unknown effect parameter:" + name;        
    },
    
    initParameter : function(obj, slot, name, config, source) {                              
        obj[name] = this.randomizeParameter(name, source, config, source);    
    },
    
    /**
     * Initialize animation source and target parameters and store then on an obeject.
     *
     * Generate animation parameters based on object config, show config and global config 
     * (in this order). The animation parameter data is in format 
     * as described in {@link krusovice.effects.Base#parameters}. The
     * actual parameter names and values vary effect by effect.
     *
     * @param {String} parametersSlot "source" or "target"
     *
     * @param {Object} obj Object receiving calculated values 
     *
     * @param {Object} config Global effects overrides
     *
     * @param {Object} source Input element effects overrides
     *
     */
    initParameters : function(parametersSlot, obj, config, source) {
        
        var names = this.getParameterNames(parametersSlot);
        
        names.forEach(function(name) {
            obj[name] = this.randomizeParameter(name, parametersSlot, config, source);    
        });        
    },
    
    /**
     * 
     */
    randomizeParameter : function(name, slot, config, source) {
        
        var valSlot = slot;
        var variationSlot = slot + "Variation";
                
         var val = this.getParameter(name, valSlot, config, source);         
         var variation = this.getParameter(name, varSlot, config, source);         
        
         return val + krusovice.utils.spitrnd(variation);
    },
    
    
    
    /**
     * Set animation source and target parameters for this effects.
     *
     * The purpose is to set animation parameters for "current" animation
     * and optionally hint previous or next animations.
     * 
     * @param {Object} config Global effect configuration
     */
    prepareParameters : function(parametersSlot, obj, config, source) {        
        this.initParameters(parametersSlot, config, source)
    },
    
    
    time : function(startTime, endTime, rhytmAnalysis) {        
    },    
   
}
