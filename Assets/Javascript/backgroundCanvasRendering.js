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
    canvas = new Canvas('#Background_Spawner')
    canvas.setup(235/255, 236/255, 237/255, 1, 1, 'cube()')
    // canvas.setup(15/41, 13/41, 13/41, 1, 1, 'cube()')
    // glContext.clearColor(1/14*value, 0, 13/14*value, 1);
    const glContext = canvas.glContext;
    const pipelineAddresses = canvas.pipelineAddresses
    const bufferLibrary = canvas.bufferLibrary
    const renderingParams = canvas.renderingParams
    
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
    window.addEventListener('resize', canvas.resizeCanvas);
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
        draw(canvas, glContext, pipelineAddresses, deltaTime, timeSinceStart, renderingParams);
    
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
function draw(canvas, glContext, pipelineAddresses, deltaTime, timeSinceStart, renderingParams){
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

        canvas.objectWiseRendering(transVList[i], objectTimeAlive[i], rotVList[i]);

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