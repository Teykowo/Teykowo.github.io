// ----------------------------------------------- Imports -----------------------------------------------
import {GenerateFormEntry} from '../Character Page Functions/1GenerateFormEntryFunc.js';
// -------------------------------------------------------------------------------------------------------
export function CompCharField(id, COMPLIST, FOCUSES){
    // Fill the third Character fieldset with Apptitudes.
    const COMPFIELDSET = document.getElementById('comp_fieldset');

    for (let i = 0; i < COMPLIST.length; i++) {
            let compEntryName = COMPLIST[i];
            let charCompContainer = document.createElement('div');
            charCompContainer.className = 'flex_form_comp_container';
            charCompContainer.id = compEntryName;
            let compEntryLabel = document.createElement('h4');
            compEntryLabel.textContent = compEntryName + ' : ';
            charCompContainer.appendChild(compEntryLabel);

            GenerateFormEntry(id, 'number', null, 'Niveau :', charCompContainer, 'compCharList', compEntryName);
            GenerateFormEntry(id, 'select', FOCUSES, 'Spé : ', charCompContainer, 'compCharList', compEntryName);
            
            COMPFIELDSET.appendChild(charCompContainer);
    };
};