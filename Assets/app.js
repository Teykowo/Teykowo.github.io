// Define the global variables here.
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
    // Add a variable to the window element and set it's value to the glContext, that way it can be accessed in event listeners.
    window.linkedContext = glContext;

    // We have to take into account the possibility of an error when fetching the webGL context. send an alert if the gl variable is null.
    if (!glContext) {
        // Reasons for an error would most probably be due to it being unsuported by the current browser, the error should warn about this.
        alert('Unable to load webGL context for graphics. It might be that your browser or hardware does not support this feature.');
        // Return now, aborting the rest of the procedure and saving what we can of the website.
        return;
    }
    
    // Resize the canvas to fit in the screen's resolution.
    resizeCanvas();
    // Define the colour that will be used when erasing. Luminosity is defined as ''how close to 1'', hence 
    const value = 1 // V value of HSV
    glContext.clearColor(235/255*value, 236/255*value, 237/255*value, 1);
    // glContext.clearColor(1/14*value, 0, 13/14*value, 1);
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
    const vertexShaderSourceCode = vertexShaderSource();
    const fragmentShaderSourceCode = fragmentShaderSource();
    // ------------------------------------------------------------------------------------------------------------------

    // ------------------------------------------- Shaders Variable Addresses -------------------------------------------
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
    // ------------------------------------------------------------------------------------------------------------------

    // ------------------------------------------------ -Data Generation ------------------------------------------------
    // For now we write in hard each vertex and their colours, we should be able to load .obj files.
    var cubeObj = cube();
    // Vertex coordinates.
    const vertexData = cubeObj[0];
    // The colour matrix has one column for each value in the RGBA format
    const vertexColoursData = cubeObj[1];
    // This array defines the triangles of the object's mesh using the indices pointing to specific vertices in the vertex array.
    const triangleMeshVertexIndices = cubeObj[2];
    // ------------------------------------------------------------------------------------------------------------------

    // -------------------------------------------- Buffering Generated Data --------------------------------------------
    // Generate a buffer and feed it the data so that we can render it.
    vertexBuffer = buffering(glContext, vertexData, "ARRAY_BUFFER", "Float32Array");
    colourBuffer = buffering(glContext, vertexColoursData, "ARRAY_BUFFER", "Float32Array");
    meshVertexIndicesBuffer = buffering(glContext, triangleMeshVertexIndices, "ELEMENT_ARRAY_BUFFER", "Uint16Array")
    bufferLibrary = {"vertexBuffer": vertexBuffer, "colourBuffer": colourBuffer, "meshVertexIndicesBuffer": meshVertexIndicesBuffer};
    // ------------------------------------------------------------------------------------------------------------------

    // ------------------------------------------------ -Event Listeners ------------------------------------------------
    window.addEventListener('resize', resizeCanvas);
    // ------------------------------------------------------------------------------------------------------------------

    // ------------------------------------------------- Rendering Loop -------------------------------------------------
    // Get the parameters defined in the parameter file.
    const renderingParams = RENDERING_PARAMS();
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
        draw(glContext, pipelineAddresses, bufferLibrary, deltaTime, currentTime, renderingParams);
    
        // Make the function call recursive by recalling the renderingLoop function through requestAnimationFrame.
        requestAnimationFrame(renderingLoop);
    }
    // This native function takes another function as argument and call it, passing time since time origin as argument to it. requestAnimationFrame is useful as it usually
    // syncs call frequency with the display refresh rate, it also stops running when the user changes tab or if the animation is running in the background of something else.
    requestAnimationFrame(renderingLoop);
    // ------------------------------------------------------------------------------------------------------------------
}
// ------------------------------------------------------------------------------------------------------------------

// ------------------------------------------------ Scenes rendering ------------------------------------------------
function draw(glContext, pipelineAddresses, buffers, deltaTime, currentTime, renderingParams){
    // Always start with cleaning the canvas.
    glContext.clear(glContext.COLOR_BUFFER_BIT|glContext.DEPTH_BUFFER_BIT);
    
    // Create the projection matrix for the vertex shader.
    const projectionMatrix = mat4.create();
    // Get the aspect ratio of the current screen.
    const aspectRatio = glContext.canvas.clientWidth / glContext.canvas.clientHeight;
    // glMatrix has a designated function for make perspective transformation matrices efficiently, it will be applied to the matrix given as first argument.
    mat4.perspective(projectionMatrix, 
                     renderingParams.projection.projec_fov, 
                     aspectRatio, 
                     renderingParams.projection.projec_zNear, 
                     renderingParams.projection.projec_zFar);

    // For now we will draw in the center of the canvas, which means a simple identity matrix for the modelxview matrix.
    const modelxViewMatrix = mat4.create();
    // We need to move the object to where it's rendered depth-wise. As for all the mat4 functions, the first argument is the receiving matrix.
    mat4.translate(modelxViewMatrix, modelxViewMatrix, [0.0, 0.0, -20.0/(Math.min(10*currentTime**5, 5)+1)]);
    // We animate our shape with these self explanatory functions.
    rotation += deltaTime;
    mat4.rotate(modelxViewMatrix, modelxViewMatrix, rotation, [0.2, 0.4, 0.3]);

    // ------------------------------------- Buffer reading -------------------------------------
    // Tell the context how the vertex shader should read from the vertex buffer.
    {
    glContext.bindBuffer(glContext.ARRAY_BUFFER, buffers.vertexBuffer);
    glContext.vertexAttribPointer(pipelineAddresses.vertexPositionAddress, 
                                  renderingParams.vv.vv_valuesPerIter, 
                                  renderingParams.vv.vv_bufferDataType, 
                                  renderingParams.vv.vv_normalize, 
                                  renderingParams.vv.vv_stride, 
                                  renderingParams.vv.vv_offset);
    // Attributes need to be enabled to work.
    glContext.enableVertexAttribArray(pipelineAddresses.vertexPositionAddress);
    }
    // Tell the context how the vertex shaders should read from the colour buffer.
    {
    glContext.bindBuffer(glContext.ARRAY_BUFFER, buffers.colourBuffer);
    glContext.vertexAttribPointer(pipelineAddresses.vertexColourAddress, 
                                  renderingParams.vc.vc_valuesPerIter, 
                                  renderingParams.vc.vc_bufferDataType, 
                                  renderingParams.vc.vc_normalize, 
                                  renderingParams.vc.vc_stride, 
                                  renderingParams.vc.vc_offset);
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
        // Draw the shape contained in the buffer. 
        // TRIANGLE_STRIP means the triangles in the mesh share vertices, TRIANGLES mean the triangles are made of the specified, sometimes shared vertices.
        glContext.drawElements(glContext.TRIANGLES, 
                               renderingParams.draw.draw_vertexCount, 
                               renderingParams.draw.draw_type, 
                               renderingParams.draw.draw_offset);

    }
}
// ------------------------------------------------------------------------------------------------------------------