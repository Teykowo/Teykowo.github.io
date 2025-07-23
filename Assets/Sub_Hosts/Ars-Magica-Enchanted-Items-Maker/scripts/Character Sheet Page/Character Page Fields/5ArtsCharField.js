// ----------------------------------------------- Imports -----------------------------------------------
import {GenerateFormEntry} from '../Character Page Functions/1GenerateFormEntryFunc.js';
// -------------------------------------------------------------------------------------------------------
export function ArtsCharField(id, ARTSLIST){
    // Fill the fourth Character fieldset with Arts.
    const ARTSFIELDSET = document.getElementById('arts_fieldset');
    for (let i = 0; i < ARTSLIST.length; i++) {
        let artsEntryName = ARTSLIST[i];
        let charArtsContainer = document.createElement('div');
        charArtsContainer.className = 'flex_form_container';
        charArtsContainer.id = artsEntryName;
        let artsEntryLabel = document.createElement('h4');
        artsEntryLabel.textContent = artsEntryName + ' : ';
        charArtsContainer.appendChild(artsEntryLabel);

        GenerateFormEntry(id, 'number', null, '', charArtsContainer, 'artsCharList', artsEntryName);

        ARTSFIELDSET.appendChild(charArtsContainer);
    };
};