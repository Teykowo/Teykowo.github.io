function fragmentShaderSource(){
    const fragmentShaderSourceCode = `
        // Fetch the varying colour vector.
        varying lowp vec4 vColour;
        
        void main(){
            // Store the pixel colour.
            gl_FragColor  = vColour;
        }
    `;
    return fragmentShaderSourceCode
}