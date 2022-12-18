function drawBackground(canvas, deltaTime, timeSinceStart){
    
    // During the intro, generate a new object every ~= 0.3 seconds so as to feel more full.
    if (timeSinceStart%0.3 < timeSinceStart*0.1 && timeSinceStart < animationDelay){
        // Generate a random translation vector to make the shape appear anywhere on the screen.
        let translateVector = [randInterval(-35., 35.), randInterval(-25., 25.), randInterval(-40., -22.)];
        // Generate a random rotation vector so as for all objects to spin differently.
        let rotationVector = [randInterval(0.1, 0.5), randInterval(0.1, 0.5), randInterval(0.1, 0.5)];
        // Generate a random life expectancy for the cube, it will despawn if this end of life is reached.
        let objectLifeSpan = randInterval(30.0, 100.0);
        // Push the data to the linked canvas object.
        canvas.pushObjectData(translateVector, rotationVector, objectLifeSpan);
    } 

    // Refurbish the list of objects if it is below the desired object count.
    while (canvas.transVList.length < canvas.objectCount){
        let translateVector = [gapRandInterval(-25., -10, 10, 25.), randInterval(-15., 15.), randInterval(-40., -22.)];
        // Generate a random rotation vector so as for all objects to spin differently.
        let rotationVector = [randInterval(0.1, 0.5), randInterval(0.1, 0.5), randInterval(0.1, 0.5)];
        // once the animation is done, I decided that cubes shouldn't despawn, if this is to change, simply lower this values and uncomment the code down below.
        let objectLifeSpan = randInterval(10000.0, 10000.0);
        // Push the data to the linked canvas object.
        canvas.pushObjectData(translateVector, rotationVector, objectLifeSpan);
    };

    // If the current time is situated between the planned end of the intro to a maximum of it +0.03s (so as to be sure to capture the moment at intro end in this statement):
    if(timeSinceStart > animationDelay && timeSinceStart < (animationDelay + 0.03)){
        // Signal that this is the last run of the intro animations.
        canvas.animationEnd = true;
    }
    
    // Iterate over the objects by index.
    for (let i = 0; i < canvas.transVList.length; i++){
        // Compute how close the object is to the center of the screen by adding the sum of it's absolute x and y coordinates, if the object is in the center then we should
        // Delete it so as to generate another one that we can see, it keep the intro going more dynamically and ensure the smooth despawning of still cubes if enabled.
        let sumPosition = canvas.transVList[i].slice(0, 2).reduce((a, b) => Math.abs(a) + Math.abs(b));
        // Use a switch case to tidy different cases, modifications to objects places are made by modifying their transVList array.
        switch(true){
            // If the intro is currently going and the index is the first one, meaning the main, big growing block:
            case (timeSinceStart < animationDelay && i === 0):
                // Then ensure that it won't be deleted based on it's closeness to the center by setting it's sumPosition to something bigger than the threshold.
                sumPosition = 2;
                // and move it toward the screen to a max of -2. For this we use a function of time that adds more and more to the base of -20.
                canvas.transVList[i] = [0, 0, Math.min((-20+(((timeSinceStart+3)**4)*0.01)), -2)];
                break;
            // If the intro is still going but this time for every object that is not the first (growing) one:
            case (timeSinceStart < animationDelay && i != 0):
                // Then compute the sum of the absolute values for it's x and y positions, so as to know if it's reached the center and can be deleted or no.
                // Otherwise move it towards the center by dividing it's x and y coordinates by an ever growing value.
                canvas.transVList[i] = [canvas.transVList[i][0]/(1 + (timeSinceStart+3) * 0.01), canvas.transVList[i][1]/(1 + (timeSinceStart+3) * 0.01), canvas.transVList[i][2]];
                break;
            // If this is the last run before the end of the intro:
            case (canvas.animationEnd):
                // Increase the number of object to populate the soon-to-be-still background.
                canvas.objectCount = 80;
                // And set all current objects' life spans to 0 so as to get rid of them.
                canvas.objectLifeSpan[i] = 0;
                break
            // If this is just a run of the still background animations:
            default:
                // This code is used for smooth appearing and disapearing of objects in the background, use it when lowering the life span as mentionned above.
                // // Init a value that defines how much does the object still has to live.
                // let timeTillDeath = canvas.objectLifeSpan[i] - canvas.objectTimeAlive[i]
                // // And depending on those cases:
                // switch(true){
                //     // If the object's in it's 2 first seconds of life:
                //     case (canvas.objectTimeAlive[i] < 2):
                //         // Then during this time, make it appear from the center, in other words (-100) from the back given perspective and toward it's intended depth.
                //         canvas.transVList[i] = [canvas.transVList[i][0], canvas.transVList[i][1], Math.min((-100 * ((2-canvas.objectTimeAlive[i])/2)), canvas.depthList[i])];
                //         break;
                //     // If the object's in it's last 2 seconds of life:
                //     case (timeTillDeath < 2):
                //         // Do the opposite by decreasing it's depth value toward -100 so as to smoothly make it disapear.
                //         canvas.transVList[i] = [canvas.transVList[i][0], canvas.transVList[i][1], Math.min((-100 * ((2-timeTillDeath)/2)), canvas.depthList[i])];
                //         break;
                //     default: 
                //         // Otherwise do nothing.
                //         break;
                // }
                break;
        }

        // Render the object by passing it's index to the main rendering method inside the canvas object.
        canvas.objectWiseRendering(i, deltaTime);

        // If the object's sum of positions is lower than 1 or if it's programmed end of life is reached: 
        if (sumPosition < 1 || canvas.objectTimeAlive[i] > canvas.objectLifeSpan[i]){
            // Remove it's entries from every array in the canvas, deleting it.
            canvas.transVList.splice(i, 1);
            canvas.objectLifeSpan.splice(i, 1);
            canvas.rotVList.splice(i,1);
            canvas.objectTimeAlive.splice(i, 1);
        }
    }
    // No matter what, the animationEnd is always either not reached or already ran at this point in the code, hence we set it back to false.
    canvas.animationEnd = false;
}