function objectWiseRendering(translationVector, objectTimeAlive, rotationVector, transformationScalars, pipelineAddresses, renderingParams){
    // For now we will draw in the center of the canvas, which means a simple identity matrix for the modelxview matrix.
    const modelxViewMatrix = mat4.create();

    translationVector = [translationVector[0]/transformationScalars[0], 
                         translationVector[1]/transformationScalars[1], 
                         translationVector[2]/transformationScalars[2]];

    // We need to move the object to where it's rendered depth-wise. As for all the mat4 functions, the first argument is the receiving matrix.
    mat4.translate(modelxViewMatrix, modelxViewMatrix, translationVector);
    // We animate our shape with these self explanatory functions. Here rotation increses the objects angle by how much time has passed.
    mat4.rotate(modelxViewMatrix, modelxViewMatrix, objectTimeAlive/5, rotationVector);

    // Set the shader ModelxView uniforms, since it depends on the object's.
    glContext.uniformMatrix4fv(pipelineAddresses.ModelxViewMatrixAddress, false, modelxViewMatrix);

    {
        // Draw the shape contained in the buffer. 
        // TRIANGLE_STRIP means the triangles in the mesh share vertices, TRIANGLES mean the triangles are made of the specified, sometimes shared vertices.
        glContext.drawElements(glContext.TRIANGLES, 
                                renderingParams.draw.draw_vertexCount, 
                                renderingParams.draw.draw_type, 
                                renderingParams.draw.draw_offset);
    }

    return translationVector;
}