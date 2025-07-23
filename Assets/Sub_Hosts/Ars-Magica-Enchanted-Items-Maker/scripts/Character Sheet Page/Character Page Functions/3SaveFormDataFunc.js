export function SaveFormData(id, dataToSave, whereToSave, whereToSaveBis = null) {
    // Fetch the character associated with the data to be saved.
    var charactersList = JSON.parse(localStorage.getItem('charactersList'));
    var currentCharacter = charactersList[id];

    switch (whereToSave) {
        case 'artsCharList':
            currentCharacter[whereToSave][whereToSaveBis] = dataToSave;
            break;
        case 'compCharList':
            // When updating the comp section, get the specific apptitude name, which doubles as a div ID.
            let currentComp = document.getElementById(whereToSaveBis);
            // And select both input fields, level and specialization.
            let compLevelForm = currentComp.childNodes[1].childNodes[1];
            let compSpeForm = currentComp.childNodes[2].childNodes[1];
            // Update both each time, thus we avoid needing to differentiate between the two.
            currentCharacter[whereToSave][whereToSaveBis][0] = compLevelForm.value;
            currentCharacter[whereToSave][whereToSaveBis][1] = compSpeForm.value;
            break;
        case 'vertuesCharList': 
            currentCharacter[whereToSave][whereToSaveBis] = dataToSave;
            break;
        case 'vicesCharList':
            currentCharacter[whereToSave][whereToSaveBis] = dataToSave;
            break;
        case 'customLab':
            currentCharacter[whereToSave][whereToSaveBis] = dataToSave;
            break;
        case 'labFocuses':
            // Just like when updating the comp section, get the specific apptitude name, which doubles as a div ID.
            let currentFocus = document.getElementById(whereToSaveBis);
            // And select both input fields, level and focus type, careful of the order.
            let focusLevelForm = currentFocus.childNodes[2].childNodes[1];
            let focusSpeForm = currentFocus.childNodes[1].childNodes[1];
            // Update both each time, thus we avoid needing to differentiate between the two.
            currentCharacter['customLab'][whereToSave][whereToSaveBis][0] = focusLevelForm.value;
            currentCharacter['customLab'][whereToSave][whereToSaveBis][1] = focusSpeForm.value;
            break;
        // By default, simply set the value.
        default:
            currentCharacter[whereToSave] = dataToSave;
            break;
    };
    // Save the new charactersList in local storage.
    localStorage.setItem('charactersList', JSON.stringify(charactersList));
};