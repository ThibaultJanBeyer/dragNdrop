```text
     _                     __    _
  __| |_ __ __ _  __ _  /\ \ \__| |_ __ ___  _ __
 / _` | '__/ _` |/ _` |/  \/ / _` | '__/ _ \| '_ \
| (_| | | | (_| | (_| / /\  | (_| | | | (_) | |_) |
 \__,_|_|  \__,_|\__, \_\ \/ \__,_|_|  \___/| .__/
                 |___/                      |_|
```

#dragNdrop

easily add drag and drop functionality to your dom nodes elements

##Project Page: Demo & Info

[https://thibaultjanbeyer.github.io/dragNdrop/](https://thibaultjanbeyer.github.io/dragNdrop/)

##Key-Features

- Add draggability to any DOM element
- Add corresponding drop containers
- Callback, Classes and Events available
- Awesome browser support, works even on IE5
- Ease of use
- Lightweight, only 1KB gzipped
- Performance: dragNdrop uses hardware accelerated css by default which makes it hyper fast 
- Free & open source under MIT License

##Why?

Because there was nothing this small that does not require jquery out there.


##1. Installation

###easy

Just [download the file](https://github.com/ThibaultJanBeyer/dragNdrop/blob/master/dist/dragNdrop.js) ([minified](https://github.com/ThibaultJanBeyer/dragNdrop/blob/master/dist/dNd.min.js)) and add it to your document:  
```html
<script src="https://thibaultjanbeyer.github.io/dragNdrop/dNd.min.js"></script>
```

###npm

```
npm install --save-dev npm-dragndrop
```

###bower

```
bower install --save-dev dragndrop
```

That's it, you're ready to rock!  
Of course you can also just include the function within your code to save a request.


##Usage

Now in your JavaScript you can simply pass elements to the function like so:

**simple**
```javascript
dragNdrop({
  element: document.getElementById('element1'), // draggable element
  dropZones: [ document.getElementById('dropContainer1') ] // dropzone (optional)
});
```
**complete**
```javascript
dragNdrop({
  // element to be dragged (DOM element)
  element: document.getElementById('element1'), // (optional, default: '#dragNdrop-element')
  // custom styles (false / true)
  customStyles: false, // (optional, default: false)
  // custom styles (true / false) (if true, element styles overwrite plugin styles)
  useTransform: true, // (optional, default: true)
  // constraints (false / 'x' / 'y' / DOM element)
  constraints: false, // (optional, default: false)
  // drop (false / DOM element)
  dropZones: [ document.getElementById('dropContainer1') ], // (optional, default: '#dragNdrop-dropZone')
  // callback(event){}
  callback: function(event) { // (optional)
    // event.element, event.dropped, event.dropZones, event.constraints, event.customStyles
  }
});
```
Check out the [examples page](https://thibaultjanbeyer.github.io/dragNdrop/) for more examples.


##Properties:
| property | type | usage |
|--- |--- |--- |
|element |single DOM element (node) |the element that will be draggable |
|customStyles |false / true (boolean) |when set to true, the styles you give the element will overwrite those from the plugin |
|useTransform |true / false (boolean) |use hardware accelerated css (translate3d) or not (default: true) |
|constraints |false / 'x' / 'y' / single DOM element (boolean/ string/ node) |constrain the element: 'x' = element can only be dragged on the x axis. 'y' = element can only be dragged on the y axis. DOM element = element can only be dragged within that container |
|dropZones |false / array of DOM element(s) (node(s)) |one or more drop-elements (where the element can be dropped into) |
|callback |function |a callback function (taking an event object) that gets fired when the element is dropped |

##Callback Event Object:
| event.property | usage |
|--- |--- |
|element |the element that was dropped |
|dropped |false = element was not dropped into a drop-container. [node] = array of dom elements = drop-containers in which the element was dropped |
|customStyles |false / true |
|constraints |false / 'x' / 'y' / single DOM element |
|dropZones |one or more drop-elements (where the element can be dropped into) |

##Events
| name | trigger |
|--- |--- |
|dragNdrop:start |user click/tap the element |
|dragNdrop:drag |user moves the element |
|dragNdrop:stop |user releases the element |
|dragNdrop:dropped |element was dropped into a drop-container |

##Classes
| name | trigger |
|--- |--- |
|.dragNdrop |on every draggable element |
|.dragNdrop--start |on element click |
|.dragNdrop--drag |on element drag |
|.dragNdrop--stop |on element release |
|.dragNdrop--dropped |on successful element drop into container |
|.dragNdrop--dropable |on element that can be dropped into at least one container |
|.dragNdrop__dropzone |on each dropZone |
|.dragNdrop__dropzone--ready |on corresponding dropZone when element is dragged |
|.dragNdrop__dropzone--dropped |on dropZone when an element is successfully dropped inside |

###Have Fun!

[![Typewriter Gif](https://thibaultjanbeyer.github.io/dragNdrop/typewriter.gif)](http://thibaultjanbeyer.com/)
