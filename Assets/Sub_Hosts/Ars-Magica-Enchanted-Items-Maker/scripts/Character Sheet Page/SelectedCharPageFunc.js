// ----------------------------------------------- Imports -----------------------------------------------
import {GenerateCharacterFields} from './Character Page Fields/1GenerateCharacterFields.js';
import {InfoCharField} from './Character Page Fields/2InfoCharField.js';
import {VandVCharField} from './Character Page Fields/3VandVCharField.js';
import {CompCharField} from './Character Page Fields/4CompCharField.js';
import {ArtsCharField} from './Character Page Fields/5ArtsCharField.js';
import {InfoLaboField} from './Character Page Fields/6InfoLaboField.js';
import {FocusLaboField} from './Character Page Fields/7FocusLaboField.js';
import {EnchantmentButtons} from './Character Page Fields/8EnchantmentButtons.js';
// -------------------------------------------------------------------------------------------------------
// Create a function that loades the page relating to the character stats.
export function SelectedCharPage(MAINCONTAINER, OPTIONLISTS, id) {
    
    const MAISONSLIST = OPTIONLISTS['MAISONSLIST'];
    const VERTUESLIST = OPTIONLISTS['VERTUESLIST'];
    const VICESLIST = OPTIONLISTS['VICESLIST'];
    const COMPLIST = OPTIONLISTS['COMPLIST'];
    const ARTSLIST = OPTIONLISTS['ARTSLIST'];
    const FOCUSES = OPTIONLISTS['FOCUSES'];

    // Reset/clear the page's html, so as to not append to an already existing page.
    MAINCONTAINER.innerHTML = '';

    // ---------------------------------------- Generate Page Content ----------------------------------------
    // Generate Fields.
    GenerateCharacterFields(MAINCONTAINER, MAISONSLIST);
    // Fill the first character fieldset : Character Infos.
    InfoCharField(id, MAISONSLIST);
    // Fill the second character fieldset :  Vertues and Vices.
    VandVCharField(id, VERTUESLIST, VICESLIST);
    // Fill the third character fieldset : Apptitudes.
    CompCharField(id, COMPLIST, FOCUSES);
    // Fill the fourth character fieldset : Arts.
    ArtsCharField(id, ARTSLIST);

    // Fill the first laboratory fieldset : Aura, general quality and distortion values.
    InfoLaboField(id);
    // Fill the second aboratory fieldset : Focuses and associated values.
    FocusLaboField(id, FOCUSES);

    // Create the buttons that will redirect to the enchanting pages.
    EnchantmentButtons();
    // -------------------------------------------------------------------------------------------------------
};