SimpleWebGL
===========

JavaScript toolkit for fast and simple WebGL low-level rendering.

Version
-------
1.0

Usage
-----

First, include toolkit file as standart javascript library:

```html
<script type="text/javascript" src="path_to_lib/simplewebgl.min.js"></script>
```

Second, create a new instance of SimpleWebGL:

```js
var GL = new SimpleWebGL(width, height);
```
Arguments *width* and *height* are sizes for creating canvas and rendering viewport.

API
---

After instance iniated you can use provided API in jQuery-like style:

* **setProgram**(_program_) - complie shaders (*program.vertex* and *program.fragment*) and use it as main program.

* **setShaderVars**(_vars_) - get attributes (*vars.attribute* as array or string) and uniforms (*vars.uniform* as array or string) for use in draw function.

* **setArrayBuffers**(_buffers_) - for each element of *buffers* craetes buffer typed *gl.ARRAY_BUFFER* and save into *GL.buffers[index]* corresponding to index.

* **setElementsArrayBuffers**(_buffers_) - like setArrayBuffers() but typed *gl.ELEMENT_ARRAY_BUFFER*.

* **setTextures**(_textures_) - create texture named with index of *textures* object and save into *GL.textures[index]*. Every item may be an image or canvas or video html elements.

* **onDraw**(_function_, _arguments_) - set *function* calling on every *GL.draw()* step with *arguments*. Insinde function use **this** object for get acces for preapred buffers as **this.buffers**, variables (attributes and uniforms) as **this.vars**, textures as **this.textures** and WebGL context as **this.gl**.

* **draw**() - drawn scene.

* **drawLoop**(_fps_) - run drawning loop with *fps* (frame per second).

* **drawStop**() - stop current drawning loop.

* **resize**(_width_, _height_) - set new sizes of canvas and viewport.

* **noConflict**(_name_) - detach SimpleWebGL object from global scope and a) save with *name* or b) return it.

* **version** - string with current toolkit version.

* **height**, **width** - specified sizes. 

TODO
-----
- Provide advanced textures creating parameters.
- Save several programs for using.

Licence
-------
BSD 3-Clause

Authors
-------
[Vasiliy Os]

[Vasiliy Os]: http://vasiliy0s.com