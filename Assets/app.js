// Define the animation variables here.
var rotation = 0.0;
// Javascript doesn't read from top to bottom like python does, so we can make the function call now and define it later.
main();

// ------------------------------------------------- -Main Function -------------------------------------------------
// We now define the main function which is called when the script is read.
function main(){
    // We get the canvas element from our html, it's used to draw on using webGL.
    const canvas = document.querySelector('#Background_Spawner');
    // Canvas element have a webGL context, the same as the one we have to create when programming with openGL. We have to get this context to use the canvas as GL contexts
    // hold all the fonction used to comunicate with the GPU.
    const glContext = canvas.getContext('webgl');

    // We have to take into account the possibility of an error when fetching the webGL context. send an alert if the gl variable is null.
    if (!glContext) {
        // Reasons for an error would most probably be due to it being unsuported by the current browser, the error should warn about this.
        alert('Unable to load webGL context for graphics. It might be that your browser or hardware does not support this feature.');
        // Return now, aborting the rest of the procedure and saving what we can of the website.
        return;
    }
    
    // Define the colour that will be used when erasing, in our case and to allow better control over every element, the background is defined in the body,
    // Thus we can erase content using a rgba colour with alpha = 0. It'll allow us to see the background by having a transparent forground, thankfully, a child element's
    // background colour isn't limited to it's parent's transparancy, so we can have a visible canvas with an invisible parent section.
    glContext.clearColor(0., 0., 0., 0.);
    // Ensure that the clear depth is set to its default value of 1 (clear everything).
    glContext.clearDepth(1);
    // Enable depth tests for rendering fragments in front of others, given their depth values.
    glContext.enable(glContext.DEPTH_TEST);
    // Depth function is defined to LEQUAL (less or equal depth value will pass in front) to avoid z-fighting.
    glContext.depthFunc(glContext.LEQUAL);

    // ---------------------------------------------- Shaders Source Codes ----------------------------------------------
    // To generate graphics we need shaders. Write the source code of each shader, vertex shaders take care of the vertices and generating the texel, 
    // while the fragment Shaders colour the pixels.
    // webGL uses special variable qualifiers for shader functions (variable names start with their qualifier's first letter for clarity), here are their definitions:
    // const – The declaration is of a compile time constant.
    // attribute – Global variables that may change per vertex, that are passed from the OpenGL application to vertex shaders. 
    // This qualifier can only be used in vertex shaders. For the shader this is a read-only variable. See Attribute section.
    // uniform – Global variables that may change per primitive [...], that are passed from the OpenGL application to the shaders. 
    // This qualifier can be used in both vertex and fragment shaders. For the shaders this is a read-only variable. See Uniform section.
    // varying – used for interpolated data between a vertex shader and a fragment shader. Available for writing in the vertex shader, 
    // and read-only in a fragment shader. See Varying section.

    const vertexShaderSourceCode = `
        // This variable represents the 3D coordinates for each vertex, with a fourth one used in matrix multiplications like translations, and that's used to represent how far
        // the object is from the camera. This last w value often equals one.
        attribute vec4 aVertexPosition;  
        // Do the same for storing colours of the vertex in rgba format;
        attribute vec4 aVertexColour;

        // This transformation matrix is both the transform from local space to world space, meaning a translation, scale and/or rotation
        // to fit in the world with other objects, and from world space to view space, meaning a change in coordinates to align objects with the camera (translation and rotation).
        uniform mat4 uModelxViewMatrix;

        // The projection matrix is a two step process too, first projection, transformation to clip space, where vertices outside of the specified frustum get clipped.
        // Second is the perspective division where vertices get squished relative to their distance via division by the w component, thus it doesn't apply if it equals one.
        uniform mat4 uProjectionMatrix;

        // This varying variable is used to share data from a vertex shader to a fragment shader, and it must be written in the vertex shader. 
        // After rasterizing, the values are used by the fragment shader to interpolate the colour of the fragment using the vertices that composes it.
        varying lowp vec4 vColour;

        void main() {
            // Apply all transformations to the vertex and store the result. 
            //shader output variable names are imposed by openGL so that it can be accessed and passed to other processes.
            gl_Position  = uProjectionMatrix * uModelxViewMatrix * aVertexPosition;
            // Set the varying colour vector that will be used by the fragment shader as the vertex colour vector passed as input to the vertex shader.
            vColour = aVertexColour;
        }
    `;

    const fragmentShaderSourceCode = `
        // Fetch the varying colour vector.
        varying lowp vec4 vColour;
        
        void main(){
            // Store the pixel colour.
            gl_FragColor  = vColour;
        }
    `;
    // ------------------------------------------------------------------------------------------------------------------

    // Create a shader pipeline using our custom functions.
    const shaderPipeline = initShadersPipeline(glContext, vertexShaderSourceCode, fragmentShaderSourceCode)

    // WebGL assigns specific memory locations for shaders buffers, which are used for shaders to read and get their inputs from.
    // The doc motivates storing them together in a dictionary. 
    const pipelineAddresses = {
        "pipelineAddress": shaderPipeline,
        "vertexPositionAddress": glContext.getAttribLocation(shaderPipeline, 'aVertexPosition'),
        "vertexColourAddress": glContext.getAttribLocation(shaderPipeline, 'aVertexColour'),
        "ModelxViewMatrixAddress": glContext.getUniformLocation(shaderPipeline, 'uModelxViewMatrix'),
        "ProjectionMatrixAddress": glContext.getUniformLocation(shaderPipeline, 'uProjectionMatrix'),
    };

    // ------------------------------------------------ -Data Generation ------------------------------------------------
    // For now we write in hard each vertex and their colours, we should be able to load .obj files.
    const vertexData = [
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,

        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,

        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    // The colour matrix has one column for each value in the RGBA format. The only caveat is that it has to be between 0 and 1 to work properly.
    const facesColours = [
        [0., 0., 0., 0.],
    ];
    // We make and fill an array with the colour of the faces for each of this face's vertex (since colours are per vertex).
    var vertexColoursData = [];
    for (var i = 0; i < facesColours.length; i++) {
        const vertexColour = facesColours[i];
        // Repeat each color four times for the four vertices of the face
        vertexColoursData = vertexColoursData.concat(vertexColour, vertexColour, vertexColour, vertexColour);
    }

    // This array defines the triangles of the object's mesh using the indices pointing to specific vertices in the vertex array.
    const triangleMeshVertexIndices = [
        0,  1,  2,      0,  2,  3, 
        4,  5,  6,      4,  6,  7, 
        8,  9,  10,     8,  10, 11,
        12, 13, 14,     12, 14, 15,
        16, 17, 18,     16, 18, 19,
        20, 21, 22,     20, 22, 23,
    ];
    
    
    // ------------------------------------------------------------------------------------------------------------------
    // Generate a buffer and feed it the data so that we can render it.
    vertexBuffer = buffering(glContext, vertexData, "ARRAY_BUFFER", "Float32Array");
    colourBuffer = buffering(glContext, vertexColoursData, "ARRAY_BUFFER", "Float32Array");
    meshVertexIndicesBuffer = buffering(glContext, triangleMeshVertexIndices, "ELEMENT_ARRAY_BUFFER", "Uint16Array")
    bufferLibrary = {"vertexBuffer": vertexBuffer, "colourBuffer": colourBuffer, "meshVertexIndicesBuffer": meshVertexIndicesBuffer};


    // Render the scene repeatedly using a recurcive function.
    var oldTime = 0;
    function renderingLoop(currentTime) {
        // currentTime is first gathered using requestAnimationFrame wich gave us the time in ms since time origin.
        // Multiplying this value changes the speed of animation transformations, meaning the next frame will have the figure move more or less.
        currentTime *= 0.0001;
        // Get the time since last frame.
        const deltaTime = currentTime - oldTime;
        // And set the old time variable to current time.
        oldTime = currentTime;
        
        // Call the draw function.
        draw(glContext, pipelineAddresses, bufferLibrary, deltaTime, currentTime);
    
        // Make the function call recursive by recalling the renderingLoop function through requestAnimationFrame.
        requestAnimationFrame(renderingLoop);
    }
    // This native function takes another function as argument and call it, passing time since time origin as argument to it. requestAnimationFrame is useful as it usually
    // syncs call frequency with the display refresh rate, it also stops running when the user changes tab or if the animation is running in the background of something else.
    requestAnimationFrame(renderingLoop);
}
// ------------------------------------------------------------------------------------------------------------------

// --------------------------------------------- -Shaders context setup ---------------------------------------------
// Create a function that will compile the shaders' GLSL source code to use them in a shader pipeline.
function loadShader(glContext, shaderType, shaderSourceCode){
    // Initialise a shader object of the specified type (vertex, fragment, tessellation, etc...).
    const shader = glContext.createShader(shaderType);
    // Add the source code to the GL shader object.
    glContext.shaderSource(shader, shaderSourceCode);
    // Compile the shader's code.
    glContext.compileShader(shader)

    // Check if the shader was successfully compiled.
    if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)){
        alert('Unable to compile shader: ' + glContext.getShaderInfoLog(shader));
        // Delete the shader object.
        glContext.deleteShader(shader);
        return null;
    }
    return shader;
}

