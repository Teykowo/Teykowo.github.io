// Get the delay that's been set for the shrinking animation. We do this by selecting the HTML element, requesting the animation delay property value, and slicing it to only
// get the first number in seconds (the format is that of a string), we then use parseFloat to convert the string to a float.
var mainBody = document.querySelector('#Main_Body');
var backgroundCover = document.querySelector('#Background_Cover');
var animationDelay = parseFloat(getComputedStyle(mainBody).animationDelay.slice(0, 2));
// Defined how many cubes (including the main one at the start) we want in our scene.
var objectCount = 6;
// Hold the translation vectors of each elements.
var transVList = [[0.0, 0.0, -20.0]];
// Hold the rotation vectors of each elements.
var rotVList = [[0.2, 0.4, 0.3]];
// Hold the life spanned by each object.
var objectTimeAlive = [0.0];
// Hold the maximum life span of the object.
var objectLifeSpan = [animationDelay];
// Define a variable to store the numerical value of the "skip intro" switch.
var skipIntroFloat = 0;
// Init a value to take the time each loop.
var oldTime = 0;
// Define whether to end the animation or not.
var animationEnd = false;

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
    // Get the parameters defined in the parameter file.
    const renderingParams = RENDERING_PARAMS();
    
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
    // Only render what is visible, the obstructed vertices will be culled and thus the triangles that depend on them too.
    glContext.enable(glContext.CULL_FACE);
    glContext.cullFace(glContext.BACK);

    // ---------------------------------- Shaders Source Codes ----------------------------------
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
    // ------------------------------------------------------------------------------------------

    // ------------------------------- Shaders Variable Addresses -------------------------------
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
    // Tell the context to use this pipeline.
    glContext.useProgram(pipelineAddresses.pipelineAddress);
    // ------------------------------------------------------------------------------------------

    // ------------------------------------ -Data Generation ------------------------------------
    // For now we write in hard each vertex and their colours, we should be able to load .obj files.
    var cubeObj = cube();
    // Vertex coordinates.
    const vertexData = cubeObj[0];
    // The colour matrix has one column for each value in the RGBA format
    const vertexColoursData = cubeObj[1];
    // This array defines the triangles of the object's mesh using the indices pointing to specific vertices in the vertex array.
    const triangleMeshVertexIndices = cubeObj[2];
    // ------------------------------------------------------------------------------------------

    // -------------------------------- Buffering Generated Data --------------------------------
    // Generate a buffer and feed it the data so that we can render it.
    vertexBuffer = buffering(glContext, vertexData, "ARRAY_BUFFER", "Float32Array");
    colourBuffer = buffering(glContext, vertexColoursData, "ARRAY_BUFFER", "Float32Array");
    meshVertexIndicesBuffer = buffering(glContext, triangleMeshVertexIndices, "ELEMENT_ARRAY_BUFFER", "Uint16Array")
    bufferLibrary = {"vertexBuffer": vertexBuffer, "colourBuffer": colourBuffer, "meshVertexIndicesBuffer": meshVertexIndicesBuffer};

    // ------------------------------------- Buffer reading -------------------------------------
    // Tell the context how the vertex shader should read from the vertex buffer.
    {
        glContext.bindBuffer(glContext.ARRAY_BUFFER, bufferLibrary.vertexBuffer);
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
        glContext.bindBuffer(glContext.ARRAY_BUFFER, bufferLibrary.colourBuffer);
        glContext.vertexAttribPointer(pipelineAddresses.vertexColourAddress, 
                                      renderingParams.vc.vc_valuesPerIter, 
                                      renderingParams.vc.vc_bufferDataType, 
                                      renderingParams.vc.vc_normalize, 
                                      renderingParams.vc.vc_stride, 
                                      renderingParams.vc.vc_offset);
        // Attributes need to be enabled to work.
        glContext.enableVertexAttribArray(pipelineAddresses.vertexColourAddress);
        }
        // Bind the element buffer that will be read in the drawElements function to render triangles based on vertex indices.
        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, bufferLibrary.meshVertexIndicesBuffer);
        // ------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------

    // ---------------------------------------- -Options ----------------------------------------
    var introSkipSwitch = document.getElementById('IntroSkipValue');

    try{
        introSkipStoredValue = JSON.parse(localStorage.getItem("introSkipStoredValue"));
        introSkipSwitch.checked = introSkipStoredValue;
    } catch(error){
        // Do nothing, it just means the user is going on this page for the first time.
    }
    // ------------------------------------------------------------------------------------------

    // ------------------------------------ -Event Listeners ------------------------------------
    let animatedElements = document.querySelectorAll('.animated');
    window.addEventListener('resize', resizeCanvas);
    skipIntro();
    introSkipSwitch.addEventListener('change', skipIntro);
    function skipIntro() {
        if (introSkipSwitch.checked){
            localStorage.setItem("introSkipStoredValue", introSkipSwitch.checked);
            if (animationDelay > oldTime){
                animationDelay = oldTime;
                animationEnd = true;

                animatedElements.forEach((element) => {
                    element.style.animationDelay = '0s, 0s'
                    element.style.animationDuration = '0s, 0s'
                });
            }
        }else{
            localStorage.setItem("introSkipStoredValue", introSkipSwitch.checked);
        }
    }
    // ------------------------------------------------------------------------------------------

    // ------------------------------------- Rendering Loop -------------------------------------
    // Render the scene repeatedly using a recurcive function.
    function renderingLoop(timeSinceStart) {
        // timeSinceStart is first gathered using requestAnimationFrame wich gave us the time in ms since the document's time origin.
        // Multiplying this value changes the speed of animation transformations, meaning the next frame will have the figure move more or less.
        timeSinceStart *= 0.001; // From ms to s.

        // Get the time since last frame.
        const deltaTime = timeSinceStart - oldTime;
        // And set the old time variable to current time.
        oldTime = timeSinceStart;

        // Call the draw function.
        draw(glContext, pipelineAddresses, bufferLibrary, deltaTime, timeSinceStart, renderingParams);
    
        // Make the function call recursive by recalling the renderingLoop function through requestAnimationFrame.
        requestAnimationFrame(renderingLoop);
    }
    // This native function takes another function as argument and call it, passing time since time origin as argument to it. requestAnimationFrame is useful as it usually
    // syncs call frequency with the display refresh rate, it also stops running when the user changes tab or if the animation is running in the background of something else.
    requestAnimationFrame(renderingLoop);
    // ------------------------------------------------------------------------------------------
}
// ------------------------------------------------------------------------------------------------------------------



