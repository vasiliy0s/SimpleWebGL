/**
 * SimpleWebGL Javascript Library v1.0.
 *
 * It provides toolkit for fast and simple WebGL low-level rendering.
 *
 * Copyrights (c) 2013, Vasiliy Telyatnikov.
 * Released under BSD 3-Clause License.
 *
 * Written by vasiliy0s (http://vasiliy0s.com).
 * 
 * https://github.com/vasiliy0s/SimpleWebGL.
 */

;(function (W) {

	'use strict';

	// simpleGL constructor.
	function SimpleWebGL (width, height)
	{
		// Prevent fails for not used 'new' operator.
		if (!this || this instanceof Window) 
			return new SimpleWebGL(width, height);

		// Save instance parameters.
		this.width = width;
		this.height = height;
		this.fps = 0;
		this.timeoutId = 0;
		this.vars = {};
		this.buffers = {};
		this.textures = {};
		
		this.gl = this.initGL(width, height);

		// Set clean state.
		if (this.gl)
		{
			this.setViewport(width, height);
			this.clear();
		}

		// jQuery-style.
		return this;
	}

	// Technique name for debug output.
	SimpleWebGL.prototype.name = 'SimpleWebGL';
	SimpleWebGL.prototype.version = '1.0';

	// WebGL initialization.
	SimpleWebGL.prototype.initGL = function (width, height)
	{
		var gl = null;

		if (window['Float32Array'])
			try 
			{
				this.cgl = document.createElement('canvas');
				this.cgl.width = width;
				this.cgl.height = height;

				var gl = this.cgl.getContext('webgl') || this.cgl.getContext('experimental-webgl') || this.cgl.getContext('webkit-3d') || this.cgl.getContext('moz-webgl') || null;

			} catch (e) { console.warn('SimpleWebGL cannot be initialized because current browser or operating system does not support WebGL rendering') };

		return gl;
	}

	// Append webgl to HTMLElement
	SimpleWebGL.prototype.appendTo = function (node)
	{
		if (this.cgl && node instanceof HTMLElement)
			node.appendChild(this.cgl);

		return this;
	}

	// Set viewport of webgl context.
	SimpleWebGL.prototype.setViewport = function (width, height)
	{
		if (this.gl)
			this.gl.viewport(0, 0, width || this.cgl.width, height || this.cgl.height);

		return this;
	}

	// Initialize drawning shaders.
	SimpleWebGL.prototype.setProgram = function (program)
	{
		if (this.gl && typeof program === 'object')
		{
			// Create main drawing program.
			this.program = this.gl.createProgram();

			// Create shaders.
			this.createShader(program.vertex || '', this.gl.VERTEX_SHADER);
			this.createShader(program.fragment || '', this.gl.FRAGMENT_SHADER);

			// Link current program.
			this.gl.linkProgram(this.program);

			if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS))
				console.warn('%s does not link main program', this.name);
			else
			{
				this.gl.useProgram(this.program);

				if (program.vars) 
					this.setShaderVars(program.vars);
			}
		}

		return this;
	}

	// Save variables (attribute or uniform) for use in onDraw.
	SimpleWebGL.prototype.setShaderVars = function (vars)
	{
		if (typeof vars === 'object' && this.gl && this.program)
			for (var i in vars)
				switch (i)
				{
					case 'attribute':
						if (typeof vars[i] === 'object')
							for (var j in vars[i])
								this.vars[vars[i][j]] = this.gl.getAttribLocation(this.program, vars[i][j]);
						else
							this.vars[vars[i]] = this.gl.getAttribLocation(this.program, vars[i]);
						break;

					case 'uniform':
						if (typeof vars[i] === 'object')
							for (var j in vars[i])
								this.vars[vars[i][j]] = this.gl.getUniformLocation(this.program, vars[i][j]);
						else
							this.vars[vars[i]] = this.gl.getUniformLocation(this.program, vars[i]);
						break;
				}

		return this;
	}

	// Create shader from source by type and return it.
	SimpleWebGL.prototype.createShader = function (source, type)
	{
		var shader = null;

		if (this.gl)
		{
			shader = this.gl.createShader(type);
			this.gl.shaderSource(shader, source);
			this.gl.compileShader(shader);

			if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
				console.warn('%s does not compile %s from source: \n%s', this.name, type === this.gl.FRAGMENT_SHADER ? 'FRAGMENT_SHADER' : (type === this.gl.VERTEX_SHADER ? 'VERTEX_SHADER' : ('shader ' + type)), source);
			else if (this.program)
				this.gl.attachShader(this.program, shader);
		}

		return shader;
	}

	// Create'n'bind buffers from arrays.
	SimpleWebGL.prototype.setArrayBuffers = function (buffers)
	{
		for (var i in buffers)
			this.buffers[i] = this.createBuffer(buffers[i], this.gl.ARRAY_BUFFER);

		return this;
	}

	// Create'n'bind element buffers from arrays.
	SimpleWebGL.prototype.setElementsArrayBuffers = function (buffers)
	{
		for (var i in buffers)
			this.buffers[i] = this.createBuffer(buffers[i], this.gl.ELEMENT_ARRAY_BUFFER);

		return this;
	}

	// Returns filled with @bufferData buffer by @type.
	SimpleWebGL.prototype.createBuffer = function (bufferData, type)
	{
		var buffer = null;

		if (this.gl)
		{
			buffer = this.gl.createBuffer();
			this.gl.bindBuffer(type, buffer);
			this.gl.bufferData(type, new Float32Array(bufferData), this.gl.STATIC_DRAW);
			this.gl.bindBuffer(type, null);
		}

		return buffer;
	}

	// Create'n'save textures.
	SimpleWebGL.prototype.setTextures = function (textures)
	{
		if (typeof textures === 'object')
			for (var i in textures)
				this.textures[i] = this.createTexture(textures[i]);

		return this;
	}

	// Create single texture.
	SimpleWebGL.prototype.createTexture = function (sourceTex)
	{
		var tex = null;

		if (this.gl)
		{
			this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

			tex = this.gl.createTexture();
			this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, sourceTex);

		  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		}

		return tex;
	}

	// Main drawning loop.
	SimpleWebGL.prototype.drawLoop = function (fps)
	{
		if (typeof fps === 'number' && fps > 0)
		{
			this.drawStop();
			this.fps = fps;
		}

		if (this.gl)
		{
			// Drawning loop.
			(function (t) {
				t.timeoutId = setTimeout(function () {
					t.drawLoop.call(t);
				}, 1000 / t.fps);
			} (this));

			this.draw();
		}

		return this;
	}

	// Clear'n'draw scene.
	SimpleWebGL.prototype.draw = function ()
	{
		this.clear();
		if (this.onDraw) this.onDraw();
	}

	// Save onDraw advanced function.
	// Function @fun this will be linked with SimpleWebGL object for call on every scene drawning steps.
	SimpleWebGL.prototype.onDraw = function (fun, attr)
	{
		this.onDraw = (function (t, fun, attr) {
			return function () {
				fun.apply(t, attr);
			}
		} (this, fun, attr));

		return this;
	}

	// Stop the drawning loop.
	SimpleWebGL.prototype.drawStop = function ()
	{
		clearTimeout(this.timeoutId);
		return this;
	}

	// Clear the scene.
	SimpleWebGL.prototype.clear = function ()
	{
		// Set transparent background for drawning scene.
		if (this.gl)
		{
			this.gl.clearColor(0, 0, 0, 0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		}

		return this;
	}

	// Save library to global scope.
	var SimpleWebGL_SAVE = W['SimpleWebGL'];
	W['SimpleWebGL'] = SimpleWebGL;

	// Unbind SimpleWebGL tools from global (window) scope and return its.
	SimpleWebGL.prototype.noConflict = function (newName)
	{
		W['SimpleWebGL'] = SimpleWebGL_SAVE;
		
		if (typeof newName === 'string' && newName) 
		{
			W[newName] = SimpleWebGL;
			return this;
		}
		else
			return SimpleWebGL;
	}

} (window));