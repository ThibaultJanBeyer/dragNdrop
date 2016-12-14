#TO-DO

- One should be able to set "drag" and "drop" to elements separately: 
that the drag elements are not bound to the drop elements &
that they both have a separate drop callback but can also work together.
(dropzone centered vs dragelement centered)
OR by providing .classnames so that dropZones are not fix once set

- One should be able to drop an element 'approximatively' into a smaller one (over 50% of dropzone is covered by dragelement)

- Accessible dragNdrop

- Automatically fallback to normal css if translate3d is not supported (right now it only does that for old IE browsers, which is fine since it is well supported on other browsers, but you never know)