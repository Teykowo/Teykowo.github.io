// ----------------------------------------------- Imports -----------------------------------------------
import {GenerateFormEntry} from '../Character Page Functions/1GenerateFormEntryFunc.js';
// -------------------------------------------------------------------------------------------------------
export function InfoLaboField(id){
    // Fill the first Laboratory fieldset with fields for its aura, general quality and distortion values.
    const INFOLABFIELDSET = document.getElementById('info_labo_fieldset');
    // Lab's Aura :
    GenerateFormEntry(id , 'number', null, 'Aura : ', INFOLABFIELDSET, 'labAura');
    // Lab's GQ :
    GenerateFormEntry(id , 'number', null, 'Qualité Générale : ', INFOLABFIELDSET, 'customLab', 'labQG');
    // Lab's Distortion :
    GenerateFormEntry(id , 'number', null, 'Distortion : ', INFOLABFIELDSET, 'customLab', 'labDistortion');
};