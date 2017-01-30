/* 

v1.2.0
     _                     __    _                 
  __| |_ __ __ _  __ _  /\ \ \__| |_ __ ___  _ __  
 / _` | '__/ _` |/ _` |/  \/ / _` | '__/ _ \| '_ \ 
| (_| | | | (_| | (_| / /\  / (_| | | | (_) | |_) |
 \__,_|_|  \__,_|\__, \_\ \/ \__,_|_|  \___/| .__/ 
                 |___/                      |_|    



 ##Key-Features

 - Add draggability to any DOM element
 - Add corresponding drop containers
 - Callback, Classes and Events available
 - Awesome browser support, works even on IE8
 - Ease of use
 - Lightweight, only 1KB gzipped
 - Performance: dragNdrop uses hardware accelerated css by default which makes it hyper fast. Old Browsers? Don’t worry: it gracefully falls back to normal position manipulation if the browser does not support hardware accelerated css
 - Free & open source under MIT License




 Custom Events (only IE9+):

 ** dragNdrop:start
 ** dragNdrop:drag
 ** dragNdrop:stop
 ** dragNdrop:dropped


 Classes

 .dragNdrop                     on every draggable element
 .dragNdrop--start              on element click
 .dragNdrop--drag               on element drag
 .dragNdrop--stop               on element release
 .dragNdrop--dropped            on successful element drop into container
 .dragNdrop--dropable           on element that can be dropped into at least one container
 .dragNdrop__dropzone           on every dropZone
 .dragNdrop__dropzone--ready    on dropZone when element is dragged
 .dragNdrop__dropzone--dropped  on dropZone when an element is successfully dropped inside


 Properties

 ** @element        node            single DOM element                              (Mandatory!) default: NaN
 ** @customStyles   boolean         false / true                                    (optional) default: false
 ** @useTransform   boolean         true / false                                    (optional) default: true
 ** @constraints    string or node  false / 'x' / 'y' / single DOM element          (optional) default: false
 ** @dropZones      nodes           false / array of DOM elements / css selector(s) (optional) default: false
 ** @callback       function        function that gets fired when dropped           (optional) default: function(){}

 ***     @callback function can obtains an event object with following keys/values:
 ****        @element,
 ****        @dropped  (false / array of DOM elements the element was dropped into),
 ****        @drop, @constraints, @customStyles


 ******************************************
 ********* The MIT License (MIT) **********
 ******************************************

 Copyright (c) 2016 ThibaultJanBeyer
 web: http://www.thibaultjanbeyer.com/
 github: https://github.com/ThibaultJanBeyer/dragNdrop

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

var dragNdrop = function(options) {
  //Errors
  if(!options) {
    console.log('ERROR: dragNdrop: please provide an options object to the function. See reference at: https://github.com/ThibaultJanBeyer/dragNdrop for more info');
  } else if(options && !options.element) {
    console.log('ERROR: dragNdrop: please provide an element (options.element) that will be made draggable to the function. See reference at: https://github.com/ThibaultJanBeyer/dragNdrop for more info');
  }

  //Setup
  var element = options.element;
  var customStyles = options.customStyles;
  var constraints = options.constraints;
  var dropZones = setupDropZones(options.dropZones);
  var callback = options.callback;
  var useTransform = ('useTransform' in options) ? options.useTransform : true;

  var elementPos = {};
  var prevPos = { x: 0, y: 0 };
  var constraintElement = constraints && typeof constraints.innerHTML === 'string'; //if constraints = DOM element

  //check if browser supports hardware accelerated css
  if(!has3d()) {
    console.log('WARNING: dragNdrop: your browser does not support hardware accelerated css. The plugin will still work but do yourself a favor and update your browser.');
    useTransform = false;
  }

  //- Setup dropZones
  function setupDropZones(dropZones) {
    if (dropZones) {
      var _dropZones = getDropZones(dropZones);
      setupClasses(_dropZones);
      return _dropZones;
    } else {
      return false;
    }
  }

  function getDropZones(dropZones){
    var _dropZones = [];
    if(dropZones instanceof Array) {
      for (var i = 0, il = dropZones.length; i < il; i++) {
        _dropZones = _dropZones.concat(getElement(dropZones[i]));
      }
    } else {
      _dropZones = _dropZones.concat(getElement(dropZones));
    }
    return _dropZones;
  }

  function getElement(selector) {
    // if selector is a specific DOM element
    if (typeof selector.innerHTML === 'string') {
      return [selector];
    // if selector is a string, thus a css selector
    } else if(typeof selector === 'string') {
      var elements = document.querySelectorAll(selector);
      // since the querySelector returns a nodelist but we want a normal array of DOM nodes,
      // we have to extract the nodes from the nodelist and save them in an array
      var extractNodelist = [];
      for (var i = 0, il = elements.length; i < il; i++) {
        extractNodelist.push(elements[i]);
      }
      return extractNodelist;
    }
  }

  //- Start
  function start() {
    setupEventListeners(element);
    setStyles(element);
    setupClasses();
  }
  start();

  //- Setup Classes
  function setupClasses(_dropZones) {
    addClass(element, 'dragNdrop');
    if(_dropZones) {
      for(var i = 0, il = _dropZones.length; i < il; i++) {
        addClass(_dropZones[i], 'dragNdrop__dropzone');
      }
    }
  }


  //- Styles
  function setStyles(element) {
    if(customStyles) {
      setCustomStyles(element);
    } else {
      element.style.position = (!useTransform) ? 'relative' : 'auto';
      element.style.zIndex = '999';
      if(constraints && constraints === 'x' || constraints === 'y') {
        element.style.cursor = constraints === 'x' ? 'col-resize' : 'row-resize';
      } else {
        element.style.cursor = 'move';
      }
    }
  }

  function setCustomStyles(element) {
    //position
    var tempPos = getStyle(element, 'position');
    if(tempPos && tempPos !== 'static') {
      element.style.position = tempPos;
    } else {
      element.style.position = (!useTransform) ? 'relative' : 'auto';
    }
    //zIndex
    var tempZindex = getStyle(element, 'zIndex');
    if(tempZindex && tempZindex !== 'auto') {
      element.style.zIndex = tempZindex;
    } else {
      element.style.zIndex = '999';
    }
    //cursor
    var tempCursor = getStyle(element, 'cursor');
    if(tempCursor && tempZindex !== 'auto') {
      element.style.cursor = tempCursor;
    } else {
      if(constraints && constraints === 'x' || constraints === 'y') {
        element.style.cursor = constraints === 'x' ? 'col-resize' : 'row-resize';
      } else {
        element.style.cursor = 'move';
      }
    }
  }

  var documentCursorStyles = document.body.style.cursor || 'inherit';


  //- Event Listeners
  function setupEventListeners(element) {
    if(document.addEventListener) {
      element.addEventListener('mousedown', eleMouseDown, false);
      element.addEventListener('touchstart', eleMouseDown, false);
    } else {
      //fix for IE8-
      element.attachEvent('onmousedown', eleMouseDown);
      element.attachEvent('touchstart', eleMouseDown);
    }
  }


  //- Drag Start
  function eleMouseDown(ev) {
    dispatchEvent('start');
    removeClass(element, 'dragNdrop--stop');
    addClass(element, 'dragNdrop--start');

    // prevent text selection
    var event = ('touches' in ev) ? ev.touches[0] : ev;
    if(event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; } //the later is for IE8-

    getStartingPositions(element, event);

    //style changes
    element.style.zIndex = parseInt(element.style.zIndex) + 1;
    var docStyles = document.body.style;
    docStyles.cursor = (docStyles.cursor && docStyles.cursor !== 'inherit') ? docStyles.cursor : element.style.cursor;

    addEventListeners();
  }

  function getStartingPositions(element, event) {
    //get first mouse position
    prevPos = {
      //clientX/Y fallback for IE8-
      x: event.pageX || event.clientX,
      y: event.pageY || event.clientY
    };

    //get first element position
    if(useTransform) {
      // translate3d = 'XXpx, YYpx, 1px);'
      var translate3d = element.style.transform.split('translate3d(')[1];
      // results = ['XXpx', 'YYpx', '1px);'];
      var results = (translate3d) ? translate3d.split(',') : false;
      elementPos.x = parseInt(results[0]) || 0;
      elementPos.y = parseInt(results[1]) || 0;
    } else {
      elementPos.x = parseInt(getStyle(element, 'left')) || 0;
      elementPos.y = parseInt(getStyle(element, 'top')) || 0;
    }
  }


  //- add event listeners
  function addEventListeners() {
    //Add listeners
    if(document.addEventListener) {
      document.addEventListener('mousemove', eleMouseMove, false);
      document.addEventListener('touchmove', eleMouseMove, false);
      document.addEventListener('mouseup', eleMouseUp, false);
      document.addEventListener('touchend', eleMouseUp, false);
    } else {
      // support for IE8-
      document.attachEvent('onmousemove', eleMouseMove);
      document.attachEvent('touchmove', eleMouseMove);
      document.attachEvent('onmouseup', eleMouseUp);
      document.attachEvent('touchend', eleMouseUp);
    }
  }


  //- Drag
  function eleMouseMove(ev) {
    var event;

    dispatchEvent('drag');
    removeClass(element, 'dragNdrop--start');
    addClass(element, 'dragNdrop--drag');

    if(dropZones) prepareDrop(element, dropZones);

    if ('touches' in ev) { // slight adaptations for touches
      ev.preventDefault();
      event = ev.touches[0];
    } else {
      event = ev;
    }
    getPositions(element, event, constraints);
  }

  
  //- Get Positions
  function getPositions(element, event, constraints) {
    var cursorPos = { // event.clientX/Y fallback for IE8-
      x: event.pageX || event.clientX,
      y: event.pageY || event.clientY
    };
    var position = {
      x: cursorPos.x - prevPos.x,
      y: cursorPos.y - prevPos.y
    };
    prevPos = { x: cursorPos.x, y: cursorPos.y };
    
    handleMoveElement(element, position, constraints);
  }

  
  //- Handle Move
  function handleMoveElement(element, position, constraints) {
    if(constraints && constraints !== false) {
      handleConstraints(element, position, constraints);
    } else {
      moveElement(element, {
        x: elementPos.x + position.x,
        y: elementPos.y + position.y
      });
    }
  }

  
  //- Handle Constraints
  function handleConstraints(element, position, constraints) {
    if(constraints === 'x') {
      moveElement(element, {
        x: elementPos.x + position.x,
        y: elementPos.y // unchanged
      });

    } else if(constraints === 'y') {
      moveElement(element, {
        x: elementPos.x, // unchanged
        y: elementPos.y + position.y
      });

    } else if(constraintElement) { //if constraints = DOM element
      moveElement(element, {
        x: elementPos.x + position.x,
        y: elementPos.y + position.y
      });

      isElementInside(element, constraints, false);
    }
  }


  //- Move Element
  function moveElement(element, newPosition) {
    // set element position to the new position
    elementPos = { x: newPosition.x, y: newPosition.y };
    // update the view
    if(useTransform) {
      element.style.transform = 'translate3d(' + newPosition.x + 'px ,' + newPosition.y + 'px , 1px)';
      element.style.webkitTransform = 'translate3d(' + newPosition.x + 'px ,' + newPosition.y + 'px , 1px)';
    } else {
      element.style.left = newPosition.x + 'px';
      element.style.top = newPosition.y + 'px';
    }
  }

  
  //- Is element within container?
  function isElementInside(element, container, drop) {
    // An element should not be dropable into itself
    if (element === container) return false;
    /**
     * calculating everything here on every move consumes more performance
     * but makes sure to get the right positions even if the containers are
     * resized or moved on the fly. This also makes the function kinda context
     * independant.
     */
    var scroll = {
      // fallback for IE9-
      x: window.scrollY || document.documentElement.scrollTop,
      y: window.scrollX || document.documentElement.scrollLeft
    };
    var containerRect = {
      top: container.getBoundingClientRect().top + scroll.y,
      left: container.getBoundingClientRect().left + scroll.x
    };
    var containerSize = {
      top: container.offsetHeight,
      left: container.offsetWidth
    };
    var elementRect = {
      top: element.getBoundingClientRect().top + scroll.y,
      left: element.getBoundingClientRect().left + scroll.x
    };
    var elementSize = {
      top: element.offsetHeight,
      left: element.offsetWidth
    };

    // actually top, left, bottom, right (setting the top + cont size = bottom; left + cont size = right)
    var rect = ['top', 'left', 'top', 'left'];
    var inside = [];
    for(var i = 0, il = rect.length; i < il; i++) {
      if(i < il/2) { // top, left
        if(elementRect[rect[i]] >= containerRect[rect[i]]) {
          inside.push(true);
        } else {
          inside.push(false);

          if (!drop) putElementBack(element, rect[i], containerRect[rect[i]] - elementRect[rect[i]]);
        }
      } else { // bottom, right
        // position left + element size <= container position left + container size
        if(elementRect[rect[i]] + elementSize[rect[i]] <= containerRect[rect[i]] + containerSize[rect[i]]) {
          inside.push(true);
        } else {
          inside.push(false);
          if (!drop) putElementBack(element, rect[i], (containerRect[rect[i]] + containerSize[rect[i]]) - (elementRect[rect[i]] + elementSize[rect[i]]));
        }
      }
    }

    // check manually instead of using .every to support IE9-
    return (inside[0] && inside[1] && inside[2] && inside[3]);
  }


  //- Put Element Back
  function putElementBack(element, rect, difference) {
    if(rect === 'top') {
      moveElement(element, {
        y: elementPos.y + difference,
        x: elementPos.x
      });
    } else {
      moveElement(element, {
        y: elementPos.y,
        x: elementPos.x + difference
      });
    }
  }


  //- Stop Drag / Pause
  function eleMouseUp() {
    dispatchEvent('stop');
    removeClass(element, 'dragNdrop--drag');
    addClass(element, 'dragNdrop--stop');

    var dropped = false;
    if(dropZones) dropped = handleDrop(element, dropZones);
    if(callback) callback({element: element, dropped: dropped, dropZones: dropZones, constraints: constraints, customStyles: customStyles, useTransform: useTransform});

    removeEventListeners();

    //style resets
    element.style.zIndex = parseInt(element.style.zIndex) - 1;
    document.body.style.cursor = documentCursorStyles;
  }

  function pause() {
    eleMouseUp();
  }


  //- remove event listeners
  function removeEventListeners() {
    //remove listeners
    if(document.addEventListener) {
      document.removeEventListener('mousemove', eleMouseMove, false);
      document.removeEventListener('touchmove', eleMouseMove, false);
      document.removeEventListener('mouseup', eleMouseUp, false);
      document.removeEventListener('touchend', eleMouseUp, false);
    } else {
      // support for IE8-
      document.detachEvent('onmousemove', eleMouseMove);
      document.detachEvent('touchmove', eleMouseMove);
      document.detachEvent('onmouseup', eleMouseUp);
      document.detachEvent('touchend', eleMouseUp);
    }
  }


  //- prepare drop
  function prepareDrop(element, dropZones) {
    removeClass(element, 'dragNdrop--dropped');
    addClass(element, 'dragNdrop--dropable');

    for (var i = 0; i < dropZones.length; i++) {
      var dropElement = dropZones[i];
      removeClass(dropElement, 'dragNdrop__dropzone--dropped');
      addClass(dropElement, 'dragNdrop__dropzone--ready');
    }
  }


  //- handle drop
  function handleDrop(element, dropZones) {
    removeClass(element, 'dragNdrop--dropable');
    removeClass(element, 'dragNdrop--dropped');

    var dropped = [];
    for (var i = 0; i < dropZones.length; i++) {
      var dropZone = dropZones[i];
      removeClass(dropZone, 'dragNdrop__dropzone--ready');
      removeClass(dropZone, 'dragNdrop__dropzone--dropped');

      if(isElementInside(element, dropZone, true)) {
        dispatchEvent('dropped');
        addClass(element, 'dragNdrop--dropped');
        addClass(dropZone, 'dragNdrop__dropzone--dropped');
        dropped.push(dropZone);
      }
    }

    // check manually instead of using .some to support IE9-
    return (dropped.length > 0) ? dropped : false;
  }


  // Teardown
  function stop() {
    removeClasses(element);
    removeEventListeners();
    if( element.style.cursor === 'col-resize' ||
        element.style.cursor === 'row-resize' ||
        element.style.cursor === 'move' ) {
      element.style.cursor = 'auto';
    }
    if(document.addEventListener) {
      element.removeEventListener('mousedown', eleMouseDown, false);
      element.removeEventListener('touchstart', eleMouseDown, false);
    } else {  //fix for IE8-
      element.detachEvent('onmousedown', eleMouseDown);
      element.detachEvent('touchstart', eleMouseDown);
    }
  }

  function removeClasses(element) {
    removeClass(element, 'dragNdrop');
    removeClass(element, 'dragNdrop--drag');
    removeClass(element, 'dragNdrop--stop');
    removeClass(element, 'dragNdrop--dropped');
    removeClass(element, 'dragNdrop--dropable');
  }


  /**
   * HELPER FUNCTIONS
   */
  function dispatchEvent(name) {
    var eventing;
    if(typeof Event === 'function') {
      eventing = new Event('dragNdrop:' + name);
      element.dispatchEvent(eventing);
    } else {
      //fallback for IE9 is document.createEvent. But for IE8 and below that does not work either.
      if(document.createEvent) {
        eventing = document.createEvent('CustomEvent');
        eventing.initEvent('dragNdrop:' + name, true, true);
        element.dispatchEvent(eventing);
      }
    }
  }

  function hasClass(el, className) {
    if (el.classList) {
      return el.classList.contains(className);
    } else {
      return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    }
  }

  function addClass(el, className) {
    if(!hasClass(el, className)) {
      if (el.classList) {
        el.classList.add(className);
      } else {
        el.className += ' ' + className;
      }
    }
  }

  function removeClass(el, className) {
    if(hasClass(el, className)) {
      if (el.classList) {
        el.classList.remove(className);
      } else {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className=el.className.replace(reg, ' ');
      }
    }
  }

  function getStyle(el, prop) {
    if(window.getComputedStyle) {
      return window.getComputedStyle(el, null)[prop];
    // same as window.getComputedStyle see : https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle#defaultView
    } else if (document.defaultView && document.defaultView.getComputedStyle) {
      return document.defaultView.getComputedStyle(el, null)[prop];
    } else if (el.currentStyle) {
      return el.currentStyle[prop];
    } else {
      return el.style[prop];
    }
  }

  //checks if browser supports hardware accelerated css. As seen here: http://stackoverflow.com/a/12621264/3712591
  function has3d() {
    if (!window.getComputedStyle) {
      return false;
    }

    var el = document.createElement('p'),
      _has3d,
      //see http://caniuse.com/#search=translate3d
      transforms = {
        'webkitTransform':'-webkit-transform',
        'transform':'transform'
      };

    //Add it to the body to get the computed style.
    document.body.insertBefore(el, null);

    for (var t in transforms) {
      if (el.style[t] !== undefined) {
        el.style[t] = 'translate3d(1px, 1px, 1px)';
        _has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
      }
    }

    document.body.removeChild(el);

    return (_has3d !== undefined && _has3d.length > 0 && _has3d !== 'none');
  }

  // querySelector polyfill
  function querySelectorPolyfill() {
    if (!document.querySelectorAll) {
      document.querySelectorAll = function (selectors) {
        var style = document.createElement('style'), elements = [], element;
        document.documentElement.firstChild.appendChild(style);
        document._qsa = [];

        style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
        window.scrollBy(0, 0);
        style.parentNode.removeChild(style);

        while (document._qsa.length) {
          element = document._qsa.shift();
          element.style.removeAttribute('x-qsa');
          elements.push(element);
        }
        document._qsa = null;
        return elements;
      };
    }

    if (!document.querySelector) {
      document.querySelector = function (selectors) {
        var elements = document.querySelectorAll(selectors);
        return (elements.length) ? elements[0] : null;
      };
    }
  }
  querySelectorPolyfill();


  var DND = {
    setupDropZones: setupDropZones,
    getDropZones: getDropZones,
    getElement: getElement,
    start: start,
    setupClasses: setupClasses,
    setStyles: setStyles,
    setCustomStyles: setCustomStyles,
    setupEventListeners: setupEventListeners,
    eleMouseDown: eleMouseDown,
    getStartingPositions: getStartingPositions,
    addEventListeners: addEventListeners,
    eleMouseMove: eleMouseMove,
    getPositions: getPositions,
    handleMoveElement: handleMoveElement,
    handleConstraints: handleConstraints,
    moveElement: moveElement,
    isElementInside: isElementInside,
    putElementBack: putElementBack,
    eleMouseUp: eleMouseUp,
    pause: pause,
    removeEventListeners: removeEventListeners,
    prepareDrop: prepareDrop,
    handleDrop: handleDrop,
    stop: stop,
    removeClasses: removeClasses
  };
  return DND;
};

// make exportable
if (typeof module !== 'undefined' && module !== null) {
  module.exports = dragNdrop;
} else {
  window.dragNdrop = dragNdrop;
}
