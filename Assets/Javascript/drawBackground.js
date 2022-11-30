// ------------------------------------------------ Scenes rendering ------------------------------------------------
function drawBackground(canvas, deltaTime, timeSinceStart){
    // -------------------- The perspective matrix is shared for all objects --------------------
    // Always start with cleaning the canvas.
    canvas.glContext.clear(canvas.glContext.COLOR_BUFFER_BIT|canvas.glContext.DEPTH_BUFFER_BIT);
    
    // Create the projection matrix for the vertex shader.
    const projectionMatrix = mat4.create();
    // Get the aspect ratio of the current screen.
    const aspectRatio = canvas.glContext.canvas.clientWidth / canvas.glContext.canvas.clientHeight;
    // glMatrix has a designated function for make perspective transformation matrices efficiently, it will be applied to the matrix given as first argument.
    mat4.perspective(projectionMatrix, 
                     canvas.renderingParams.projection.projec_fov, 
                     aspectRatio, 
                     canvas.renderingParams.projection.projec_zNear, 
                     canvas.renderingParams.projection.projec_zFar);
    // ------------------------------------------------------------------------------------------

    // Set the shader projection uniforms, since it's used for all objects.
    canvas.glContext.uniformMatrix4fv(canvas.pipelineAddresses.ProjectionMatrixAddress, false, projectionMatrix);
    
    // Optional block (if removed, increase base block number)
    switch(true){
        case (timeSinceStart%0.3 < timeSinceStart*0.05 && timeSinceStart < animationDelay):
            var translateVector = [randInterval(-35., 35.), randInterval(-25., 25.), randInterval(-40., -22.)];
            var rotationVector = [randInterval(0.1, 0.5), randInterval(0.1, 0.5), randInterval(0.1, 0.5)];
            canvas.objectTimeAlive.push(0.0);
            canvas.objectLifeSpan.push(randInterval(30.0, 100.0));
            canvas.transVList.push(translateVector);
            canvas.rotVList.push(rotationVector);
            break;

        default:
            // Refurbish the list of objects if needed.
            while (canvas.transVList.length < canvas.objectCount){
                var translateVector = [randInterval(-25., 25.), randInterval(-15., 15.), randInterval(-40., -22.)];
                var rotationVector = [randInterval(0.1, 0.5), randInterval(0.1, 0.5), randInterval(0.1, 0.5)];
                canvas.objectTimeAlive.push(0.0);
                canvas.objectLifeSpan.push(randInterval(30.0, 100.0));
                canvas.transVList.push(translateVector);
                canvas.rotVList.push(rotationVector);
            };
            break;
    }

    if(timeSinceStart > animationDelay && timeSinceStart < (animationDelay + 0.01)){
        animationEnd = true;
    }
    
    for (i = 0; i < canvas.transVList.length; i++){
        var sumPosition = 0;
        switch(true){
            case (timeSinceStart < animationDelay && i === 0):
                sumPosition = 2;
                canvas.transVList[i] = [0, 0, Math.min((-20+((timeSinceStart**4)*0.01)), 0)];
                break;
            case (timeSinceStart < animationDelay && i != 0):
                sumPosition = canvas.transVList[i].slice(0, 2).reduce((a, b) => Math.abs(a) + Math.abs(b));
                canvas.transVList[i] = [canvas.transVList[i][0]/(1 + timeSinceStart * 0.01), canvas.transVList[i][1]/(1 + timeSinceStart * 0.01), canvas.transVList[i][2]];
                break;
            case (animationEnd):
                canvas.objectCount = 80;
                canvas.objectLifeSpan[i] = 0;
                break
            default:
                sumPosition = canvas.transVList[i].reduce((a, b) => Math.abs(a) + Math.abs(b));
                break;
        }

        canvas.objectWiseRendering(i, deltaTime);

        if (sumPosition < 1 || canvas.objectTimeAlive[i] > canvas.objectLifeSpan[i]){
            canvas.transVList.splice(i, 1);
            canvas.objectLifeSpan.splice(i, 1);
            canvas.rotVList.splice(i,1);
            canvas.objectTimeAlive.splice(i, 1);
        }

    }
    animationEnd = false;
}
// ------------------------------------------------------------------------------------------------------------------