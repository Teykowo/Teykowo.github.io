export function EnchantmentButtons(){
    // Get the global container for the laboratory elements, so as to put the button right bellow them.
    const CONTAINERFICHELABO = document.getElementById('container_fiche_labo');

    // Create a div to hold all the enchantment option buttons.
    const CONTAINERENCHANTREDIRECTBUTTONS = document.createElement('div');
    CONTAINERENCHANTREDIRECTBUTTONS.id = "container_enchant_redirect_buttons";

    // Create the buttons.
    const MAJORENCHANTREDIRECTBUTTON = document.createElement('input');
    MAJORENCHANTREDIRECTBUTTON.type = "button";
    MAJORENCHANTREDIRECTBUTTON.className = "enchant_redirect_buttons";
    MAJORENCHANTREDIRECTBUTTON.value = "Create\nMajor\nEnchanted\nItem";

    const MINORENCHANTREDIRECTBUTTON = document.createElement('input');
    MINORENCHANTREDIRECTBUTTON.type = "button";
    MINORENCHANTREDIRECTBUTTON.className = "enchant_redirect_buttons";
    MINORENCHANTREDIRECTBUTTON.value = "Create\nMinor\nEnchanted\nItem";

    const CHARGEENCHANTREDIRECTBUTTON = document.createElement('input');
    CHARGEENCHANTREDIRECTBUTTON.type = "button";
    CHARGEENCHANTREDIRECTBUTTON.className = "enchant_redirect_buttons";
    CHARGEENCHANTREDIRECTBUTTON.value = "Create\nCharge\nEnchanted\nItem";


    // Append the divs to their relative, overaching container.
    CONTAINERENCHANTREDIRECTBUTTONS.appendChild(MAJORENCHANTREDIRECTBUTTON);
    CONTAINERENCHANTREDIRECTBUTTONS.appendChild(MINORENCHANTREDIRECTBUTTON);
    CONTAINERENCHANTREDIRECTBUTTONS.appendChild(CHARGEENCHANTREDIRECTBUTTON);
    CONTAINERFICHELABO.appendChild(CONTAINERENCHANTREDIRECTBUTTONS);

    // Create a function that generates an entry to be filled letter in the list of items.
    function GenerateEmptyItemListEntry() {
        // ------------------------ COPIED FROM CHARACTER LOADER ------------------------
        // Make sure the current item list is loaded, in case we deleted an entry prior. 
        var itemsList = JSON.parse(localStorage.getItem('itemsList'));
        let lastItemID = 0;
        // If its empty, in other words, if this item is the first created or if others have been deleted :
        if (itemsList == null || Object.keys(itemsList).length <= 0){
            // Instantiate the local storage variable by assigning a blank value to the "0" id key.
            itemsList = {[lastItemID]: null};
        } else {
            // Otherwise, we'll assign a new key for the new item by finding the biggest attributed key to date and adding 1.
            lastItemID = Math.max(...Object.keys(itemsList).map(i => parseInt(i))) + 1;
        };
        // Save the new itemsList in local storage.
        localStorage.setItem('itemsList', JSON.stringify(itemsList));
        // ------------------------------------------------------------------------------
        // Return the ID.
        return lastItemID;
    }
    

    // On click, changes the hash to add the "enchanting" tag after the character id, add the enchantment type and ID.
    MAJORENCHANTREDIRECTBUTTON.onclick = () => {
        let lastItemID = GenerateEmptyItemListEntry();
        window.location.hash += '#Enchanting_major.' + lastItemID;
    };
    MINORENCHANTREDIRECTBUTTON.onclick = () => {
        let lastItemID = GenerateEmptyItemListEntry();
        window.location.hash += '#Enchanting_minor.' + lastItemID;
    };
    CHARGEENCHANTREDIRECTBUTTON.onclick = () => {
        let lastItemID = GenerateEmptyItemListEntry();
        window.location.hash += '#Enchanting_charge.' + lastItemID;
    };

    
};