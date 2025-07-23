// Create a function that generates automatically all the options in drop down menues. It needs the list of string entries, the elements to append them to and the related variable in the 
// character's save file.
export function GenerateOptions(list, selectElement, relatedCharacter, savedVariable, savedVariableIndex){
    // For each entry in the list :
    for (let i = 0; i < list.length; i++) {
        // Get the current entry's name. 
        const elem = list[i];
        // Create an "option" element.
        let option = document.createElement('option');
        // Set its value and inner text as the current entry's name (string).
        option.value = elem;
        option.innerText = elem;
        // If the character entry we're looking for is in the form of a list, we have to use an index to know which part of this list we're looking for.
        if (savedVariableIndex != null) {
            // compCharList is an outlier as the value isn't stored simply in a list, but in a dict of lists, it is thus simpler to proceed thusly.
            if (savedVariable == 'compCharList'){
                if (elem == relatedCharacter[savedVariable][savedVariableIndex][1]) {
                    // Set it as selected by default.
                    option.selected = 'selected';
                };
            // Same thing for labFocuses but the path is different.
            } else if (savedVariable == 'labFocuses') {
                if (elem == relatedCharacter['customLab'][savedVariable][savedVariableIndex][1]) {
                    // Set it as selected by default.
                    option.selected = 'selected';
                };
            // Else if the current entry's recorded in the character file :
            } else if (elem == relatedCharacter[savedVariable][savedVariableIndex]) {
                // Set it as selected by default.
                option.selected = 'selected';
            };
        } else {
            // If the current entry's recorded in the character file :
            if (elem == relatedCharacter[savedVariable]) {
                // Set it as selected by default.
                option.selected = 'selected';
            };
        };
        // Append the option to its parent "select" element.
        selectElement.appendChild(option);
    };
};