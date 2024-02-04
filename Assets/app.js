// ------------------------------------ Global Variables ------------------------------------
// Get the delay that's been set for the shrinking animation. We do this by selecting the HTML element, requesting the animation delay property value, and slicing it to only
// get the first number in seconds (the format is that of a string), we then use parseFloat to convert the string to a float.
const mainBody = document.querySelector('#Main_Body');
let animationDelay = parseFloat(getComputedStyle(mainBody).animationDelay.slice(0, 2));

// Define a variable to store the numerical value of the "skip intro" switch.
let skipIntroFloat = 0;
// Init a value to take the time each loop.
let oldTime = 0;
// Keep track of the list of canvas objects currently running.
let canvasesList = [];
// ------------------------------------------------------------------------------------------

// Javascript doesn't read from top to bottom like python does, so we can make the function call now and define it later.
main();

// ------------------------------------------------- -Main Function -------------------------------------------------
// We now define the main function which is called when the script is read.
function main(){
    // ----------------------------------- Canvas Class Inits -----------------------------------
    // For each canvas, we create an isntance of our custom canvas object using the desired html canvas ID.
    const canvasBackground = new Canvas('#Background_Spawner')
    // We then set it up by giving it an RGBAV array that defines the clearing colour, and we also give it the path to the .obj file to render.
    canvasBackground.setup([235/255, 236/255, 237/255, 1, 1], 'Assets/Buffer_DATA/cube.obj', undefined, undefined, [0, 0, 0, 1])
    // We push all relevent data (translation vector, [initial rotation vector and continuous rotation vector], as well as optionnally the object's lifespan).
    canvasBackground.pushObjectData([0.0, 0.0, -20.0], [0, 0, 0.3], animationDelay);
    // And we add the canvas to the list of currently running ones.
    canvasesList.push(canvasBackground);

    // We do the same for each canvas.
    const canvasMainBackground = new Canvas('#MainBackground_Canvas')
    // This last parameter is the colour of the object, all the other one are transparent by default so as to see the image of video behind them.
    canvasMainBackground.setup([1, 1, 1, 0, 0], 'Assets/Buffer_DATA/gear2simpleRot.obj', undefined, undefined, [1, 1, 1, 1]);
    canvasMainBackground.pushObjectData([0.0, 0.0, -10.0], [0, 0, 0.05]);
    // We want the background cog to spin more slowly so we change the rot speed from 10 to 20 (recall it's a dividend).
    canvasMainBackground.rotationSpeed = 20;
    canvasesList.push(canvasMainBackground);

    const canvasRateIt = new Canvas('#RateIt_Cube')
    canvasRateIt.setup([1, 1, 1, 1, 0], 'Assets/Buffer_DATA/cube.obj', 131, 131);
    canvasRateIt.pushObjectData([0.0, 0.0, -4.5], [0.1, -0.2, -0.4]);
    canvasesList.push(canvasRateIt);
    
    const canvasPCO = new Canvas('#PCO_Cube')
    // The small poject cubes are of size 131px by 131px.
    canvasPCO.setup([1, 1, 1, 1, 0], 'Assets/Buffer_DATA/cube.obj', 131, 131);
    canvasPCO.pushObjectData([0.0, 0.0, -4.5], [0.2, 0.4, 0.3]);
    canvasesList.push(canvasPCO);

    const canvasHunter = new Canvas('#Hunter_Cube')
    canvasHunter.setup([1, 1, 1, 1, 0], 'Assets/Buffer_DATA/cube.obj', 131, 131);
    canvasHunter.pushObjectData([0.0, 0.0, -4.5], [-0.4, 0.2, 0.2]);
    canvasesList.push(canvasHunter);

    const canvasAoC = new Canvas('#AdventOfCode_Cube')
    canvasAoC.setup([1, 1, 1, 1, 0], 'Assets/Buffer_DATA/cube.obj', 131, 131);
    canvasAoC.pushObjectData([0.0, 0.0, -4.5], [0.1, 0.1, -0.4]);
    canvasesList.push(canvasAoC);

    const canvasIforme = new Canvas('#Iforme_Cube')
    canvasIforme.setup([1, 1, 1, 1, 0], 'Assets/Buffer_DATA/cube.obj', 131, 131);
    canvasIforme.pushObjectData([0.0, 0.0, -4.5], [-0.2, 0.4, -0.2]);
    canvasesList.push(canvasIforme);

    const canvasPages = new Canvas('#Pages_Cube')
    canvasPages.setup([1, 1, 1, 1, 0], 'Assets/Buffer_DATA/cube.obj', 131, 131);
    canvasPages.pushObjectData([0.0, 0.0, -4.5], [-0.2, -0.4, 0.4]);
    canvasesList.push(canvasPages);
    // ------------------------------------------------------------------------------------------
    
    // ---------------------------------------- -Options ----------------------------------------
    // Get the skip intro switch element.
    const introSkipSwitch = document.getElementById('IntroSkipValue');
    try{
        // If there is a value for it already registered in the browser cache, then fetch it and read it.
        let introSkipStoredValue = JSON.parse(localStorage.getItem("introSkipStoredValue"));
        // Then modify the switch's value to be the same as how the user last set it.
        introSkipSwitch.checked = introSkipStoredValue;
    } catch(error){
        // If no value is found, do nothing, it just means the user is going on this page for the first time.
    }
    // ------------------------------------------------------------------------------------------

    // ------------------------------------ -Event Listeners ------------------------------------
    // Set a timeout so as to start at the top of the page, we should clear the timeout when the animation skip button is clicked so as not to scroll back long after page load.
    const scrollTimeout = setTimeout(function(){window.scrollTo(0, 0)}, animationDelay*1000);

    // Fetch the list of all elements with the .animated class.
    let animatedElements = document.querySelectorAll('.animated');
    // Fetch the text in skills that reads "Technologies", since it is a bit long, we'll change it later to fit phones screen sizes.
    let rewriteTechH = document.getElementById('rewriteTech');

    // Add an event listenener to the skipIntro function on click of the skip intro switch.
    introSkipSwitch.addEventListener('change', skipIntro);

    // Add an event listener to resize the window's content each time the user resizes the window itself.
    window.addEventListener('resize', onResize);

    // Add an event listenener for each of the project cube, they will redirect to the project they each talk about on click.
    canvasRateIt.HTMLCanvas.addEventListener('click', function(){window.open("https://github.com/Teykowo/Rate.It")})
    canvasPCO.HTMLCanvas.addEventListener('click', function(){window.open("Assets/img/PCO_Paper.pdf")})
    canvasHunter.HTMLCanvas.addEventListener('click', function(){window.open("https://github.com/Teykowo/Reinforcement-Learning-Hunter")})
    canvasAoC.HTMLCanvas.addEventListener('click', function(){window.open("https://github.com/Teykowo/AdventOfCode-One_Language_A_Day")})
    canvasPages.HTMLCanvas.addEventListener('click', function(){window.open("https://github.com/Teykowo/Teykowo.github.io")})
    
    // Create a function that iterates over all the animated element to make all their animation play right now and instantly.
    function terminateAnimations() {
        animatedElements.forEach((element) => {
            element.style.animationDelay = '0s, 0s'
            element.style.animationDuration = '0s, 0s'
        });
    }

    // Define a function that skips the intro animations it triggers when the "skip animations?" switch's state is changed.
    function skipIntro() {
        // If the switch is checked:
        if (introSkipSwitch.checked){
            // then clear the scroll up timeout as explained in it's setup.
            clearTimeout(scrollTimeout);
            // Store the switch's value in the browser to fetch it on reload.
            localStorage.setItem("introSkipStoredValue", introSkipSwitch.checked);
            // If the intro animation is still going:
            if (animationDelay > oldTime){
                // Set it to end next frame.
                animationDelay = oldTime;
                canvasBackground.animationEnd = true;

                // And terminate all the html elements' animations.
                terminateAnimations();
            }
        }else{
            // If the switch is unchecked then likewise store this value in the browser.
            localStorage.setItem("introSkipStoredValue", introSkipSwitch.checked);
        }
    }

    // Define the onResize function which resizes the canvas so that their resolution fits the display.
    function onResize(){
        // Run the resizeCanvas with the default value of "the whole screen" for both background canvases.
        canvasBackground.resizeCanvas();
        canvasMainBackground.resizeCanvas();
        // And resize the canvas to the decided size of 131px² for the projects cubes canvases (hence why the slice to ignore the first two (background) canvases).
        canvasesList.slice(2).forEach(canvas_i => {
            canvas_i.resizeCanvas(131, 131);
        });

        // If the window is less than 530 pixels wide:
        if (window.innerWidth < 530){
            // Then rename the skill from "technologies" to "techs".
            rewriteTechH.textContent = 'Techs:';
        } else {
            // Otherwise set it to back to "Technologies", so as not to keep the "Techs" if the screen goes back to a larger size.
            rewriteTechH.textContent = 'Technologies:';
        };
    }

    // Each function should be called at least once at the start.
    skipIntro();
    onResize();

    // Define the last animation to be played as the last CMD line entry appearance, and store it's animation delay to know when everything should be loaded.
    let lastAnimationTime = parseFloat(getComputedStyle(document.querySelector('#Final_REPL')).animationDelay.slice(0, 2));
    // So as to avoid animations re-playing on screen size change (when their display goes from none to block), set all the animated elements animations to 0 delay 0 duration.
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

        // Call the draw function. There is a specific one for the background hance the slice.
        drawBackground(canvasBackground, deltaTime, timeSinceStart);
        canvasesList.slice(1).forEach(canvas_i => {
            canvas_i.objectWiseRendering(0, deltaTime);
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
