export function CreateInput(type, container, inputLabelText, object, keys, options = []) {
    // Create a holder div to contain the label and actual input in whatever way we desire.
    const HOLDER = document.createElement('div');
    // Set the class of the holder to the type of form so that we can better change the styling.
    HOLDER.className = type;

    // Create the input's label.
    const INPUTLABEL = document.createElement('label');
    // Set its text value.
    INPUTLABEL.innerText = inputLabelText
    // remove the spaces from the label text to create the name that'll be used to link the label to the input.
    INPUTLABEL.for = inputLabelText.replaceAll(' ', '');
    // Add the label to the holder.
    HOLDER.appendChild(INPUTLABEL);

    // Create the input given the specified type.
    let INPUT;
    switch (type) {    
        case 'select':
            INPUT = document.createElement('select');
            INPUT.name = inputLabelText.replaceAll(' ', '');
            // Fill the select list of options.
            options.forEach(element => {
                const OPTION = document.createElement('option');
                // Set the value to the full text.
                OPTION.value = element;
                OPTION.text = element;
                // Set the default pick.
                if (element == keys.reduce((currentList, i) => currentList[i], object)) {
                    OPTION.selected = 'selected';
                }
                INPUT.appendChild(OPTION);
            });
            break;

        case 'checkbox':
            INPUT = document.createElement('input');
            INPUT.name = inputLabelText.replaceAll(' ', '');
            INPUT.type = "checkbox";
            // Set the default value of the checkbox.
            INPUT.checked = keys.reduce((currentList, i) => currentList[i], object);
            break;

        case 'textarea':
            INPUT = document.createElement('textarea');
            INPUT.name = inputLabelText.replaceAll(' ', '');
            // Set the default value of the checkbox.
            INPUT.innerText = keys.reduce((currentList, i) => currentList[i], object);
            break;

        default:
            // OK, I knoooow i shouldn't be doing this, but it killed me to add a case for "text" and copy paste it for "number"...
            // So i just merged them into the default case so that I could simply use the type variable's value in INPUT.type.
            INPUT = document.createElement('input');
            INPUT.name = inputLabelText.replaceAll(' ', '');
            // In this case, the type depends on what was given as value, it *SHOULD* be either "text" or "number".
            INPUT.type = type;
            INPUT.min = '0';
            // Set the default value of the variable.
            INPUT.value = keys.reduce((currentList, i) => currentList[i], object);
            break;
    };

    INPUT.addEventListener('change', (e) => {
        // Get the last key, the one needed to access the specific place in the object.
        let lastKey = keys[keys.length - 1];
        // Get to the list that holds the value we intend to change.
        let oneToLastObjectList = keys.slice(0, -1).reduce((current, key) => current[key], object);
        // Change the value in that list.
        if (INPUT.type == "checkbox") {
            oneToLastObjectList[lastKey] = e.target.checked;
        } else {
            oneToLastObjectList[lastKey] = e.target.value;
        }
        // Load the item list and save the current item.
        if (Object.keys(object).includes("itemID")) {
            let itemsList = JSON.parse(localStorage.getItem('itemsList'));
            itemsList[object.itemID] = object;
            localStorage.setItem('itemsList', JSON.stringify(itemsList));
        };
    });

    // Innit data in the board so that it's synced with default form values.
    INPUT.dispatchEvent(new Event('change'));

    // Add the input to the Holder.
    HOLDER.appendChild(INPUT);
    // And add the holder to its container.
    container.appendChild(HOLDER);
    // Return the label and input elements in case we need to do special operations on them.
    return [INPUTLABEL, INPUT];
}