// The shaders must be assembled together to construct a shader pipeline, that will end up writing to the screen through the framebuffer. This functions creates the pipeline
// and links it to the GL context.
function initShadersPipeline(glContext, vertexShaderSourceCode, fragmentShaderSourceCode) {
    // Load the compiled shaders.
    const vertexShader = loadShader(glContext, glContext.VERTEX_SHADER, vertexShaderSourceCode);
    const fragmentShader = loadShader(glContext, glContext.FRAGMENT_SHADER, fragmentShaderSourceCode);

    // Create the shader pipeline.
    const shaderPipeline = glContext.createProgram();
    // Add the shaders to the pipeline.
    glContext.attachShader(shaderPipeline, vertexShader);
    glContext.attachShader(shaderPipeline, fragmentShader);
    // Link the pipeline to the context.
    glContext.linkProgram(shaderPipeline);

    // Check if the shaders pipeline was sucessfully created and linked.
    if (!glContext.getProgramParameter(shaderPipeline, glContext.LINK_STATUS)){
        alert('Unable to configure shaders: ' + glContext.getProgramInfoLog(shaderPipeline));
        return null;
    }

    // Return the pipeline.
    return shaderPipeline;
}
// ------------------------------------------------------------------------------------------------------------------

// ----------------------------------------------- Buffering Function -----------------------------------------------
function buffering(glContext, data, bufferType, dataType){
    // Create a buffer object instance for holding vertices coordinates.
    const bufferObject = glContext.createBuffer();
    // Bind the buffer to the context.
    if (bufferType === "ELEMENT_ARRAY_BUFFER"){
        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, bufferObject);
    } else {
        glContext.bindBuffer(glContext.ARRAY_BUFFER, bufferObject);
    };

    // Fill the buffer with a float 32 array convertion of the vertex list. STATIC_DRAW is used to indicate that the content is to be writen once and used multiple times.
    if (bufferType === "ELEMENT_ARRAY_BUFFER" & dataType === "Uint16Array"){
        glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), glContext.STATIC_DRAW);
    } else {
        glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(data), glContext.STATIC_DRAW);
    };

    return bufferObject;
}
// ------------------------------------------------------------------------------------------------------------------

