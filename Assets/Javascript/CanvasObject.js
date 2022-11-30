class Canvas {
    constructor(Selector) {
        // We get the canvas element from our html, it's used to draw on using webGL.
        let HTMLCanvas = document.querySelector(Selector);
        // Canvas element have a webGL context, the same as the one we have to create when programming with openGL. We have to get this context to use the canvas as GL contexts
        // hold all the fonction used to comunicate with the GPU.
        this.glContext = HTMLCanvas.getContext('webgl');
        // Get the parameters defined in the parameter file.
        this.renderingParams = RENDERING_PARAMS(this.glContext);

        // We have to take into account the possibility of an error when fetching the webGL context. send an alert if the gl variable is null.
        if (!this.glContext) {
            // Reasons for an error would most probably be due to it being unsuported by the current browser, the error should warn about this.
            alert('Unable to load webGL context for graphics. It might be that your browser or hardware does not support this feature.');
        }

        // Ensure that the clear depth is set to its default value of 1 (clear everything).
        this.glContext.clearDepth(1);
        // Enable depth tests for rendering fragments in front of others, given their depth values.
        this.glContext.enable(this.glContext.DEPTH_TEST);
        // Depth function is defined to LEQUAL (less or equal depth value will pass in front) to avoid z-fighting.
        this.glContext.depthFunc(this.glContext.LEQUAL);
        // Only render what is visible, the obstructed vertices will be culled and thus the triangles that depend on them too.
        this.glContext.enable(this.glContext.CULL_FACE);
        this.glContext.cullFace(this.glContext.BACK);

        // Var setup.
        this.rotationSpeed = 10;
        this.pipelineAddresses = null;
        this.bufferLibrary = null;
    }  

    setup(R,G,B,A,V, ObjectLoader, width = this.glContext.canvas.clientWidth, height = this.glContext.canvas.clientHeight) {
        // Define the colour that will be used when erasing. Luminosity is defined as ''how close to 1''.
        this.setClearColour(R,G,B,A,V);
        this.SetShaders();
        this.setObject(ObjectLoader);
        // Resize the canvas to fit in the screen's resolution.
        this.resizeCanvas(width,height);
    }

    setClearColour(R, G, B, A, V){
        // V value of HSV
        this.glContext.clearColor(R*V, G*V, B*V, A);
    }

    SetShaders() {
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
        let vertexShaderSourceCode = vertexShaderSource();
        let fragmentShaderSourceCode = fragmentShaderSource();

        // Create a shader pipeline using our custom functions.
        let shaderPipeline = this.initShadersPipeline(vertexShaderSourceCode, fragmentShaderSourceCode);

        // WebGL assigns specific memory locations for shaders buffers, which are used for shaders to read and get their inputs from.
        // The doc motivates storing them together in a dictionary. 
        this.pipelineAddresses = {
            "pipelineAddress": shaderPipeline,
            "vertexPositionAddress": this.glContext.getAttribLocation(shaderPipeline, 'aVertexPosition'),
            "vertexColourAddress": this.glContext.getAttribLocation(shaderPipeline, 'aVertexColour'),
            "ModelxViewMatrixAddress": this.glContext.getUniformLocation(shaderPipeline, 'uModelxViewMatrix'),
            "ProjectionMatrixAddress": this.glContext.getUniformLocation(shaderPipeline, 'uProjectionMatrix'),
        };

        // Tell the context to use this pipeline.
        this.glContext.useProgram(this.pipelineAddresses.pipelineAddress);
    }

    resizeCanvas(width = this.glContext.canvas.clientWidth, height = this.glContext.canvas.clientHeight){
        devicePixelRatio = window.devicePixelRatio;
    
        this.glContext.canvas.width = (width * devicePixelRatio);
        this.glContext.canvas.height = (height * devicePixelRatio);
        this.glContext.viewport(0, 0, this.glContext.canvas.width, this.glContext.canvas.height);
    }

    loadShader(shaderType, shaderSourceCode){
        // Initialise a shader object of the specified type (vertex, fragment, tessellation, etc...).
        const shader = this.glContext.createShader(shaderType);
        // Add the source code to the GL shader object.
        this.glContext.shaderSource(shader, shaderSourceCode);
        // Compile the shader's code.
        this.glContext.compileShader(shader)
    
        // Check if the shader was successfully compiled.
        if (!this.glContext.getShaderParameter(shader, this.glContext.COMPILE_STATUS)){
            alert('Unable to compile shader: ' + this.glContext.getShaderInfoLog(shader));
            // Delete the shader object.
            this.glContext.deleteShader(shader);
            return null;
        }
        return shader;
    }
    initShadersPipeline(vertexShaderSourceCode, fragmentShaderSourceCode) {
        // Load the compiled shaders.
        const vertexShader = this.loadShader(this.glContext.VERTEX_SHADER, vertexShaderSourceCode);
        const fragmentShader = this.loadShader(this.glContext.FRAGMENT_SHADER, fragmentShaderSourceCode);

        // Create the shader pipeline.
        const shaderPipeline = this.glContext.createProgram();
        // Add the shaders to the pipeline.
        this.glContext.attachShader(shaderPipeline, vertexShader);
        this.glContext.attachShader(shaderPipeline, fragmentShader);
        // Link the pipeline to the context.
        this.glContext.linkProgram(shaderPipeline);

        // Check if the shaders pipeline was sucessfully created and linked.
        if (!this.glContext.getProgramParameter(shaderPipeline, this.glContext.LINK_STATUS)){
            alert('Unable to configure shaders: ' + this.glContext.getProgramInfoLog(shaderPipeline));
            return null;
        }

        // Return the pipeline.
        return shaderPipeline;
    }

    setObject(objectLoader) {
        let object = eval(objectLoader);
        // Vertex coordinates.
        const vertexData = object[0];
        // The colour matrix has one column for each value in the RGBA format
        const vertexColoursData = object[1];
        // This array defines the triangles of the object's mesh using the indices pointing to specific vertices in the vertex array.
        const triangleMeshVertexIndices = object[2];

        // Generate a buffer and feed it the data so that we can render it.
        let vertexBuffer = this.buffering(vertexData, "ARRAY_BUFFER", "Float32Array");
        let colourBuffer = this.buffering(vertexColoursData, "ARRAY_BUFFER", "Float32Array");
        let meshVertexIndicesBuffer = this.buffering(triangleMeshVertexIndices, "ELEMENT_ARRAY_BUFFER", "Uint16Array")
        this.bufferLibrary = {"vertexBuffer": vertexBuffer, "colourBuffer": colourBuffer, "meshVertexIndicesBuffer": meshVertexIndicesBuffer};
    
        // Tell the context how the vertex shader should read from the vertex buffer.
        {
            this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.bufferLibrary.vertexBuffer);
            this.glContext.vertexAttribPointer(this.pipelineAddresses.vertexPositionAddress, 
                                        this.renderingParams.vv.vv_valuesPerIter, 
                                        this.renderingParams.vv.vv_bufferDataType, 
                                        this.renderingParams.vv.vv_normalize, 
                                        this.renderingParams.vv.vv_stride, 
                                        this.renderingParams.vv.vv_offset);
            // Attributes need to be enabled to work.
            this.glContext.enableVertexAttribArray(this.pipelineAddresses.vertexPositionAddress);
            }
            // Tell the context how the vertex shaders should read from the colour buffer.
            {
            this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.bufferLibrary.colourBuffer);
            this.glContext.vertexAttribPointer(this.pipelineAddresses.vertexColourAddress, 
                                        this.renderingParams.vc.vc_valuesPerIter, 
                                        this.renderingParams.vc.vc_bufferDataType, 
                                        this.renderingParams.vc.vc_normalize, 
                                        this.renderingParams.vc.vc_stride, 
                                        this.renderingParams.vc.vc_offset);
            // Attributes need to be enabled to work.
            this.glContext.enableVertexAttribArray(this.pipelineAddresses.vertexColourAddress);
            }
            // Bind the element buffer that will be read in the drawElements function to render triangles based on vertex indices.
            this.glContext.bindBuffer(this.glContext.ELEMENT_ARRAY_BUFFER, this.bufferLibrary.meshVertexIndicesBuffer);
    }

    buffering(data, bufferType, dataType) {
        // Create a buffer object instance for holding vertices coordinates.
        const bufferObject = this.glContext.createBuffer();
        // Bind the buffer to the context.
        if (bufferType === "ELEMENT_ARRAY_BUFFER"){
            this.glContext.bindBuffer(this.glContext.ELEMENT_ARRAY_BUFFER, bufferObject);
        } else {
            this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, bufferObject);
        };

        // Fill the buffer with a float 32 array convertion of the vertex list. STATIC_DRAW is used to indicate that the content is to be writen once and used multiple times.
        if (bufferType === "ELEMENT_ARRAY_BUFFER" & dataType === "Uint16Array"){
            this.glContext.bufferData(this.glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this.glContext.STATIC_DRAW);
        } else {
            this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Float32Array(data), this.glContext.STATIC_DRAW);
        };

        return bufferObject;
    }

    objectWiseRendering(translationVector, objectTimeAlive, rotationVector){
        // For now we will draw in the center of the canvas, which means a simple identity matrix for the modelxview matrix.
        const modelxViewMatrix = mat4.create();
    
        // We need to move the object to where it's rendered depth-wise. As for all the mat4 functions, the first argument is the receiving matrix.
        mat4.translate(modelxViewMatrix, modelxViewMatrix, translationVector);
        // We animate our shape with these self explanatory functions. Here rotation increses the objects angle by how much time has passed.
        mat4.rotate(modelxViewMatrix, modelxViewMatrix, objectTimeAlive/this.rotationSpeed, rotationVector);
    
        // Set the shader ModelxView uniforms, since it depends on the object's.
        this.glContext.uniformMatrix4fv(this.pipelineAddresses.ModelxViewMatrixAddress, false, modelxViewMatrix);
    
        {
            // Draw the shape contained in the buffer. 
            // TRIANGLE_STRIP means the triangles in the mesh share vertices, TRIANGLES mean the triangles are made of the specified, sometimes shared vertices.
            this.glContext.drawElements(this.glContext.TRIANGLES, 
                                    this.renderingParams.draw.draw_vertexCount, 
                                    this.renderingParams.draw.draw_type, 
                                    this.renderingParams.draw.draw_offset);
        }
    }
}