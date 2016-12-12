/* 

v1.0.0
     _                     __    _                 
  __| |_ __ __ _  __ _  /\ \ \__| |_ __ ___  _ __  
 / _` | '__/ _` |/ _` |/  \/ / _` | '__/ _ \| '_ \ 
| (_| | | | (_| | (_| / /\  / (_| | | | (_) | |_) |
 \__,_|_|  \__,_|\__, \_\ \/ \__,_|_|  \___/| .__/ 
                 |___/                      |_|    

 Custom Events (>IE8):

 ** dragNdrop:start
 ** dragNdrop:drag
 ** dragNdrop:stop
 ** dragNdrop:dropped


 Classes

 .dragNdrop                 on every draggable element
 .dragNdrop--start          on element click
 .dragNdrop--drag           on element drag
 .dragNdrop--stop           on element release
 .dragNdrop--dropped        on successful element drop into container
 .dragNdrop--dropable       on element that can be dropped into at least one container
 .dragNdrop__drop--ready    on dropcontainer when element is dragged
 .dragNdrop__drop--dropped  on dropcontainer when an element is successfully dropped inside


 Properties

 ** @element        node              single DOM element
 ** @customStyles   boolean           false / true
 ** @constraints    string or node    false / 'x' / 'y' / single DOM element
 ** @dropElements   nodes             false / array of DOM elements
 ** @callback       function          function that gets fired when dropped

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
  //Setup
  var IE = false;
  var element = options.element;
  var customStyles = options.customStyles;
  var constraints = options.constraints;
  var dropElements = options.dropElements;
  var callback = options.callback;

  addClass(element, 'dragNdrop');

  //Styles
  if(!customStyles) setStyles(element);

  //Event Listeners
  element.addEventListener('mousedown', eleMouseDown, false);
  element.addEventListener('touchstart', eleMouseDown, false);

  //Start
  function eleMouseDown() {
    dispatchEvent('start');
    removeClass(element, 'dragNdrop--stop');
    addClass(element, 'dragNdrop--start');
    
    //Add listeners
    document.addEventListener('mousemove', eleMouseMove, false);
    document.addEventListener('touchmove', eleMouseMove, false);
    document.addEventListener('mouseup', eleMouseUp, false);
    document.addEventListener('touchend', eleMouseUp, false);
  }
  
  //- Styles
  function setStyles(element) {
    var cursor, style = element.style;
    style.position = 'absolute';
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

    if(dropElements) prepareDrop(element, dropElements);
    if(!customStyles) element.style.zIndex = '9999';

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
    var size = {
      h: element.offsetHeight,
      w: element.offsetWidth
    };
    
    var position = {
      x: event.pageX - size.w / 2,
      y: event.pageY - size.h / 2
    };
    
    moveElement(element, position, constraints);
  }
  
  //- Move Element
  function moveElement(element, position, constraints) {
    if(constraints && constraints !== false) {
      handleConstraints(element, position, constraints);
    } else {
      element.style.left = position.x + 'px';
      element.style.top = position.y + 'px';
    }
  }
  
  //- Handle Constraints
  function handleConstraints(element, position, constraints) {
    if(constraints === 'x') {
      element.style.left = position.x + 'px';

    } else if(constraints === 'y') {
      element.style.top = position.y + 'px';

    } else if(typeof constraints.innerHTML === "string") { //if constraints = DOM element
      element.style.left = position.x + 'px';
      element.style.top = position.y + 'px';
      isElementInside(element, constraints, false);
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
    var containerRect = {
      top: container.getBoundingClientRect().top + window.scrollY,
      left: container.getBoundingClientRect().left + window.scrollX
    };
    var containerSize = {
      top: container.offsetHeight,
      left: container.offsetWidth
    };
    var elementRect = {
      top: element.getBoundingClientRect().top + window.scrollY,
      left: element.getBoundingClientRect().left + window.scrollX
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
          if (!drop) element.style[rect[i]] = containerRect[rect[i]] + 'px';
        }
      } else { // bottom, right
        // position left + element size <= container position left + container size
        if(elementRect[rect[i]] + elementSize[rect[i]] <= containerRect[rect[i]] + containerSize[rect[i]]) {
          inside.push(true);
        } else {
          inside.push(false);
          // element = container position left + container size - element size (to contain it, otherwise the element would be placed outside)
          if (!drop) element.style[rect[i]] = containerRect[rect[i]] + containerSize[rect[i]] - elementSize[rect[i]] + 'px';
        }
      }
    }

    return inside.every(function(e) { return e === true; });
  }
  
  //- Stop
  function eleMouseUp() {
    dispatchEvent('stop');
    removeClass(element, 'dragNdrop--drag');
    addClass(element, 'dragNdrop--stop');

    var dropped = false;
    if(dropElements) dropped = handleDrop(element, dropElements);
    if(callback) callback({element: element, dropped: dropped, dropElements: dropElements, constraints: constraints, customStyles: customStyles});

    //remove listeners
    document.removeEventListener('mousemove', eleMouseMove, false);
    document.removeEventListener('touchmove', eleMouseMove, false);
    document.removeEventListener('mouseup', eleMouseUp, false);
    document.removeEventListener('touchend', eleMouseUp, false);
  }

  //- prepare drop
  function prepareDrop(element, dropElements) {
    removeClass(element, 'dragNdrop--dropped');
    addClass(element, 'dragNdrop--dropable');

    for (var i = 0; i < dropElements.length; i++) {
      var dropElement = dropElements[i];
      removeClass(dropElement, 'dragNdrop__drop--dropped');
      addClass(dropElement, 'dragNdrop__drop--ready');
    }
  }

  //- handle drop
  function handleDrop(element, dropElements) {
    removeClass(element, 'dragNdrop--dropable');
    removeClass(element, 'dragNdrop--dropped');

    var dropped = [];
    for (var i = 0; i < dropElements.length; i++) {
      var dropElement = dropElements[i];
      removeClass(dropElement, 'dragNdrop__drop--ready');

      if(isElementInside(element, dropElement, true)) {
        dispatchEvent('dropped');
        addClass(element, 'dragNdrop--dropped');
        addClass(dropElement, 'dragNdrop__drop--dropped');
        dropped.push(dropElement);
      } else {
        removeClass(dropElement, 'dragNdrop__drop--dropped');
        dropped.push(false);
      }
    }

    var droppedContainer = [];
    function isDropped(element) {
      if(element) {
        droppedContainer.push(element);
        return true;
      } else {
        return false;
      }
    }

    if(dropped.some(isDropped)) {
      return droppedContainer;
    } else {
      return false;
    }
  }

  /**
   * HELPER FUNCTIONS
   */
  function dispatchEvent(name) {
    var eventing;
    if(IE) {
      eventing = document.createEvent('dragNdrop:' + name);
      eventing.initEvent('dragNdrop:' + name, true, true);
    } else {
      eventing = new Event('dragNdrop:' + name);
    }
    element.dispatchEvent(eventing);
  }

  function hasClass(el, className) {
    if (el.classList) {
      return el.classList.contains(className);
    } else {
      return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    }
  }

  function addClass(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else if (!hasClass(el, className)) {
      el.className += " " + className;
    }
  }

  function removeClass(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else if (hasClass(el, className)) {
      var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
      el.className=el.className.replace(reg, ' ');
    }
  }

}
