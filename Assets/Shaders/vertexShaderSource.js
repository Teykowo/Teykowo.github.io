function vertexShaderSource(){
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
    return vertexShaderSourceCode;
}
