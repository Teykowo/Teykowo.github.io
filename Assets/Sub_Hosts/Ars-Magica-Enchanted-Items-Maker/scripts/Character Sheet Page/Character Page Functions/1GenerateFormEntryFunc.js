// ----------------------------------------------- Imports -----------------------------------------------
import {GenerateOptions} from './2GenerateOptionsFunc.js';
import {SaveFormData} from './3SaveFormDataFunc.js';
// -------------------------------------------------------------------------------------------------------
// Create a function that generates automatically a field element, it can trigger the "GenerateOptions" function if the inputType is set as "select", so it uses the same parameters.
// It also needs the id to be passed down, as well as the fieldset in which the field is nested. The label is also passed as a string parameter.
export function GenerateFormEntry(id = 0, inputType = 'input', list = null, labelText = '', fieldset, savedVariable, savedVariableIndex = null, before = null){
    // Fetch the character associated with this page.
    var charactersList = JSON.parse(localStorage.getItem('charactersList'));
    var relatedCharacter = charactersList[id];
    // Create a container element to display the label and input on a horizontal line.
    let container = document.createElement('div');
    // Assign the class of those types of container, which simply sets it as a horizontal flex.
    container.className = 'flex_form_container';
    // Create the label.
    let label = document.createElement('label');
    // Set its value as the passed label string. 
    label.innerText = labelText;
    // Create the input element for this entry, its type depends on the given parameter. 
    let input;
    // If the input is a number field :
    if (inputType == 'number') {
        // We first create an "input" element.
        input = document.createElement('input');
        // And then change it's type to "number".
        input.type = 'number'
    } else {
        input = document.createElement(inputType);
    };
    // Otherwise, multiple options are possible.
    // If the input type is "select":
    if (inputType == 'select'){
        input = document.createElement('select');
        // Generate the options associated to it.
        GenerateOptions(list, input, relatedCharacter, savedVariable, savedVariableIndex)
        // Instantiate an event listener that reacts to changes in the field (enter key, option change, or out of focus.).
        input.addEventListener('change', (e) => {
            // Save the value in the character file and ensure it is synced with local storage.
            SaveFormData(id, e.target.value, savedVariable, savedVariableIndex);     
        });
    // In the case of the comp section, the number is hidden in a list, thus we change the code a bit.
    } else if (savedVariable == 'compCharList' & inputType == 'number') {
        // Ensure the default value is that of the on recorded in the character file on local storage (the "GenerateOptions" function takes care of it otherwise.).
        input.value = relatedCharacter[savedVariable][savedVariableIndex][0];
        // Instantiate an event listener that reacts to changes in the field (enter key, option change, or out of focus.).
        input.addEventListener('change', (e) => {
            // Save the value in the character file and ensure it is synced with local storage.
            SaveFormData(id, e.target.value, savedVariable, savedVariableIndex);     
        });
    // If we're dealing with lab focuses, we need to access a simple dictionary.
    } else if (savedVariable == 'labFocuses' & inputType == 'number'){
        // Ensure the default value is that of the on recorded in the character file on local storage.
        input.value = relatedCharacter['customLab'][savedVariable][savedVariableIndex][0];
        // Instantiate an event listener that reacts to changes in the field (enter key, option change, or out of focus.).
        input.addEventListener('change', (e) => {
            // Save the value in the character file and ensure it is synced with local storage.
            SaveFormData(id, e.target.value, savedVariable, savedVariableIndex);     
        });
    } else if (savedVariableIndex != null & inputType == 'number'){
        // Ensure the default value is that of the on recorded in the character file on local storage.
        input.value = relatedCharacter[savedVariable][savedVariableIndex];
        // Instantiate an event listener that reacts to changes in the field (enter key, option change, or out of focus.).
        input.addEventListener('change', (e) => {
            // Save the value in the character file and ensure it is synced with local storage.
            SaveFormData(id, e.target.value, savedVariable, savedVariableIndex);     
        });
    // Otherwise :
    } else {
        // Ensure the default value is that of the on recorded in the character file on local storage.
        input.value = relatedCharacter[savedVariable];
        // Instantiate an event listener that reacts to changes in the field (enter key, option change, or out of focus.).
        input.addEventListener('change', (e) => {
            // Save the value in the character file and ensure it is synced with local storage.
            SaveFormData(id, e.target.value, savedVariable);     
        });
    };
    // Append the label and input to the container.
    container.appendChild(label);
    container.appendChild(input);
    // Append the container to the given fieldset either at the end or just before.
    if (before) {
        fieldset.insertBefore(container, before);
    } else {
        fieldset.appendChild(container);
    };
};