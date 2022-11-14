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