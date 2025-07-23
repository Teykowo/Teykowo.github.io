export function GenerateCharacterFields(MAINCONTAINER){
    // Create this page's specific container divs.
    const CONTAINERFLEXPERSO = document.createElement('div');
    CONTAINERFLEXPERSO.id = "container_flex_persos";
    const CONTAINERFICHELABO = document.createElement('div');
    CONTAINERFICHELABO.id = "container_fiche_labo";
    const CONTAINERFICHEPERSOS = document.createElement('div');
    CONTAINERFICHEPERSOS.id = "container_fiche_persos";
    CONTAINERFLEXPERSO.appendChild(CONTAINERFICHEPERSOS);
    CONTAINERFLEXPERSO.appendChild(CONTAINERFICHELABO);
    MAINCONTAINER.appendChild(CONTAINERFLEXPERSO);

    // Create a Field with the correct legend for each character sheet categories on which we'll dynamically append.
    const CHARFIELDSETCATEGORIES = [['info_char_fieldset', 'Informations Personnage :'], ['v_and_v_fieldset', 'Vices & Vertues (d\'enchantement) :'], 
    ['comp_fieldset', 'Compétences :'], ['arts_fieldset', 'Arts :']];
    for (let i = 0; i < CHARFIELDSETCATEGORIES.length; i++) {
        let categoryName = CHARFIELDSETCATEGORIES[i];
        let fieldsetElem = document.createElement('fieldset');
        fieldsetElem.id = categoryName[0];
        let legendElem = document.createElement('legend');
        legendElem.innerText = categoryName[1];
        fieldsetElem.appendChild(legendElem);
        CONTAINERFICHEPERSOS.appendChild(fieldsetElem);
    };
    // Create a Field with the correct legend for each laboratory sheet categories on which we'll dynamically append.
    const LABFIELDSETCATEGORIES = [['info_labo_fieldset', 'Informations Laboratoire :'], ['lab_focus_fieldset', 'Focus de Laboratoire :']];
    for (let i = 0; i < LABFIELDSETCATEGORIES.length; i++) {
        let categoryName = LABFIELDSETCATEGORIES[i];
        let fieldsetElem = document.createElement('fieldset');
        fieldsetElem.id = categoryName[0];
        let legendElem = document.createElement('legend');
        legendElem.innerText = categoryName[1];
        fieldsetElem.appendChild(legendElem);
        CONTAINERFICHELABO.appendChild(fieldsetElem);
    };
};