// ------------------------------------------------ Scenes rendering ------------------------------------------------
function draw(glContext, pipelineAddresses, buffers, deltaTime, currentTime){
    // Always start with cleaning the canvas.
    glContext.clear(glContext.COLOR_BUFFER_BIT|glContext.DEPTH_BUFFER_BIT);

    // Create the projection matrix for the vertex shader.
    // Define the fov for distortion, in radians; the aspect ratio of the current screen; the frustum limits and the projection matrix, 
    // which in our case doesn't need to be changed from the identity matrix created by default using mat4's create function.
    const fov = 45 * Math.PI/180; 
    const aspectRatio = glContext.canvas.clientWidth / glContext.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
     
    // glMatrix has a designated function for make perspective transformation matrices efficiently, it will be applied to the matrix given as first argument.
    mat4.perspective(projectionMatrix, fov, aspectRatio, zNear, zFar);

    // For now we will draw in the center of the canvas, which means a simple identity matrix for the modelxview matrix.
    const modelxViewMatrix = mat4.create();
    // We need to move the object to where it's rendered depth-wise. As for all the mat4 functions, the first argument is the receiving matrix.
    mat4.translate(modelxViewMatrix, modelxViewMatrix, [0.0, 0.0, -20.0/(Math.min(10*currentTime**5, 10)+1)]);
    // We animate our shape with these self explanatory functions.
    rotation += deltaTime;
    mat4.rotate(modelxViewMatrix, modelxViewMatrix, rotation, [0.2, 0.4, 0.3]);

    // ------------------------------------- Buffer reading -------------------------------------
    {
    // Tell the context how the vertex shader should read from the vertex buffer.
    const valuesPerIter = 3;
    const bufferDataType = glContext.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    glContext.bindBuffer(glContext.ARRAY_BUFFER, buffers.vertexBuffer);
    glContext.vertexAttribPointer(pipelineAddresses.vertexPositionAddress, valuesPerIter, bufferDataType, normalize, stride, offset);
    // Attributes need to be enabled to work.
    glContext.enableVertexAttribArray(pipelineAddresses.vertexPositionAddress);
    }
    {
    // Tell the context how the vertex shaders should read from the colour buffer.
    const valuesPerIter = 4;
    const bufferDataType = glContext.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    glContext.bindBuffer(glContext.ARRAY_BUFFER, buffers.colourBuffer);
    glContext.vertexAttribPointer(pipelineAddresses.vertexColourAddress, valuesPerIter, bufferDataType, normalize, stride, offset);
    // Attributes need to be enabled to work.
    glContext.enableVertexAttribArray(pipelineAddresses.vertexColourAddress);
    }
    // ------------------------------------------------------------------------------------------

    // Specified which pipeline the context should use.
    glContext.useProgram(pipelineAddresses.pipelineAddress);

    // Set the shader uniforms.
    glContext.uniformMatrix4fv(pipelineAddresses.ProjectionMatrixAddress, false, projectionMatrix);
    glContext.uniformMatrix4fv(pipelineAddresses.ModelxViewMatrixAddress, false, modelxViewMatrix);
    
    glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, buffers.meshVertexIndicesBuffer);
    {
        // Draw the shape contained in the buffer. The drawArrays function need to be given the number of vertices total and from which to start.
        const offset = 0;
        const vertexCount = 36;
        const type = glContext.UNSIGNED_SHORT;
        // TRIANGLE_STRIP means the triangles in the mesh share vertices, TRIANGLES mean the triangles are made of the specified, sometimes shared vertices.
        glContext.drawElements(glContext.TRIANGLES, vertexCount, type, offset);
    }
}
// ------------------------------------------------------------------------------------------------------------------