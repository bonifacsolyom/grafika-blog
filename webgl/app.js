var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = vec4(vertPosition, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');

//"The varying qualifier is equivalent to the input of a fragment shader or the output of a vertex shader"

var initDemo = function () {
    var canvas = $("#render-surface").get(0); //get(0) hogy ne jquery object legyen
    var gl = canvas.getContext("webgl");

    //néhány régebbi browser miatt
    if (!gl) {
            gl = canvas.getContext("experimental-webgl")
    }

    //we're fucked
    if (!gl) {
        alert("Your browser does not support webGL")
    }

    //beállítjuk a colort
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //csinálunk két shadert
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("ERROR compiling vertex shader!", gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error("ERROR compiling fragment shader!", gl.getShaderInfoLog(fragmentShader));
        return;
    }

    //ez kb maga a gpu
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("ERROR linking program!", gl.getProgramInfoLog(program));
        return;
    }

    //ezt állítólag nem kéne használni?
    gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

    //megcsináljuk a buffert
    var triangleVertices = 
    [ //X, Y, Z          R, G, B
        0.0, 0.5, 0.0,   0.0, 1.0, 0.0,
        -0.5, -0.5, 0.0, 0.0, 1.0, 0.0,
        0.5, -0.5, 0.0,  0.0, 1.0, 0.0
    ];

    var triangleVertexBufferObject = gl.createBuffer(); //a gpu-n egy memóriabuffer amit használhatunk
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject); //bindolás
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW); //feltöltjük a buffert a datával

    var positionAttribLocation = gl.getAttribLocation(program, "vertPosition"); //megadja a vertPosition pozícióját, jelen esetben 0 mert ez az első attribút a shaderben
    var colorAttribLocation = gl.getAttribLocation(program, "vertColor");
    gl.vertexAttribPointer(
        positionAttribLocation, //attribute location
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE, //are they normalized
        6 * Float32Array.BYTES_PER_ELEMENT, //mekkora egy vertex mérete a bufferben, 6 * sizeof(float)
        0 //nincs offsettelve
    );

    gl.vertexAttribPointer(
        colorAttribLocation, //attribute location
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE, //are they normalized
        6 * Float32Array.BYTES_PER_ELEMENT, //mekkora egy vertex mérete a bufferben, 6 * sizeof(float)
        3 * Float32Array.BYTES_PER_ELEMENT //nincs offsettelve
    );

    gl.enableVertexAttribArray(positionAttribLocation); //azt mondja hogy most már lehet használni a vertPosition attribútumot a shaderben
    gl.enableVertexAttribArray(colorAttribLocation);

    var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
    var matViewUniformLocation = gl.getUniformLocation(program, "mView");
    var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    mat4.identity(worldMatrix);
    mat4.identity(viewMatrix);
    mat4.identity(projMatrix);

    //maga a render loop
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3); //hény vertexet skippeljünk, és mennyit akarunk kidrawolni
}