// ------------------------------------------------ Scenes rendering ------------------------------------------------
function draw(glContext, pipelineAddresses, buffers, deltaTime, timeSinceStart, renderingParams){
    // -------------------- The perspective matrix is shared for all objects --------------------
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
    // ------------------------------------------------------------------------------------------

    // Set the shader projection uniforms, since it's used for all objects.
    glContext.uniformMatrix4fv(pipelineAddresses.ProjectionMatrixAddress, false, projectionMatrix);
    
    // Optional block (if removed, increase base block number)
    switch(true){
        case (timeSinceStart%0.3 < timeSinceStart*0.05 && timeSinceStart < animationDelay):
            var translateVector = [randInterval(-35., 35.), randInterval(-25., 25.), randInterval(-40., -22.)];
            var rotationVector = [randInterval(0.1, 0.5), randInterval(0.1, 0.5), randInterval(0.1, 0.5)];
            objectTimeAlive.push(0.0);
            objectLifeSpan.push(randInterval(30.0, 100.0));
            transVList.push(translateVector);
            rotVList.push(rotationVector);
            break;

        default:
            // Refurbish the list of objects if needed.
            while (transVList.length < objectCount){
                var translateVector = [randInterval(-25., 25.), randInterval(-15., 15.), randInterval(-40., -22.)];
                var rotationVector = [randInterval(0.1, 0.5), randInterval(0.1, 0.5), randInterval(0.1, 0.5)];
                objectTimeAlive.push(0.0);
                objectLifeSpan.push(randInterval(30.0, 100.0));
                transVList.push(translateVector);
                rotVList.push(rotationVector);
            };
            break;
    }

    if(timeSinceStart > animationDelay && timeSinceStart < (animationDelay + 0.01)){
        animationEnd = true;
    }
    
    for (i = 0; i < transVList.length; i++){
        var sumPosition = 0;
        switch(true){
            case (timeSinceStart < animationDelay && i === 0):
                sumPosition = 2;
                transVList[i] = [0, 0, Math.min((-20+((timeSinceStart**4)*0.01)), 0)];
                break;
            case (timeSinceStart < animationDelay && i != 0):
                sumPosition = transVList[i].slice(0, 2).reduce((a, b) => Math.abs(a) + Math.abs(b));
                transVList[i] = [transVList[i][0]/(1 + timeSinceStart * 0.01), transVList[i][1]/(1 + timeSinceStart * 0.01), transVList[i][2]];
                break;
            case (animationEnd):
                objectCount = 80;
                objectLifeSpan[i] = 0;
                break
            default:
                sumPosition = transVList[i].reduce((a, b) => Math.abs(a) + Math.abs(b));
                break;
        }

        objectWiseRendering(transVList[i], objectTimeAlive[i], rotVList[i], pipelineAddresses, renderingParams);

        if (sumPosition < 1 || objectTimeAlive[i] > objectLifeSpan[i]){
            transVList.splice(i, 1);
            objectLifeSpan.splice(i, 1);
            rotVList.splice(i,1);
            objectTimeAlive.splice(i, 1);
        }

        objectTimeAlive[i] += deltaTime;
    }
    animationEnd = false;
}
// ------------------------------------------------------------------------------------------------------------------