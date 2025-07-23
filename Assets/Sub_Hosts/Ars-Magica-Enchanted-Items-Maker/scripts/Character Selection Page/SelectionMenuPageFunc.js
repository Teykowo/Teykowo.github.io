// Create a function that loades the page relating to the character selection and/or creation.
export function SelectionMenuPage(MAINCONTAINER, CHARSHEETFORMAT) {
    // Reset/clear the page's html, so as to not append to an already existing page.
    MAINCONTAINER.innerHTML = '';
    // -------------- HTML Default Generation --------------
    // Create the character thumbnails' container and the "add character" button element.
    const CONTAINERTHUMBNAILSPERSOS = document.createElement('div');
    CONTAINERTHUMBNAILSPERSOS.id = "container_thumbnails_persos";

    const ADDPERSOBOUTON = document.createElement('input');
    ADDPERSOBOUTON.type = "button";
    ADDPERSOBOUTON.id = "add_perso_button";
    ADDPERSOBOUTON.value = "+";
 
    const CONTAINERTHUMBNAILSSEPARATOR = document.createElement('div');
    CONTAINERTHUMBNAILSSEPARATOR.id = "container_thumbnails_separator";

    // Create the item thumbnails' container and the "reset data" button element.
    const CONTAINERTHUMBNAILSITEMS = document.createElement('div');
    CONTAINERTHUMBNAILSITEMS.id = "container_thumbnails_items";

    const RESETBUTTON = document.createElement('input');
    RESETBUTTON.type = "button";
    RESETBUTTON.id = "reset_button";
    RESETBUTTON.value = "RESET DATA";
    // -------------- HTML dynamic Generation --------------
    // --------------------------------------------- CHARACTERS ----------------------------------------------
    // Fetch the list of characters.
    var charactersList = JSON.parse(localStorage.getItem('charactersList'));
    // If there are any characters :
    if (charactersList != null) {
        // For every character, create a div 
        Object.keys(charactersList).forEach(i =>{
            let character = charactersList[i];
            // We'll encapsulate everything in a div so as to add sub buttons like "delete specific character".
            let characterThumbnailContainer = document.createElement('div');
            characterThumbnailContainer.className = "character_thumbnail_container";

            // Create a thumbnail button element.
            let characterThumbnail = document.createElement('input');
            characterThumbnail.type = "button";
            characterThumbnail.className = "character_thumbnail";
            characterThumbnail.value = character.charName;
            // Create a custom data parameter in each thumbnail elements so that we can load the correct character when clicking on each button (hence why we use the index as ID). 
            characterThumbnail.dataset.charID = character.charID;
            // When a character button is clicked, go to this character sheet.
            characterThumbnail.onclick = (self) => {
                // Change the hash to show the page of the clicked thumbnail's ID
                window.location.hash = 'CharacterNumber' + self.target.dataset.charID;
            };

            // Create the delete button.
            let characterThumbnailDelete = document.createElement('input');
            characterThumbnailDelete.type = "button";
            characterThumbnailDelete.className = "character_thumbnail_delete";
            characterThumbnailDelete.value = "SUPPRIMER";
            // Create a custom data parameter so that we can delete the correct character when clicking on each button (hence why we use the index as ID). 
            characterThumbnailDelete.dataset.charID = character.charID;
            // When a delete button is clicked, delete the relevent character sheet.
            characterThumbnailDelete.onclick = (self) => {
                // Remove the character from the parsed character list.
                delete charactersList[self.target.dataset.charID];
                // Remove the character thumbnail.
                characterThumbnailContainer.remove();
                // Refresh the localStorage with the new Data.
                localStorage.setItem('charactersList', JSON.stringify(charactersList));
                // Refresh the page to apply change
                SelectionMenuPage(MAINCONTAINER, CHARSHEETFORMAT);
            };

            // Append everything to the containers.
            characterThumbnailContainer.appendChild(characterThumbnail);
            characterThumbnailContainer.appendChild(characterThumbnailDelete);
            CONTAINERTHUMBNAILSPERSOS.appendChild(characterThumbnailContainer);
        });
    };
    // ------------------------------------------------ ITEMS ------------------------------------------------
    // Fetch the list of items.
    var itemsList = JSON.parse(localStorage.getItem('itemsList'));
    console.log(itemsList)
    // itemsList = null
    // localStorage.setItem('itemsList', JSON.stringify(itemsList));
    // If there are any items :
    if (itemsList != null) {
        // For every item, create a div 
        Object.keys(itemsList).forEach(i =>{
            let item = itemsList[i];
            // We'll encapsulate everything in a div so as to add sub buttons like "delete specific item".
            let itemThumbnailContainer = document.createElement('div');
            itemThumbnailContainer.className = "item_thumbnail_container";

            // Get item type compatible with the url.
            let itemTypeUrl = (item.itemType == "Objet Magique Majeur") ? '#Enchanting_major.'
                            : (item.itemType == "Objet Magique Mineur") ?  '#Enchanting_minor.'
                            : (item.itemType == "Objet Magique à Charges") ? '#Enchanting_charge.'
                            : '#ERROR';

            // Create a thumbnail button element.
            let itemThumbnail = document.createElement('input');
            itemThumbnail.type = "button";
            itemThumbnail.className = "item_thumbnail";
            itemThumbnail.value = item.itemName + '\n' + item.itemType;
            // Create a custom data parameter in each thumbnail elements so that we can load the correct item when clicking on each button (hence why we use the index as ID). 
            itemThumbnail.dataset.itemID = item.itemID;
            itemThumbnail.dataset.manufacturerID = item.manufacturerID;
            // When a item button is clicked, go to this item sheet.
            itemThumbnail.onclick = (self) => {
                // Change the hash to show the page of the clicked thumbnail's ID
                window.location.hash = 'CharacterNumber' + self.target.dataset.manufacturerID + itemTypeUrl + self.target.dataset.itemID;
            };

            // Create the delete button.
            let itemThumbnailDelete = document.createElement('input');
            itemThumbnailDelete.type = "button";
            itemThumbnailDelete.className = "item_thumbnail_delete";
            itemThumbnailDelete.value = "SUPPRIMER";
            // Create a custom data parameter so that we can delete the correct item when clicking on each button (hence why we use the index as ID). 
            itemThumbnailDelete.dataset.itemID = item.itemID;
            // When a delete button is clicked, delete the relevent item sheet.
            itemThumbnailDelete.onclick = (self) => {
                // Remove the item from the parsed item list.
                delete itemsList[self.target.dataset.itemID];
                // Remove the item thumbnail.
                itemThumbnailContainer.remove();
                // Refresh the localStorage with the new Data.
                localStorage.setItem('itemsList', JSON.stringify(itemsList));
                // Refresh the page to apply change
                SelectionMenuPage(MAINCONTAINER, CHARSHEETFORMAT);
            };

            // Append everything to the containers.
            itemThumbnailContainer.appendChild(itemThumbnail);
            itemThumbnailContainer.appendChild(itemThumbnailDelete);
            CONTAINERTHUMBNAILSITEMS.appendChild(itemThumbnailContainer);
        });
    };
    // -----------------------------------------------------
    // Append the + button after the thumbnails, it's about aesthetic.
    CONTAINERTHUMBNAILSPERSOS.appendChild(ADDPERSOBOUTON);
    // And finally append this page's container and the other button to the main, global container.
    MAINCONTAINER.appendChild(RESETBUTTON);
    MAINCONTAINER.appendChild(CONTAINERTHUMBNAILSPERSOS);
    MAINCONTAINER.appendChild(CONTAINERTHUMBNAILSSEPARATOR);
    MAINCONTAINER.appendChild(CONTAINERTHUMBNAILSITEMS);

    // -----------------------------------------------------
    // When the add button is clicked, add a character.
    ADDPERSOBOUTON.onclick = () => {
        // Make sure the current character list is loaded, in case we deleted an entry prior. 
        var charactersList = JSON.parse(localStorage.getItem('charactersList'));
        let lastCharID = 0;
        // If its empty, in other words, if this character is the first created or if others have been deleted :
        if (charactersList == null || Object.keys(charactersList).length <= 0){
            // Instantiate the local storage variable by assigning an empty pattern to the "0" id key.
            charactersList = {[lastCharID]: CHARSHEETFORMAT};
        } else {
            // Otherwise, we'll assign a new key for the new character by finding the biggest attributed key to date and adding 1.
            lastCharID = Math.max(...Object.keys(charactersList).map(i => parseInt(i))) + 1;
            charactersList[lastCharID] = CHARSHEETFORMAT;
            charactersList[lastCharID].charID = lastCharID;
        };
        // Save the new charactersList in local storage.
        localStorage.setItem('charactersList', JSON.stringify(charactersList));
        // Change the hash to the character ID to instantly go to its page.
        window.location.hash = 'CharacterNumber' + lastCharID;
    };

    // Create a button to reset the local data.
    RESETBUTTON.onclick = () => {
        localStorage.clear();
        window.location.hash = 'launch';
        window.location.hash = '';
    };
}