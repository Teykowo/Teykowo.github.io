function randInterval(min, max){
    // math random without any values gives us a random number between 0 and 1. When we take max - min, we get the same interval we want but from 0.
    // The multiplication thus gives us a number in this interval, we add the min back to prop the interval back from 0 to between min and max.
    // We round the result to the third decimal by multiplying it, rounding it, then dividing it back down.
    randomValue = Math.round((Math.random() * (max - min) + min) * 1000) / 1000;
    return randomValue;
};