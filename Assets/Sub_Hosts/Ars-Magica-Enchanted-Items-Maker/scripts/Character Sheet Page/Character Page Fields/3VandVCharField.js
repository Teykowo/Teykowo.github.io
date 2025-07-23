// ----------------------------------------------- Imports -----------------------------------------------
import {GenerateFormEntry} from '../Character Page Functions/1GenerateFormEntryFunc.js';
import {SaveFormData} from '../Character Page Functions/3SaveFormDataFunc.js';
// -------------------------------------------------------------------------------------------------------
export function VandVCharField(id, VERTUESLIST, VICESLIST){
    // Fetch the character associated with this page.
    var charactersList = JSON.parse(localStorage.getItem('charactersList'));
    var currentCharacter = charactersList[id];

    // Fill the second Character fieldset with Vertues and Vices.
    const VANDVFIELDSET = document.getElementById('v_and_v_fieldset');
    // Character Vertues :
    // For the vertues, we actually use two flex divs, one per form entry, as usual, but also one to contain all form entries, so as to generate them as a list.
    let charVertuesGlobalContainer = document.createElement('div');
    charVertuesGlobalContainer.className = 'flex_form_global_container';
    let charVertuesGlobalContainerLabel = document.createElement('h4');
    charVertuesGlobalContainerLabel.innerText = 'Vertues : ';
    charVertuesGlobalContainer.appendChild(charVertuesGlobalContainerLabel);
    // For each vertue registered in the character's list of vertues :
    for (let i = 0; i < Object.keys(currentCharacter.vertuesCharList).length; i++) {
        // Generate a form entry pre-filled with the vertue located at this index.
        GenerateFormEntry(id, 'select', VERTUESLIST, '-', charVertuesGlobalContainer, 'vertuesCharList', i);
    }
    // Spawn a button to add a new virtue.
    let virtueButton = document.createElement('input');
    virtueButton.type = 'button';
    virtueButton.value = '+';
    // Generate a new virtue input upon clicking the button.
    virtueButton.onclick= () => {
        // For this we must first update the currentCharacter variable, otherwise... well otherwise it doesn't work (adding a virtue sets the old ones to '').
        let charactersList = JSON.parse(localStorage.getItem('charactersList'));
        let currentCharacter = charactersList[id];
        // Get an index to assign to the new virtue entry.
        let currentIndex = Object.keys(currentCharacter.vertuesCharList).length;
        // And assign it the value '', and also update the charactersList local variable so that the virtue list in local storage represents the virtue list in the form, so that indices match.
        SaveFormData(id, '', 'vertuesCharList', currentIndex) 

        // generate the entry, it will sync with the local storage by way of the index we gave it.
        GenerateFormEntry(id, 'select', VERTUESLIST, '-', charVertuesGlobalContainer, 'vertuesCharList', currentIndex, virtueButton);
    };
    // Append the button at the end.
    charVertuesGlobalContainer.appendChild(virtueButton);
    // Append everything to the fieldset.
    VANDVFIELDSET.appendChild(charVertuesGlobalContainer);

    // Character Vices :
    // For the vices, we also use two flex divs, one per form entry, as usual, but also one to contain all form entries, so as to generate them as a list.
    let charVicesGlobalContainer = document.createElement('div');
    charVicesGlobalContainer.className = 'flex_form_global_container';
    let charVicesGlobalContainerLabel = document.createElement('h4');
    charVicesGlobalContainerLabel.innerText = 'Vices : ';
    charVicesGlobalContainer.appendChild(charVicesGlobalContainerLabel);
    // For each vice registered in the character's list of Vices :
    for (let i = 0; i < Object.keys(currentCharacter.vicesCharList).length; i++) {
        // Generate a form entry pre-filled with the vices located at this index.
        GenerateFormEntry(id, 'select', VICESLIST, '-', charVicesGlobalContainer, 'vicesCharList', i);
    }
    // Spawn a button to add a new vices.
    let vicesButton = document.createElement('input');
    vicesButton.type = 'button';
    vicesButton.value = '+';
    // Generate a new vices input upon clicking the button.
    vicesButton.onclick= () => {
        // For this we must first update the currentCharacter variable, otherwise... well otherwise it doesn't work (adding a vices sets the old ones to '').
        let charactersList = JSON.parse(localStorage.getItem('charactersList'));
        let currentCharacter = charactersList[id];
        // Get an index to assign to the new vices entry.
        let currentIndex = Object.keys(currentCharacter.vicesCharList).length;
        // And assign it the value '', and also update the charactersList local variable so that the vices list in local storage represents the vices list in the form, so that indices match.
        SaveFormData(id, '', 'vicesCharList', currentIndex) 

        // generate the entry, it will sync with the local storage by way of the index we gave it.
        GenerateFormEntry(id, 'select', VICESLIST, '-', charVicesGlobalContainer, 'vicesCharList', currentIndex, vicesButton);
    };
    // Append the button at the end.
    charVicesGlobalContainer.appendChild(vicesButton);
    // Append everything to the fieldset.
    VANDVFIELDSET.appendChild(charVicesGlobalContainer);
};