function gapRandInterval(minA, maxA, minB, maxB){
    // Generate a random boolean value.
    let gapRandChoice = Math.round(randInterval(0, 1));
    
    // Depending on the generated boolean:
    switch (gapRandChoice){
        // 0 (False) means the first interval is chosen to generate the random value.
        case (0):
            return randInterval(minA, maxA);
        // 1 (True) means the second interval is chosen to generate the random value.
        case (1):
            return randInterval(minB, maxB);
    }
};