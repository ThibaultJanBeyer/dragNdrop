dragNdrop({
  // element to be dragged (DOM element)
  element: document.getElementById('element'),
  // custom styles (false / true)
  customStyles: false,
  // constraints (false / 'x' / 'y' / DOM element)
  constraints: document.getElementById('container'),
  // drop (false / DOM element)
  dropZones: [
    document.getElementById('drop'),
    document.getElementById('drop2')
  ],
  // callback
  callback: function(event) {
    console.log(event);
  }
});
