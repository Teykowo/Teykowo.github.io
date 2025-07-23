// ----------------------------------------------- Imports -----------------------------------------------
import {GenerateFormEntry} from '../Character Page Functions/1GenerateFormEntryFunc.js';
// -------------------------------------------------------------------------------------------------------
export function InfoCharField(id, MAISONSLIST){
    // Fill the first Character fieldset with Character Name, ID Code, House and Int value.
    const INFOCHARFIELDSET = document.getElementById('info_char_fieldset');
    // Character Name :
    GenerateFormEntry(id, 'input', null, 'Nom du Personnage : ', INFOCHARFIELDSET, 'charName');
    // Character ID :
    let charIDText = document.createElement('h');
    charIDText.innerText = 'ID : ' + id;
    INFOCHARFIELDSET.appendChild(charIDText);
    // Character House :
    GenerateFormEntry(id, 'select', MAISONSLIST, 'Maison du Personnage : ', INFOCHARFIELDSET, 'house');
    // Character Int :
    GenerateFormEntry(id, 'number', null, 'Intelligence du Personnage : ', INFOCHARFIELDSET, 'intValue');
};