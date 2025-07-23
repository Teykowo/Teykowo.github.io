// ----------------------------------------------- Imports -----------------------------------------------
import {GenerateFormEntry} from '../Character Page Functions/1GenerateFormEntryFunc.js';
// -------------------------------------------------------------------------------------------------------
export function FocusLaboField(id, FOCUSES){
    
    // Fill the third Character fieldset with Apptitudes.
    const FOCUSFIELDSET = document.getElementById('lab_focus_fieldset');

    // Split list in the three relevent sub lists. Also add a blank space for those who don't have it.
    const SPEACT = FOCUSES.slice(15);
    let SPETECH = FOCUSES.slice(0, 5);
    SPETECH.push('')
    let SPEFORM = FOCUSES.slice(5, 15);
    SPEFORM.push('')

    // Make a list of sections.
    const CATLIST = ['Spécialisation d’Activité :', 'Spécialisation de Technique :', 'Spécialisation de Forme :'];

    CATLIST.forEach(title => {
        let focusCategory = document.createElement('div');
        let focusTitle = document.createElement('h3');
        focusTitle.textContent = title;
        focusCategory.appendChild(focusTitle);

        for (let i = 0; i < 2; i++) {
            let focusEntryName;
            let focusContainer = document.createElement('div');
            focusContainer.className = 'flex_form_focus_container';
            
            switch (title) {
                case 'Spécialisation d’Activité :':
                    focusEntryName = "Focus d’Activité " + (i+1);
                    GenerateFormEntry(id, 'select', SPEACT, '', focusContainer, 'labFocuses', focusEntryName);
                    break;
            
                case 'Spécialisation de Technique :':
                    focusEntryName = "Focus de Technique " + (i+1);
                    GenerateFormEntry(id, 'select', SPETECH, '', focusContainer, 'labFocuses', focusEntryName);                    
                    break;
                case 'Spécialisation de Forme :':
                    focusEntryName = "Focus de Forme " + (i+1);
                    GenerateFormEntry(id, 'select', SPEFORM, '', focusContainer, 'labFocuses', focusEntryName);                    
                    break;
                default:
                    break;
            }
            GenerateFormEntry(id, 'number', null, 'Niveau :', focusContainer, 'labFocuses', focusEntryName);
            
            focusContainer.id = focusEntryName;
            let focusEntryLabel = document.createElement('h4');
            focusEntryLabel.textContent = focusEntryName + ' : ';
            focusContainer.insertBefore(focusEntryLabel, focusContainer.firstChild);
            focusCategory.appendChild(focusContainer);
            
        };
        FOCUSFIELDSET.appendChild(focusCategory);
    });

    
};