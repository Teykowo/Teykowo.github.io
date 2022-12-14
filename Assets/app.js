// ------------------------------------ Global Variables ------------------------------------
// Get the delay that's been set for the shrinking animation. We do this by selecting the HTML element, requesting the animation delay property value, and slicing it to only
// get the first number in seconds (the format is that of a string), we then use parseFloat to convert the string to a float.
var mainBody = document.querySelector('#Main_Body');
var animationDelay = parseFloat(getComputedStyle(mainBody).animationDelay.slice(0, 2));

// Define a variable to store the numerical value of the "skip intro" switch.
var skipIntroFloat = 0;
// Init a value to take the time each loop.
var oldTime = 0;
// Keep track of the list of canvas objects currently running.
var canvasesList = [];
// ------------------------------------------------------------------------------------------

// Javascript doesn't read from top to bottom like python does, so we can make the function call now and define it later.
main();

// ------------------------------------------------- -Main Function -------------------------------------------------
// We now define the main function which is called when the script is read.
function main(){
    // ----------------------------------- Canvas Class Inits -----------------------------------
    canvasBackground = new Canvas('#Background_Spawner')
    canvasBackground.setup(235/255, 236/255, 237/255, 1, 1, 'cube()')
    // glContext.clearColor(1/14*value, 0, 13/14*value, 1);
    canvasBackground.transVList.push([0.0, 0.0, -20.0]);
    canvasBackground.rotVList.push([0.2, 0.4, 0.3]);
    canvasBackground.objectTimeAlive.push(0.0);
    canvasBackground.objectLifeSpan.push(animationDelay);
    canvasesList.push(canvasBackground);

    canvasPCO = new Canvas('#PCO_Cube')
    canvasPCO.setup(1, 1, 1, 1, 0, 'cube()', 131, 131);
    canvasPCO.transVList.push([0.0, 0.0, -4.5]);
    canvasPCO.rotVList.push([0.2, 0.4, 0.3]);
    canvasPCO.objectTimeAlive.push(0.0);
    canvasesList.push(canvasPCO);

    canvasHunter = new Canvas('#Hunter_Cube')
    canvasHunter.setup(1, 1, 1, 1, 0, 'cube()', 131, 131);
    canvasHunter.transVList.push([0.0, 0.0, -4.5]);
    canvasHunter.rotVList.push([-0.4, 0.2, 0.2]);
    canvasHunter.objectTimeAlive.push(0.0);
    canvasesList.push(canvasHunter);

    canvasAoC = new Canvas('#AdventOfCode_Cube')
    canvasAoC.setup(1, 1, 1, 1, 0, 'cube()', 131, 131);
    canvasAoC.transVList.push([0.0, 0.0, -4.5]);
    canvasAoC.rotVList.push([0.1, 0.1, -0.4]);
    canvasAoC.objectTimeAlive.push(0.0);
    canvasesList.push(canvasAoC);

    canvasIforme = new Canvas('#Iforme_Cube')
    canvasIforme.setup(1, 1, 1, 1, 0, 'cube()', 131, 131);
    canvasIforme.transVList.push([0.0, 0.0, -4.5]);
    canvasIforme.rotVList.push([-0.2, 0.4, -0.2]);
    canvasIforme.objectTimeAlive.push(0.0);
    canvasesList.push(canvasIforme);

    canvasPages = new Canvas('#Pages_Cube')
    canvasPages.setup(1, 1, 1, 1, 0, 'cube()', 131, 131);
    canvasPages.transVList.push([0.0, 0.0, -4.5]);
    canvasPages.rotVList.push([-0.2, -0.4, 0.4]);
    canvasPages.objectTimeAlive.push(0.0);
    canvasesList.push(canvasPages);
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
    // Set a timeout so as to start at the top of the page, we should clear the timeout when the animation skip button is clicked so as not to scroll back long after page load.
    const scrollTimeout = setTimeout(function(){window.scrollTo(0, 0)}, animationDelay*1000);

    let animatedElements = document.querySelectorAll('.animated');
    let rewriteTechH = document.getElementById('rewriteTech');

    introSkipSwitch.addEventListener('change', skipIntro);

    window.addEventListener('resize', onResize);

    canvasPCO.HTMLCanvas.addEventListener('click', function(){window.open("Assets/img/PCO_Paper.pdf")})
    canvasHunter.HTMLCanvas.addEventListener('click', function(){window.open("https://github.com/Teykowo/Reinforcement-Learning-Hunter")})
    canvasAoC.HTMLCanvas.addEventListener('click', function(){window.open("https://github.com/Teykowo/AdventOfCode-One_Language_A_Day")})
    canvasPages.HTMLCanvas.addEventListener('click', function(){window.open("https://github.com/Teykowo/Teykowo.github.io")})
    
    function terminateAnimations() {
        animatedElements.forEach((element) => {
            element.style.animationDelay = '0s, 0s'
            element.style.animationDuration = '0s, 0s'
        });
    }

    function skipIntro() {
        if (introSkipSwitch.checked){
            clearTimeout(scrollTimeout);
            localStorage.setItem("introSkipStoredValue", introSkipSwitch.checked);
            if (animationDelay > oldTime){
                animationDelay = oldTime;
                canvasesList.forEach(canvas_i => {
                    canvas_i.animationEnd = true;
                });

                terminateAnimations();
            }
        }else{
            localStorage.setItem("introSkipStoredValue", introSkipSwitch.checked);
        }
    }

    function onResize(){
        canvasBackground.resizeCanvas();
        canvasesList.slice(1).forEach(canvas_i => {
            canvas_i.resizeCanvas(131, 131);
        });

        if (window.innerWidth < 530){
            rewriteTechH.textContent = 'Techs:';
        } else {
            rewriteTechH.textContent = 'Technologies:';
        };
    }

    // Each function should be called at least once at the start.
    skipIntro();
    onResize();

    let lastAnimationTime = parseFloat(getComputedStyle(document.querySelector('#Final_REPL')).animationDelay.slice(0, 2));
    setTimeout(terminateAnimations, lastAnimationTime*1000);
    // ------------------------------------------------------------------------------------------

    // ------------------------------------- Rendering Loop -------------------------------------
    // Render the scene repeatedly using a recurcive function.
    function renderingLoop(timeSinceStart) {
        
        // Always start with cleaning the canvases.
        canvasesList.forEach(canvas_i => {
            canvas_i.glContext.clear(canvas_i.glContext.COLOR_BUFFER_BIT|canvas_i.glContext.DEPTH_BUFFER_BIT);
        });

        // timeSinceStart is first gathered using requestAnimationFrame wich gave us the time in ms since the document's time origin.
        // Multiplying this value changes the speed of animation transformations, meaning the next frame will have the figure move more or less.
        timeSinceStart *= 0.001; // From ms to s.

        // Get the time since last frame.
        const deltaTime = timeSinceStart - oldTime;
        // And set the old time variable to current time.
        oldTime = timeSinceStart;

        // Call the draw function.
        drawBackground(canvasBackground, deltaTime, timeSinceStart);
        canvasesList.slice(1).forEach(canvas_i => {
            canvas_i.objectWiseRendering(0, deltaTime)
        });
    
        // Make the function call recursive by recalling the renderingLoop function through requestAnimationFrame.
        requestAnimationFrame(renderingLoop);
    }
    // This native function takes another function as argument and call it, passing time since time origin as argument to it. requestAnimationFrame is useful as it usually
    // syncs call frequency with the display refresh rate, it also stops running when the user changes tab or if the animation is running in the background of something else.
    requestAnimationFrame(renderingLoop);
    // ------------------------------------------------------------------------------------------
}
// ------------------------------------------------------------------------------------------------------------------