/* 

v1.0.0
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
 .dragNdrop--dropzone           on every dropZone
 .dragNdrop__dropzone--ready    on dropZone when element is dragged
 .dragNdrop__dropzone--dropped  on dropZone when an element is successfully dropped inside


 Properties

 ** @element        node              single DOM element                          (Mandatory!) default: NaN
 ** @customStyles   boolean           false / true                                (optional) default: false
 ** @transform      boolean           true / false                                (optional) default: true
 ** @constraints    string or node    false / 'x' / 'y' / single DOM element      (optional) default: false
 ** @dropZones      nodes             false / array of DOM elements               (optional) default: false
 ** @callback       function          function that gets fired when dropped       (optional) default: function(){}

 ***     @callback function can obtains an event object with following keys/values:
 ****        @element,
 ****        @dropped  (false / array of DOM elements the element was dropped into),
 ****        @drop, @constraints, @customStyles


 ******************************************
 ********* The MIT License (MIT) **********
 ******************************************

 Copyright (c) 2015 ThibaultJanBeyer
 web: http://www.thibaultjanbeyer.com/
 github: 

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

function dragNdrop(options) {
  //Errors
  if(!options) {
    console.log('ERROR: dragNdrop: please provide an options object to the function. See reference at: https://github.com/ThibaultJanBeyer/dragNdrop for more info');
  } else if(options && !options.element) {
    console.log('ERROR: dragNdrop: please provide an element (options.element) that will be made draggable to the function. See reference at: https://github.com/ThibaultJanBeyer/dragNdrop for more info');
  }

  //Setup
  var element = options.element;
  var customStyles = options.customStyles || false;
  var constraints = options.constraints || false;
  var dropZones = options.dropZones || false;
  var callback = options.callback || function(){};
  var transform = options.transform || true;

  var elementPos = { x: 0, y: 0 };
  var prevPos = { x: 0, y: 0 };
  var constraintElement = constraints && typeof constraints.innerHTML === "string"; //if constraints = DOM element

  //check for old internet explorer versions
  var div = document.createElement('div');
  div.innerHTML = '<!--[if lt IE 9]><i id="ie-version-below-nine"></i><![endif]--><!--[if IE 9]><i id="ie-version-nine"></i><![endif]-->';
  var isIeLessThan10 = (div.getElementsByTagName('i').length == 1);
  if (isIeLessThan10) {
    console.log('WARNING: dragNdrop: a browser older than IE 10 detected! ', ' (use top/left position instead of transform, attachEvent instead of addEventListener and initEvent instead of new Event constructor)');
    console.log('WARNING: dragNdrop: the tool will probably work but please do yourself a favor and update your browser');
    //internet explorer <9 does not support transform3d
    transform = false;
  }

  //add startup classes
  addClass(element, 'dragNdrop');
  if(dropZones) {
    for(var i = 0, il = dropZones.length; i < il; i++) {
      addClass(dropZones[i], 'dragNdrop__dropzone');
    }
  }

  //Event Listeners
  if(document.addEventListener) {
    element.addEventListener('mousedown', eleMouseDown, false);
    element.addEventListener('touchstart', eleMouseDown, false);
  } else {
    //fix for IE8-
    element.attachEvent('onmousedown', eleMouseDown);
    element.attachEvent('touchstart', eleMouseDown);
  }

  //- Start
  function eleMouseDown(ev) {
    dispatchEvent('start');
    removeClass(element, 'dragNdrop--stop');
    addClass(element, 'dragNdrop--start');

    // prevent text selection
    if(ev.preventDefault) {
      ev.preventDefault();
    } else {
      //the later is for IE8-
      ev.returnValue = false;
    }

    var event;
    if ('touches' in ev) { // slight adaptations for touches
      event = ev.touches[0];
    } else {
      event = ev;
    } // get first mouse position
    // clientX/Y fallback for IE8-
    prevPos = { x: event.pageX || event.clientX, y: event.pageY || event.clientY };

    addEventListeners();
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
  
  //- Styles
  if(!customStyles) setStyles(element);
  function setStyles(element) {
    var cursor, style = element.style;
    if(!transform) style.position = 'relative';
    style.zIndex = '999';

    if(constraints && constraints === 'x' || constraints === 'y') {
      cursor = constraints === 'x' ? 'col-resize' : 'row-resize';
    } else {
      cursor = 'move';
    }
    style.cursor = cursor;
  }

  //- Drag
  function eleMouseMove(ev) {
    var event;

    dispatchEvent('drag');
    removeClass(element, 'dragNdrop--start');
    addClass(element, 'dragNdrop--drag');

    if(dropZones) prepareDrop(element, dropZones);
    if(!customStyles && element.style.zIndex !== '9999' || document.body.style.cursor !== element.style.cursor) {
      element.style.zIndex = '9999';
      document.body.style.cursor = element.style.cursor;
    }

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
    var cusorPos = { // event.clientX/Y fallback for IE8-
      x: event.pageX || event.clientX,
      y: event.pageY || event.clientY
    };
    var position = {
      x: cusorPos.x - prevPos.x,
      y: cusorPos.y - prevPos.y
    };
    prevPos = { x: cusorPos.x, y: cusorPos.y };
    
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
    if(transform) {
      element.style.transform = 'translate3d(' + newPosition.x + 'px ,' + newPosition.y + 'px , 1px)';
      element.style.webkitTransform = 'translate3d(' + newPosition.x + 'px ,' + newPosition.y + 'px , 1px)';
    } else {
      element.style.left = newPosition.x + 'px';
      element.style.top = newPosition.y + 'px';
    }
  }
  
  //- Is element within container?
  function isElementInside(element, container, drop) {
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

  //- Stop
  function eleMouseUp() {
    dispatchEvent('stop');
    removeClass(element, 'dragNdrop--drag');
    addClass(element, 'dragNdrop--stop');

    var dropped = false;
    if(dropZones) dropped = handleDrop(element, dropZones);
    if(callback) callback({element: element, dropped: dropped, dropZones: dropZones, constraints: constraints, customStyles: customStyles});

    removeEventListeners();
    if(!customStyles) document.body.style.cursor = 'inherit';
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
        el.className += " " + className;
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
}
