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