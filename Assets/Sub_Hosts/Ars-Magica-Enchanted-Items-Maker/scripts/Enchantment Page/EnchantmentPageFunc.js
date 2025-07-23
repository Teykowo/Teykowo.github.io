import {CreateInput} from './Enchantment Page Functions/CreateInput.js';
import {CalcItemVisCostAndPotential, ExtendModifierDescriptionListenerAdder, CalcEnchantmentTotalLvl, CalcEnchantmentVisCost, CalcLabTotal, CalcEffectiveLabTotal, CalcEnchantmentCharges} from './Enchantment Page Functions/EnchantmentComputingFunctions.js';

export function EnchantmentPage(MAINCONTAINER, id, ITEMSHEETFORMAT, ITEMENCHANTSFORMAT, ITEMENCHANTSSEASONFORMAT, ENCHANTEMENTOPTIONLISTS){
    // Reset/clear the page's html, so as to not append to an already existing page.
    MAINCONTAINER.innerHTML = '';
    // Fetch the relevent character.
    var charactersList = JSON.parse(localStorage.getItem('charactersList'));
    let character = charactersList[id];

    // Get the item data like type and id from the url.
    let itemURLData = window.location.hash.split('#Enchanting_')[1];
    let itemType = itemURLData.split('.')[0];
    let itemID = itemURLData.split('.')[1];

    // Create the item and assign it to the item list.
    // If the item is new, initialize it, otherwise, load it.
    let itemsList = JSON.parse(localStorage.getItem('itemsList'));
    let itemSheet = structuredClone(ITEMSHEETFORMAT);
    if (itemsList[itemID] == null) {
        itemSheet.manufacturerName = character.charName;
        itemSheet.manufacturerID = id;
        itemsList[itemID] = itemSheet;
        itemsList[itemID].itemID = itemID;
    } else {
        itemSheet = itemsList[itemID];
    }
    // --------------------------------------------- Generate the HTML ---------------------------------------------
    // -------------------------------------------- CARDS --------------------------------------------
    // Global container.
    const CONTAINERITEM = document.createElement('div');
    CONTAINERITEM.id = "container_item";
    // Item card with its border this will contain all of the item and enchant data blocks.
    const ITEMCARD = document.createElement('div');
    ITEMCARD.id = "item_card";
    // Append elements to display them.
    CONTAINERITEM.appendChild(ITEMCARD);
    MAINCONTAINER.appendChild(CONTAINERITEM);

    function DestroyedItemModifiers() {
        // If the item is shown as destroyed, change the background and show a big text, also diseable all inputs.
        if (itemSheet.itemIsDestroyed) {
            document.body.style.backgroundColor = '#dd7e6a';
            const DESTROYEDTEXT = document.createElement('h1');
            DESTROYEDTEXT.textContent = 'DESTROYED';
            DESTROYEDTEXT.className = 'destroyed_text';
            ITEMCARD.appendChild(DESTROYEDTEXT);

            Array.from(document.getElementsByTagName('input')).forEach(input => {
                input.disabled = true;
            })
            Array.from(document.getElementsByTagName('select')).forEach(input => {
                input.disabled = true;
            })
            Array.from(document.getElementsByTagName('textarea')).forEach(input => {
                input.disabled = true;
            })
        }
    }
    // -----------------------------------------------------------------------------------------------

    // ------------------------------------------ ITEM DATA ------------------------------------------
    // We use a specific div to hold the item data.
    const ITEMINFO = document.createElement('div');
    ITEMINFO.id = "item_info";

    // Create the text entry for the item's name, we store the label and input elements since we'll change the label depending on item type.
    let itemName = CreateInput('text', ITEMINFO, "Nom de l'Objet", itemSheet, ['itemName']);
    CreateInput('text', ITEMINFO, 'Nom du Créateur', itemSheet, ['manufacturerName']);

    // For Major and Minor enchants only :
    if (itemType == 'major') {
        // Create the shape and size select inputs that will define the vis cost.
        let mat = CreateInput('select', ITEMINFO, "Materiel de L'Objet", itemSheet, ['itemMaterial'], ENCHANTEMENTOPTIONLISTS["ITEMMATERIALS"]);
        let size = CreateInput('select', ITEMINFO, "Taille de L'Objet", itemSheet, ['itemSize'], ENCHANTEMENTOPTIONLISTS["ITEMSIZES"]);
        // Create the text element that will display the results of the contemplation.
        const ITEMVISCOSTANDPOTENTIALTEXT = document.createElement('h4');
        ITEMINFO.appendChild(ITEMVISCOSTANDPOTENTIALTEXT);
        // For each of the two input elements (second entry in the lists returned by the input creation function) :
        [mat[1], size[1]].forEach(elem =>{
            // Create an event listener that will call the function to update the text everytime the selection changes.
            elem.addEventListener('change', (e) => {
                let itemVisCostAndPotential = CalcItemVisCostAndPotential(ITEMVISCOSTANDPOTENTIALTEXT, mat, size, character);
                itemSheet.itemVisCostAndPotential = itemVisCostAndPotential;
                // We also need to update every effect cards, so we trigger a change in each of them to recompute the relevant sections.
                let enchantCardsList = document.getElementsByClassName('enchant_card');
                for (let i = 0; i < enchantCardsList.length; i++) {
                    let enchantCard = enchantCardsList[i];
                    // We pick the first number input for the even trigger, which is in the first "number" classname div, and is the first "input" tag element.
                    let updateTriggering = enchantCard.getElementsByClassName('number')[0].getElementsByTagName('input')[0];
                    updateTriggering.dispatchEvent(new Event('change'));   
                }
            })
        });
        // Trigger the event to initialize the text.
        mat[1].dispatchEvent(new Event("change"));
    };

    CreateInput('select', ITEMINFO, "Forme de L'Objet", itemSheet, ['itemShapeBonus'], ENCHANTEMENTOPTIONLISTS["ITEMSHAPEANDMATERIALBONUSES"]);
    CreateInput('select', ITEMINFO, "Bonus de Materiel de L'Objet", itemSheet, ['itemMaterialBonus'], ENCHANTEMENTOPTIONLISTS["ITEMSHAPEANDMATERIALBONUSES"]);
    CreateInput('textarea', ITEMINFO, "Description de L'Objet", itemSheet, ['itemDescription']);

    ITEMCARD.appendChild(ITEMINFO);
    // -----------------------------------------------------------------------------------------------

    // ------------------------------------- TYPE DEPENDANT STUFF ------------------------------------
    switch (itemType) {
        case "major":
            itemSheet.itemType = "Objet Magique Majeur";
            itemName[0].innerText = "Nom de l'Objet Enchanté Majeur :"

            // Only for major objects, add a button to add a new effect.
            const NEWENCHANT = document.createElement('input');
            NEWENCHANT.type = "button";
            NEWENCHANT.id = "new_enchant_button";
            NEWENCHANT.value = "NOUVEL\nEFFET";

            NEWENCHANT.onclick = function(){
                AddEnchantment();
            };

            // Change the div width on non-major items.
            ITEMCARD.appendChild(NEWENCHANT);
            break;
    
        case "minor":
            itemSheet.itemType = "Objet Magique Mineur";
            itemName[0].innerText = "Nom de l'Objet Enchanté Mineur :"
            ITEMCARD.style.width = "57rem";

            break;

        case "charge":
            itemSheet.itemType = "Objet Magique à Charges";
            itemName[0].innerText = "Nom de l'Objet Enchanté à Charges:"
            ITEMCARD.style.width = "57rem";

            break;

        default:
            break;
    };
    // -----------------------------------------------------------------------------------------------

    // -------------------------------------- ENCHANTMENT DATA ---------------------------------------
    const ENCHANTCARDHOLDER = document.createElement('div');
    ENCHANTCARDHOLDER.id = "enchant_card_holder"
    // If the button exists, place the card before it.
    try {
        ITEMCARD.insertBefore(ENCHANTCARDHOLDER, document.getElementById('new_enchant_button'))
    } catch (error) {
        ITEMCARD.appendChild(ENCHANTCARDHOLDER);
    }

    // The enchant card holds all of the enchant data blocks, we can have many in the case of major enchanted items, so we encapsulate all inside a function.
    // The generated inputs should be linked to the correct enchantment so we must sync the html to the object using the ID of the enchant as index.
    function AddEnchantment(firstEnchant, enchantPreset) {
        // firstEnchant is a boolean defining whether this enchant is the one generated by default.
        // Create the card element.
        const ENCHANTCARD = document.createElement('div');
        ENCHANTCARD.className = "enchant_card";
        // Create a copy of the enchantment table if it's a new enchantment, otherwise load the given object.
        let enchantmentSheet = enchantPreset ? enchantPreset : structuredClone(ITEMENCHANTSFORMAT);
        // First thing to do is set the enchantment ID, that we'll use to identify it and store it in the object's "enchantments" sub-table.
        // If this is the first enchant, aka the one generated by default, it should have the 0 index, and shouldn't generate a delete button.
        // In case of an already exisiting enchantment, we set the ID to be it's already defined one.
        let enchantID = enchantPreset ? enchantPreset.enchantID : 0;
        // ------------------- Generate ID and Delete Button ------------------
        if (!firstEnchant) {
            // If this enchant is new, generate a new ID, otherwise use the one defined previously.
            if (!enchantPreset) {
                enchantID = Math.max(...Object.keys(itemSheet.enchantments).map(i => parseInt(i))) + 1;
            };
            // Create the delete button.
            let enchantDeleteButton = document.createElement('input');
            enchantDeleteButton.type = "button";
            enchantDeleteButton.className = "enchant_delete_button";
            enchantDeleteButton.value = "❌";
            // Create a custom data parameter so that we can delete the correct enchant when clicking on each button (hence why we use the index as ID). 
            enchantDeleteButton.dataset.enchantID = enchantID;
            // When a delete button is clicked, delete the relevent enchantment card.
            enchantDeleteButton.onclick = (self) => {
                // Remove the enchant from the enchant table.
                delete itemSheet.enchantments[self.target.dataset.enchantID];
                // Remove the enchant card.
                ENCHANTCARD.remove();
                // change the size back to its original setting if we're back to one enchant only.
                if (Object.keys(itemSheet.enchantments).length <= 1) {
                    ENCHANTCARDHOLDER.style.width = "fit-content";
                };
                // Update items list.
                let itemsList = JSON.parse(localStorage.getItem('itemsList'));
                itemsList[itemSheet.itemID] = itemSheet;
                localStorage.setItem('itemsList', JSON.stringify(itemsList));
            };
            ENCHANTCARD.appendChild(enchantDeleteButton);
        }
        // Assign the ID to the enchantment.
        enchantmentSheet.enchantID = enchantID;
        itemSheet.enchantments[enchantID] = enchantmentSheet;
        // --------------------------------------------------------------------
        // We encapsulate the base lvl, total lvl, vis cost and charge count in a div to have them on one line.
        const LVLDATAHOLDER = document.createElement('div');
        LVLDATAHOLDER.className = "enchant_sub_div"
        ENCHANTCARD.appendChild(LVLDATAHOLDER);
        const BASELVLELEM = CreateInput('number', LVLDATAHOLDER, "Niveau de Base : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantBaseLvl']);
        const ENCHANTTOTALLVLTEXT = document.createElement('h4');
        LVLDATAHOLDER.appendChild(ENCHANTTOTALLVLTEXT);
        // If charged item, add the charge count text.
        if (itemSheet.itemType == "Objet Magique à Charges") {
            const ENCHANTCHARGESTEXT = document.createElement('h4');
            ENCHANTCHARGESTEXT.className = "enchant_charges_text";
            ENCHANTCHARGESTEXT.textContent = `Nombre de Charges : ${enchantmentSheet.enchantCharges} |`;
            LVLDATAHOLDER.appendChild(ENCHANTCHARGESTEXT);
        }
        const ENCHANTVISCOSTTEXT = document.createElement('h4');
        LVLDATAHOLDER.appendChild(ENCHANTVISCOSTTEXT);
        // Add the enchant ID to the updateable element so as to only enable/disable the correct buttons each time.
        ENCHANTVISCOSTTEXT.dataset.enchantID = enchantID;

        const DAILYUSEELEM = CreateInput('select', ENCHANTCARD, "Usage Journalier Max : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantDailyUseCap'], ENCHANTEMENTOPTIONLISTS["ENCHANTDAILYUSECAPS"]);
        
        const REACHELEM = CreateInput('select', ENCHANTCARD, "Portée (+magnitude) : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantRange'], ENCHANTEMENTOPTIONLISTS["ENCHANTRANGES"]);
        const DURATIONELEM = CreateInput('select', ENCHANTCARD, "Durée (+magnitude) : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantDuration'], ENCHANTEMENTOPTIONLISTS["ENCHANTDURATIONS"]);
        const TARGETELEM = CreateInput('select', ENCHANTCARD, "Cible (+magnitude) : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantTarget'], ENCHANTEMENTOPTIONLISTS["ENCHANTTARGETS"]);
        
        // We encapsulate the techniques and forms in a div to have them on one line.
        const TECHANDFORMHOLDER = document.createElement('div');
        TECHANDFORMHOLDER.className = "enchant_sub_div"
        ENCHANTCARD.appendChild(TECHANDFORMHOLDER);
        const TECHELEM = CreateInput('select', TECHANDFORMHOLDER, "Technique : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantTechnique'], ENCHANTEMENTOPTIONLISTS["ENCHANTTECHNIQUES"]);
        const FORMAELEM = CreateInput('select', TECHANDFORMHOLDER, "Forme 1 : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantForm1'], ENCHANTEMENTOPTIONLISTS["ENCHANTFORMS"]);
        let supplementList = [''].concat(ENCHANTEMENTOPTIONLISTS["ENCHANTFORMS"].concat(ENCHANTEMENTOPTIONLISTS["ENCHANTTECHNIQUES"]));
        const SUPPELEM = CreateInput('select', TECHANDFORMHOLDER, "Supplément : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantSupp'], supplementList);
        
        const PENEMODELEM = CreateInput('number', ENCHANTCARD, "Modificateur de Pénétration (+1/2 Points) : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantPenetrationMod']);
        const CONCMODELEM = CreateInput('checkbox', ENCHANTCARD, "Concentration Auto-Maintenue (+5) : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantConcentrationMod']);
        const EXPMULELEM = CreateInput('select', ENCHANTCARD, "Expiration d'effet : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantExpirationMod'], ENCHANTEMENTOPTIONLISTS["ENCHANTEXPIRATIONMODS"]);
        
        // The next three modifiers are checkboxes who extend a text area when checked, so we hide the textarea elements by default and use an event listener.
        const UEMODELEM = CreateInput('checkbox', ENCHANTCARD, "Utilisation d'effet (+3) : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantLimitedUsersMod']);
        const DESCRUEMODELEM = CreateInput('textarea', ENCHANTCARD, "Déscription Utilisation d'effet : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantLimitedUsersList']);
        DESCRUEMODELEM[0].style.display = "none"
        DESCRUEMODELEM[1].style.display = "none"
        ExtendModifierDescriptionListenerAdder(UEMODELEM, DESCRUEMODELEM);
        
        const DEMODELEM = CreateInput('checkbox', ENCHANTCARD, "Déclencheur environnemental (+3) : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantEnvTriggerMod']);
        const DESCRDEMODELEM = CreateInput('textarea', ENCHANTCARD, "Déscription Déclencheur environnemental : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantEnvTriggerCondition']);
        DESCRDEMODELEM[0].style.display = "none"
        DESCRDEMODELEM[1].style.display = "none"
        ExtendModifierDescriptionListenerAdder(DEMODELEM, DESCRDEMODELEM);
        
        const DLMODELEM = CreateInput('checkbox', ENCHANTCARD, "Déclencheur à lien (+3) : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantLinkedTriggerMod']);
        const DESCRDLMODELEM = CreateInput('textarea', ENCHANTCARD, "Déscription Déclencheur à lien : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantLinkedTriggerCondition']);
        DESCRDLMODELEM[0].style.display = "none"
        DESCRDLMODELEM[1].style.display = "none"
        ExtendModifierDescriptionListenerAdder(DLMODELEM, DESCRDLMODELEM);
        
        const DESCRENCHANTELEM = CreateInput('textarea', ENCHANTCARD, "Déscription de l'Enchantement : ", itemSheet, ['enchantments', enchantID.toString(), 'enchantDescription']);
    
        // Every time a datapoint of the enchantment is updated, we also update the total lvl of the enchantment, as well as the cost in vis in the case of minor and major items.
        [BASELVLELEM, DAILYUSEELEM, REACHELEM, DURATIONELEM, TARGETELEM, SUPPELEM, PENEMODELEM, CONCMODELEM, EXPMULELEM, UEMODELEM, DEMODELEM, DLMODELEM ].forEach(elem => {
            elem[1].addEventListener('change', (e) => {
                let totalLvl = CalcEnchantmentTotalLvl(ENCHANTTOTALLVLTEXT, enchantmentSheet);
                enchantmentSheet.enchantTotalLvl = totalLvl;
                if (itemType != "charge") {
                    let enchVisCost = CalcEnchantmentVisCost(ENCHANTVISCOSTTEXT, totalLvl, character, itemSheet, itemType);
                    enchantmentSheet.enchantVisCost = enchVisCost;
                }
            });
        });
        // Trigger the events to initialize the text.
        BASELVLELEM[1].dispatchEvent(new Event("change"));
        
        // Create the button that triggers the season of enchanting.
        const SPENDSEASON = document.createElement('input');
        SPENDSEASON.type = "button";
        SPENDSEASON.className = "spend_season_button";
        // Change the message of the enchant button depending on whether the effect is already fully imbued or not.
        if (enchantmentSheet.enchanted) {
            SPENDSEASON.value = "Effet Enchanté!";
        } else {
            SPENDSEASON.value = "Passer une Saison à Enchanter!";
        };
        // Add the enchant ID to the button so as to only enable/disable the correct one each time.
        SPENDSEASON.dataset.enchantID = enchantID;

        const SPENTSEASONSCOUNTER = document.createElement('h4');
        SPENTSEASONSCOUNTER.className = "spent_seasons_text";
        let seasonCount = Object.keys(enchantmentSheet.seasonsSpent).length;
        SPENTSEASONSCOUNTER.textContent = `Saisons Passées à Enchanter : ${seasonCount}`;

        // If the item is already enchanted, disable the ''spend season'' button.
        if (enchantmentSheet.enchanted == true) {
            SPENDSEASON.disabled = true;
        };

        SPENDSEASON.onclick = function(){
            AddSeason(enchantID, itemSheet, character);
        };

        // Create a disabled text area containing the summary of all seasons.
        const SEASONSUMMARYFIELDLABEL = document.createElement('label');
        const SEASONSUMMARYFIELD = document.createElement('textarea');
        SEASONSUMMARYFIELDLABEL.for = SEASONSUMMARYFIELD;
        SEASONSUMMARYFIELDLABEL.textContent = 'Résumé des Saisons :';
        SEASONSUMMARYFIELD.className = 'season_summary_field';
        SEASONSUMMARYFIELD.disabled = true;
        let seasonSummaryText = '';
        Object.keys(enchantmentSheet.seasonsSpent).forEach(seasonKey => {
            let currentSeason = enchantmentSheet.seasonsSpent[seasonKey];
            seasonSummaryText = seasonSummaryText.concat("", `Saison ${parseInt(seasonKey)+1} : \n`)
            Object.keys(currentSeason).forEach(seasonObjectkey => {
                // Give a special look to every entry for clearer summary.
                switch (seasonObjectkey) {
                    case 'labTotal':
                        seasonSummaryText = seasonSummaryText.concat("", `- Total de Laboratoire Généré : ${JSON.stringify(currentSeason[seasonObjectkey])}. \n`)
                        break;
                    case 'effectiveLabTotal':
                        seasonSummaryText = seasonSummaryText.concat("", `- Total de Progression : ${JSON.stringify(currentSeason[seasonObjectkey])}/${JSON.stringify(enchantmentSheet['enchantTotalLvl'])} (Niveau de L'Effet). \n\n`)
                    break;
                    case 'applicableContextualVertuesAndFlaws':
                        seasonSummaryText = seasonSummaryText.concat("", `- Vertues/Vices Utilisés : \n`)
                        // Iterate over all the vertues and flaws, those that were used have a value of "true", we display them as a list.
                        Object.keys(currentSeason[seasonObjectkey]).forEach(vertueOrFlaw => {
                            if (currentSeason[seasonObjectkey][vertueOrFlaw]) {
                                seasonSummaryText = seasonSummaryText.concat("", `  · ${vertueOrFlaw}. \n`)
                            }
                        });
                    break;
                    case 'applicableCraft':
                        seasonSummaryText = seasonSummaryText.concat("", `\n- Artisanat Utilisé : ${currentSeason[seasonObjectkey] ? currentSeason[seasonObjectkey] : "Aucun"}. \n\n`)
                    break;
                    case 'applicableShape':
                        seasonSummaryText = seasonSummaryText.concat("", `- Bonus de Forme Utilisés : \n`)
                        Object.keys(currentSeason[seasonObjectkey]).forEach(shape => {
                            if (currentSeason[seasonObjectkey][shape]) {
                                seasonSummaryText = seasonSummaryText.concat("", `  · ${shape}. \n`)
                            }
                        });
                    break;
                    case 'applicableMaterial':
                        seasonSummaryText = seasonSummaryText.concat("", `\n- Bonus de Matériel Utilisés : \n`)
                        Object.keys(currentSeason[seasonObjectkey]).forEach(material => {
                            if (currentSeason[seasonObjectkey][material]) {
                                seasonSummaryText = seasonSummaryText.concat("", `  · ${material}. \n`)
                            }
                        });
                    break;
                    case 'assistantIntBonus':
                        seasonSummaryText = seasonSummaryText.concat("", `\n- Inteligence de L'Assistant : ${currentSeason[seasonObjectkey]}. \n`)
                    break;
                    case 'assistantTheoryBonus':
                        seasonSummaryText = seasonSummaryText.concat("", `- Théorie de la Magie de L'Assistant : ${currentSeason[seasonObjectkey]}. \n`)
                    break;
                    case 'similarSpellBonus':
                        seasonSummaryText = seasonSummaryText.concat("", `- Bonus de Sort Similaire : ${currentSeason[seasonObjectkey]}. \n`)
                    break;
                    case 'similarObjectBonus':
                        seasonSummaryText = seasonSummaryText.concat("", `- Bonus d'Objet Similaire : ${currentSeason[seasonObjectkey]}. \n`)
                    break;
                    case 'similarEnchantmentBonus':
                        seasonSummaryText = seasonSummaryText.concat("", `- Bonus d'Enchantement Similaire : ${currentSeason[seasonObjectkey]}. \n`)
                    break;
                    case 'additionalBonuses':
                        seasonSummaryText = seasonSummaryText.concat("", `- Bonus Additionnels : ${currentSeason[seasonObjectkey]}. \n`)
                    break;
                    case 'experimentedBool':
                        // If this boolean is true, then manually setup the experimentation summary block, the cases for those keys in the switch can be discared.
                        if (currentSeason[seasonObjectkey]){
                            seasonSummaryText = seasonSummaryText.concat("", `\n- Résultats de l'Expérimentation :  \n`)

                            seasonSummaryText = seasonSummaryText.concat("", `  · Facteur de Risque : ${currentSeason.experimentationRiskFactor}. \n`)
                            seasonSummaryText = seasonSummaryText.concat("", `  · Bonus de L'Expérimentation : ${currentSeason.experimentationBonusResult}. \n`)
                            seasonSummaryText = seasonSummaryText.concat("", `  · Jets sur la Table des Résultats Extraordinaires : ${Array.from(currentSeason.experimentationExtraordinaryRollsResults).join(', ')}. \n`)
                            if (currentSeason.experimentationDisasterCheckRollsResults.length > 0) {
                                seasonSummaryText = seasonSummaryText.concat("", `  · Jets de Confirmation de Désastre : ${Array.from(currentSeason.experimentationDisasterCheckRollsResults).join(', ')}. \n`)
                            }
                            if (currentSeason.experimentationDisasterTableRollsResults.length > 0) {
                                seasonSummaryText = seasonSummaryText.concat("", `  · Jets sur la Table des Désastres : ${Array.from(currentSeason.experimentationDisasterTableRollsResults).join(', ')}. \n`)
                            }
                            if (currentSeason.experimentationSecondaryEffectCasesResults.length > 0) {
                                seasonSummaryText = seasonSummaryText.concat("", `  · Jets sur la Table des Effets Secondaires : ${Array.from(currentSeason.experimentationSecondaryEffectCasesResults).join(', ')}. \n`)
                            }
                            if (currentSeason.experimentationDiscoveryCasesResults.length > 0) {
                                seasonSummaryText = seasonSummaryText.concat("", `  · Jets sur la Table des Découvertes : ${Array.from(currentSeason.experimentationDiscoveryCasesResults).join(', ')}. \n`)
                            }
                            if (currentSeason.experimentationModifiedEffectCasesResults.length > 0) {
                                seasonSummaryText = seasonSummaryText.concat("", `  · Jets sur la Table des Effets Modifiés : ${Array.from(currentSeason.experimentationModifiedEffectCasesResults).join(', ')}. \n`)
                            }
                            if (currentSeason.experimentationConsequences.length > 0) {
                                seasonSummaryText = seasonSummaryText.concat("", `  · Conséquences de L'Expérimentation : ${Array.from(currentSeason.experimentationConsequences).join(', ')} \n`)
                            } else {
                                seasonSummaryText = seasonSummaryText.concat("", `L'Expérimentation n'a pas résulté en des conséquences particulières. \n`)
                            }

                            
                            
                            
                            

                            
                            

                            
                            

                            
                            

                            

                            
                            
                            
                            
                            
                            
                        }
                    break;
                    default:
                        break;
                }
            });
            // Seperate the seasons.
            seasonSummaryText = seasonSummaryText.concat("", `-------------------------------------------\n`)
        });
        SEASONSUMMARYFIELD.textContent = seasonSummaryText;

        ENCHANTCARD.appendChild(SPENDSEASON);
        ENCHANTCARD.appendChild(SPENTSEASONSCOUNTER);
        ENCHANTCARD.appendChild(SEASONSUMMARYFIELDLABEL);
        ENCHANTCARD.appendChild(SEASONSUMMARYFIELD);
        ENCHANTCARDHOLDER.appendChild(ENCHANTCARD);

        // Change the size of the holder depending on the number of enchantments.
        if (Object.keys(itemSheet.enchantments).length >= 2) {
            ENCHANTCARDHOLDER.style.width = "64rem"
        };
    };

    // If there are already enchantments registered for this item, load them, otherwise create a new one.
    if (Object.keys(itemSheet.enchantments).length > 0) {
        // Create a var that starts at 1 and switch to 0 after the first enchantment.
        let firstEnchant = 1;
        // Iterate over the enchantments
        Object.keys(itemSheet.enchantments).forEach(key => {
            let currentToLoadEnchant = itemSheet.enchantments[key];
            // Add the enchantment based on the object to load.
            AddEnchantment(firstEnchant, currentToLoadEnchant);
            firstEnchant = 0;
            // If an enchant isn't finished, disable the ability to add a new one.
            if (currentToLoadEnchant.enchanted == false && itemSheet.itemType == "Objet Magique Majeur") {
                document.getElementById('new_enchant_button').disabled = true;
            }
        });
    } else {
        AddEnchantment(1);
    };
    // -----------------------------------------------------------------------------------------------
    
    // ----------------------------------------- SEASON DATA -----------------------------------------
    // Add a function to save the season.
    function SaveSeason(seasonSheet, enchantSheet, itemSheet, experimentationFailureState = false) {
        // Give the season and ID and store it in the enchant's list.
        seasonSheet.seasonID = Object.keys(enchantSheet.seasonsSpent).length;
        enchantSheet.seasonsSpent[seasonSheet.seasonID] = seasonSheet;

        // We only need to proceed if experimentation didn't cause a total failure, as it would otherwise remove any bonuses from failure or consequences of success :
        if (!experimentationFailureState) {
            // Charged items are a special case where it only needs an effective lab total above 0 to be effectively enchanted.
            if (itemSheet.itemType == "Objet Magique à Charges" && seasonSheet.effectiveLabTotal >= 0) {
                // Since it's a charge item, we only have one enchant, so pick the first element for the text.
                let txtelem = Array.from(document.getElementsByClassName("enchant_charges_text"))[0];
                // Get the number of charges obtained.
                let chargeCount = CalcEnchantmentCharges(txtelem, seasonSheet.effectiveLabTotal);
                // And switch the values in the enchant sheet, both for the number of charges, and as explained, the status as enchanted.
                enchantSheet.enchantCharges = chargeCount;
                enchantSheet.enchanted = true;
            // For any other enchant type, if the season fully inbued the effect (aka lab total >= 2*enchantment level, aka effective lab total > enchantment level) :
            } else if (seasonSheet.effectiveLabTotal >= enchantSheet.enchantTotalLvl - enchantSheet.leftoverFromLastSeasonMajorItems) {
                // Set the ''enchanted'' value to true, setting in stone the completion of this effect.
                enchantSheet.enchanted = true;
                // Reactivate the ''new enchant'' button if any.
                if (itemSheet.itemType == "Objet Magique Majeur") {
                    document.getElementById('new_enchant_button').disabled = false;
                };
            // If the effect was either partially inbued or entierly failed to be inbued :
            } else {
                // If the item is a major enchanted item, then we can save the results for a new season, unless the results where catastrophic.
                if (itemSheet.itemType == "Objet Magique Majeur") {
                    // We save the progress made (effective lab total), if any, so that the next season only has to complete the levels left to add to equal item lvl *2.
                    enchantSheet.leftoverFromLastSeasonMajorItems += seasonSheet.effectiveLabTotal;
                // If the item is a minor/charge item, then the season ends in simple failure.
                } else {
                    // Increase the bonus from failed season by 1.
                    enchantSheet.bonusFromFailedSeasons += 1;
                };
            };
        };
        // Update the localStorage with the new item state.
        let itemsList = JSON.parse(localStorage.getItem('itemsList'));
        itemsList[itemSheet.itemID] = itemSheet;
        localStorage.setItem('itemsList', JSON.stringify(itemsList));
        // Refresh the page.
        window.location.reload();
    };

    function AddSeason(enchantID, itemSheet, character) {
        // Create a season object for this season, we'll only add it to the list of seasons upon completion.
        // If a season's already been spent on this specific enchantment, use the relevant data from it as preset.
        // We also give the season it's ID, starting at 0.
        let seasonSheet = structuredClone(ITEMENCHANTSSEASONFORMAT);
        let seasonsList = Object.keys(itemSheet.enchantments[enchantID].seasonsSpent).length;
        if (seasonsList > 0) {
            let seasonPreset = itemSheet.enchantments[enchantID].seasonsSpent[0];
            // Set the relevent field given the preset.
            seasonSheet.applicableContextualVertuesAndFlaws = seasonPreset.applicableContextualVertuesAndFlaws;
            seasonSheet.applicableCraft = seasonPreset.applicableCraft;
            seasonSheet.applicableShape = seasonPreset.applicableShape;
            seasonSheet.applicableMaterial = seasonPreset.applicableMaterial;
            seasonSheet.experimentationRiskFactor = seasonPreset.experimentationRiskFactor;
            seasonSheet.assistantIntBonus = seasonPreset.assistantIntBonus;
            seasonSheet.assistantTheoryBonus = seasonPreset.assistantTheoryBonus;
            seasonSheet.similarSpellBonus = seasonPreset.similarSpellBonus;
            seasonSheet.similarObjectBonus = seasonPreset.similarObjectBonus;
            seasonSheet.similarEnchantmentBonus = seasonPreset.similarEnchantmentBonus;
            seasonSheet.additionalBonuses = seasonPreset.additionalBonuses;
            // Give the season an ID.
            seasonSheet.seasonID = seasonsList+1;
        } else {
            seasonSheet.seasonID = 0;
        }

        // Create the season popup/modal/dialog box that'll show the season form.
        const SEASONMODAL = document.createElement('dialog');
        SEASONMODAL.className = "season_modal";
        MAINCONTAINER.appendChild(SEASONMODAL);

        // Display the lab total and effective lab total in big at the top (we'll generate the text later but create the element now to position it).
        const SEASONLABTOTAL = document.createElement('h4');
        SEASONLABTOTAL.className = "season_lab_total";
        SEASONMODAL.appendChild(SEASONLABTOTAL);
        const SEASONEFFECTIVELABTOTAL = document.createElement('h4');
        SEASONEFFECTIVELABTOTAL.className = "season_effective_lab_total";
        SEASONMODAL.appendChild(SEASONEFFECTIVELABTOTAL);
        
        // Check for relevance of vertues and flaws.
        let charVertues = character.vertuesCharList;
        let charFlaws = character.vicesCharList;
        // Create a div to hold any of the following checkboxes.
        const VANDVBLOCK = document.createElement('div');
        VANDVBLOCK.id = 'v_and_v_season'
        // Create a title for the section and create every relevant checkbox.
        Object.keys(charVertues).forEach(key => {
            let vertueName = charVertues[key];
            if (['Expertise Magique Majeur', 'Expertise Magique Mineure', 'Étudiant Laborantin Adepte', 'Magie Cyclique (Positive)'].includes(vertueName)) {
                const [VERTUCHECKBOXLABEL, VERTUCHECKBOX] = CreateInput("checkbox", VANDVBLOCK, `${vertueName} : `, seasonSheet, ['applicableContextualVertuesAndFlaws', vertueName])
                // And it recalculates the lab total accordingly.
                VERTUCHECKBOX.addEventListener('change', (e) => {
                    let labTotal = CalcLabTotal(SEASONLABTOTAL, character, itemSheet.enchantments[enchantID], seasonSheet);
                    CalcEffectiveLabTotal(SEASONEFFECTIVELABTOTAL, labTotal, itemSheet.itemType, itemSheet.enchantments[enchantID], seasonSheet);
                    console.log(seasonSheet);
                });
            };                    
        });

        Object.keys(charFlaws).forEach(key => {
            let flawName = charFlaws[key];
            if (['Circonstances Délétères', 'Créativité Asséchée', 'Érudition Limitée', 'Magie Cyclique (Négative)', 'Arts Incompatibles'].includes(flawName)) {
                const [FLAWCHECKBOXLABEL, FLAWCHECKBOX] = CreateInput("checkbox", VANDVBLOCK, `${flawName} : `, seasonSheet, ['applicableContextualVertuesAndFlaws', flawName])
                // And it recalculates the lab total accordingly.
                FLAWCHECKBOX.addEventListener('change', (e) => {
                    let labTotal = CalcLabTotal(SEASONLABTOTAL, character, itemSheet.enchantments[enchantID], seasonSheet);
                    CalcEffectiveLabTotal(SEASONEFFECTIVELABTOTAL, labTotal, itemSheet.itemType, itemSheet.enchantments[enchantID], seasonSheet);
                });
            };
        });

        // If the user has any vertue/flaw, meaning if one or more have been added to the holder div :
        if (VANDVBLOCK.hasChildNodes()) {
            const VANDVSECTIONTITLE = document.createElement('h4');
            VANDVSECTIONTITLE.textContent = `VICES & VERTUES :`
            const VANDVSECTIONSUBTITLE = document.createElement('small');
            VANDVSECTIONSUBTITLE.textContent = `Cochez si Applicable.`
            SEASONMODAL.appendChild(VANDVSECTIONTITLE);
            SEASONMODAL.appendChild(VANDVSECTIONSUBTITLE);
            SEASONMODAL.appendChild(VANDVBLOCK);
        };

        // Create a title for the section containing other variables.
        const OTHERSECTIONTITLE = document.createElement('h4');
        OTHERSECTIONTITLE.textContent = `AUTRES :`
        SEASONMODAL.appendChild(OTHERSECTIONTITLE);
        // Check if verditius, if yes, then check for applicable craft values.
        if (character.house == 'Verditius') {
            // The user can select the applicable craft, if any.
            const [CRAFTCHECKBOXLABEL, CRAFTCHECKBOX] = CreateInput("select", SEASONMODAL, `Artisanat Compatible (Verditius) : `, seasonSheet, ['applicableCraft'], ['', 'Artisanat 1', 'Artisanat 2', 'Artisanat 3'])
            // And it recalculates the lab total accordingly.
            CRAFTCHECKBOX.addEventListener('change', (e) => {
                let labTotal = CalcLabTotal(SEASONLABTOTAL, character, itemSheet.enchantments[enchantID], seasonSheet);
                CalcEffectiveLabTotal(SEASONEFFECTIVELABTOTAL, labTotal, itemSheet.itemType, itemSheet.enchantments[enchantID], seasonSheet);
            });
        }
        
        // As well as that of shape and material bonuses.
        // First get the selected shape and material.
        let shapeBonus = itemSheet.itemShapeBonus;
        let materialBonus = itemSheet.itemMaterialBonus;
        // Make a function instead of copy pasting, with takes the bonus, its name and it's save spot in the season object.
        function GenerateShapeAndMaterialBonusApplicabilityOptions(bonus, bonusName, saveSpot) {
            // If there is a bonus selected in the first place :
            if (bonus) {
                // Split with ":" to get on one side the name of the shape/material and on the other, the list of possible bonuses.
                let bonusSplit = bonus.split(':');
                let bonusType = bonusSplit[0];
                // Create a div that will hold the label of the section and the list of possible bonuses.
                const SEASONBONUSHOLDER = document.createElement('div');
                SEASONBONUSHOLDER.className = "season_bonus_holder";
                SEASONMODAL.appendChild(SEASONBONUSHOLDER);
                // Create the label for the section, using both the bonus name and the specific name of the shape/material.
                const SEASONBONUSTITLE = document.createElement('h4');
                SEASONBONUSTITLE.textContent = `Bonus de ${bonusName} (${bonusType}) : `
                SEASONBONUSHOLDER.appendChild(SEASONBONUSTITLE);
                // Create a div to hold the list of possible bonuses offered by the selected option.
                const BONUSCHECKBOXESDIV = document.createElement('div');
                SEASONBONUSHOLDER.appendChild(BONUSCHECKBOXESDIV);
                // Split the list of bonuses at every comma.
                let bonusesList = bonusSplit[1].split(',');
                // And for every bonus, create a checkbox with label.
                for (let i = 0; i < bonusesList.length; i++) {
                    let selectedBonus = bonusesList[i];
                    let [BONUSCHECKBOXLABEL, BONUSCHECKBOX] = CreateInput("checkbox", BONUSCHECKBOXESDIV, `${selectedBonus}`, seasonSheet, [saveSpot, selectedBonus])
                    // We also re-compute the lab total after every change.
                    BONUSCHECKBOX.addEventListener('change', (e) => {
                        let labTotal = CalcLabTotal(SEASONLABTOTAL, character, itemSheet.enchantments[enchantID], seasonSheet);
                        CalcEffectiveLabTotal(SEASONEFFECTIVELABTOTAL, labTotal, itemSheet.itemType, itemSheet.enchantments[enchantID], seasonSheet);
                    });
                };
            };
        };
        GenerateShapeAndMaterialBonusApplicabilityOptions(shapeBonus, 'Forme', 'applicableShape');
        GenerateShapeAndMaterialBonusApplicabilityOptions(materialBonus, 'Matériau', 'applicableMaterial');

        // Ask for assistant's potential int and theory bonuses.
        const ASSISTANTHOLDER = document.createElement('div');
        ASSISTANTHOLDER.className = "assistant_holder";
        const SEASONASSISTINT = CreateInput("number", ASSISTANTHOLDER, "Intelligence de l'Assistant : ", seasonSheet, ['assistantIntBonus'])
        const SEASONASSISTMAGTHEORY = CreateInput("number", ASSISTANTHOLDER, "Théorie de la Magie de l'Assistant : ", seasonSheet, ['assistantTheoryBonus'])
        SEASONMODAL.appendChild(ASSISTANTHOLDER);

        // As well as for a potential similar spell bonus and similar object bonus.
        const SIMILARXHOLDER = document.createElement('div');
        const SEASONSIMILARSPELL = CreateInput("number", SIMILARXHOLDER, "Magnitude de Sort Similaire : ", seasonSheet, ['similarSpellBonus'])
        const SEASONSIMILARITEM = CreateInput("select", SIMILARXHOLDER, "Bonus d'Objet Similaire : ", seasonSheet, ['similarObjectBonus'], ENCHANTEMENTOPTIONLISTS["SIMILAROBJECTBONUSES"])
        const SEASONSIMILARENCHANT = CreateInput("number", SIMILARXHOLDER, "Bonus d'Enchantement Similaire : ", seasonSheet, ['similarEnchantmentBonus'])
        SEASONMODAL.appendChild(SIMILARXHOLDER);

        // Add a slot for potentially unacounted for bonuses.
        const SEASONSUPPBONUSES = CreateInput("number", SEASONMODAL, "Bonuses Supplémentaires : ", seasonSheet, ['additionalBonuses'])

        // ------------------------------ EXPERIMENTATION DATA -------------------------------
        // Add all the slots relating to experimentations
        const EXPERIMENTATIONSECTIONTITLE = document.createElement('h4');
        EXPERIMENTATIONSECTIONTITLE.textContent = `EXPERIMENTATION :`
        SEASONMODAL.appendChild(EXPERIMENTATIONSECTIONTITLE);
        let [EXPRISKFACTORLABEL, EXPRISKFACTOR] = CreateInput("number", SEASONMODAL, "Facteur de Risque : ", seasonSheet, ['experimentationRiskFactor'])
        EXPRISKFACTOR.max = 3;
        // This part is responsible for the d10 dice roller, it's this same one that we'll use for every roll.
        const DICEROLLERHOLDER = document.createElement('div');
        DICEROLLERHOLDER.id = 'dice_roller_holder';
        // Create the button that works as our dice. Next to it we add the current multiplier, that we'll update each crit.
        const D10DISPLAYBOXHOLDER = document.createElement('div');
        const D10DISPLAYBOX = document.createElement('input');
        D10DISPLAYBOX.type = 'button';
        const TOTALMULTIPLIER = document.createElement('h4');
        TOTALMULTIPLIER.textContent = 'x' + seasonSheet.experimentCurrentMultiplier;
        D10DISPLAYBOXHOLDER.appendChild(D10DISPLAYBOX);
        D10DISPLAYBOXHOLDER.appendChild(TOTALMULTIPLIER);
        DICEROLLERHOLDER.appendChild(D10DISPLAYBOXHOLDER);
        // Create an explanatory text under the button. It will change depending on why the user has to roll.
        const DICEROLLERHOLDERMSG = document.createElement('em');
        // We also add the bonus from "genie creatif" which states that it's +6 isntead of +3 in case experimentation is used.
        DICEROLLERHOLDERMSG.textContent = "Lancez le dé pour expérimenter!" + (Object.values(charVertues).includes('Génie Inventif') ? ' (Génie Inventif : +3).' : '');
        DICEROLLERHOLDER.appendChild(DICEROLLERHOLDERMSG);
        SEASONMODAL.appendChild(DICEROLLERHOLDER);
        // set the base number of rolls on the extraordinary table, it is doubled for a certain flaw.
        if (Object.values(character.vicesCharList).includes('Créativité Asséchée')) {
            seasonSheet.experimentationExtraordinaryRollsLeft *= 2;
        }
        // Create the button's function, it return a random int between 0 and 9, but also disables the validate button, as now the user needs to suffere the consequences of experimentation.
        D10DISPLAYBOX.onclick = function(){
            // We avoid spam and make sure everything happens in the right order by disabling the dice for one second after a roll.
            D10DISPLAYBOX.disabled = true;
            setTimeout(() => {
                // As long as there needs to be a new dice roll, re-enable the button.
                if (!D10DISPLAYBOX.dataset.disabledFinal) {
                    D10DISPLAYBOX.disabled = false;
                    console.log('d', D10DISPLAYBOX.dataset.disabledFinal)
                }
            }, 1010);
            // Experimentation has been used, so we change the boolean value (the bonus from "Génie Inventif" will automatically be set to +6).
            seasonSheet.experimentedBool = true;
            // Trigger event to set the lab total to date.
            SEASONSIMILARENCHANT[1].dispatchEvent(new Event("change"));
            // We also disable the validate button untill experimentation is over.
            document.getElementById("season_validate_button").disabled = true;
            // Generate the random value and set it for display.
            let expValue = Math.floor(Math.random() * 10);
            D10DISPLAYBOX.value = expValue;

            console.log('a', seasonSheet.experimentButtonState, expValue)
            console.log('b', seasonSheet.experimentationExtraordinaryRollsLeft, seasonSheet.experimentButtonState);

            // Create a function to add the risk factor animatedly and returning the result
            function RiskFactorAdder(currentValue) {
                // Create a text that hold the risk factor value, we slide it over the result to add it animatedly.
                let addedRiskFactor = document.createElement('p');
                addedRiskFactor.className = 'risk_factor_slide_indicator';
                addedRiskFactor.textContent = '+' + seasonSheet.experimentationRiskFactor;
                SEASONMODAL.appendChild(addedRiskFactor);
                let returnValue = currentValue + parseInt(seasonSheet.experimentationRiskFactor);
                // We udpate the text and remove the animated element once the animation is done.
                setTimeout(function(){
                    // We update the value here because it's usually the last thing added, it also means if we are to do any computation after, we'll have to set a one second timeout.
                    D10DISPLAYBOX.value = expValue;
                    addedRiskFactor.remove();
                }, 1000);
                return returnValue
            }

            // Depending on the state of experimentation, the button should have different effects.
            switch (seasonSheet.experimentButtonState) {
                
                // First use, run normally.
                case 0:
                    // In case of a crit, we reroll and double the value if it's another crit, we quadruple the next, etc...
                    if (expValue == 1) {
                        seasonSheet.experimentCurrentMultiplier *= 2;
                        TOTALMULTIPLIER.textContent = 'x' + seasonSheet.experimentCurrentMultiplier;
                        DICEROLLERHOLDERMSG.textContent = "Critique! relancez et doublez.";   
                    } else {
                        // During the risk factor animation, we also apply the multiplier to the current total.
                        expValue *= seasonSheet.experimentCurrentMultiplier;
                        setTimeout(function(){
                            D10DISPLAYBOX.value = expValue;
                            // Make sure to reset the multiplier.
                            seasonSheet.experimentCurrentMultiplier = 1;
                            TOTALMULTIPLIER.textContent = 'x' + seasonSheet.experimentCurrentMultiplier;
                        }, 300);
                        // Add the risk factor.
                        expValue = RiskFactorAdder(expValue);

                        // Set the final result.
                        seasonSheet.experimentationBonusResult = expValue;
                        SEASONSIMILARENCHANT[1].dispatchEvent(new Event("change"));

                        DICEROLLERHOLDERMSG.textContent = "Maintenant, lancez un dé sur la table des résultats extraordinaires.";
                        // The goal of rolling this dice has now changed, so we change the state accordingly.
                        seasonSheet.experimentButtonState = 1;
                    };
                    break;
                    
                // Second case, the bonus roll is done, now we must check for the consequences, meaning a roll on the experimentation table.
                case 1:
                    console.log('case 1', expValue)
                    seasonSheet.experimentationExtraordinaryRollsResults.push(expValue);
                    // Each roll lowers the number of rolls left by 1, if it reaches and stays at 0, then experimentation is over.
                    seasonSheet.experimentationExtraordinaryRollsLeft -= 1;
                    // First we check for raw 0 as it is a special case.
                    if (expValue == 0) {
                        // Compute the number of disaster dies to throw to confirm disaster, meaning 1 + aura + risk factor
                        let disasterDiesCount = 1 + parseInt(character.labAura) + parseInt(seasonSheet.experimentationRiskFactor);
                        // If the player has this vertue, then the number of disaster dies is reduced by 3 down to a minimum of 1.
                        if (Object.values(character.vertuesCharList).includes('Prudence en Sorcellerie')) {
                            disasterDiesCount = Math.min(disasterDiesCount-3, 1);
                        }
                        seasonSheet.experimentationDisasterCheckRollsLeft = disasterDiesCount;
                        DICEROLLERHOLDERMSG.textContent = `0... Confirmez le désastre en jetant ${disasterDiesCount} dés de désastres: (${"X".repeat(disasterDiesCount)})`;   
                        // Change state to validate disasters.
                        seasonSheet.experimentButtonState = 2;

                    // Else we add the risk factor and then check for the outcome.
                    } else {
                        expValue = RiskFactorAdder(expValue);
                        if (expValue < 5) {
                            // roll = 0-4 : no results.
                            DICEROLLERHOLDERMSG.textContent = "0-4 : Pas d'effet extraordinaire.";
                        } else if (expValue == 5 || expValue == 6) {
                            // roll = 5/6 : a secondary effect is added.
                            DICEROLLERHOLDERMSG.textContent = "5-6 : Effet Secondaire : relancez sur la table des effets secondaires.";
                            seasonSheet.experimentButtonState = 4;
                        } else if (expValue == 7) {
                            // roll = 7 : experimentation bonus lost, if the total is lower than what's nescessary, you must give up on this project (or season lost?).
                            DICEROLLERHOLDERMSG.textContent = "7 : Pas d'avantage, perdez le bonus d'éxpérimentation.";
                            seasonSheet.experimentationBonusResult = 0;
                            seasonSheet.experimentationConsequences.push("Pas d'avantage.");
                            // Trigger a change to update the lab total.
                            SEASONSIMILARENCHANT[1].dispatchEvent(new Event("change"));
                        } else if (expValue == 8) {
                            // roll = 8 : The season is lost, on a 0 the item is also destroyed.
                            DICEROLLERHOLDERMSG.textContent = "8 : Échec total : la saison est gachée, relancez, sur un 0 votre objet sera détruit".
                            seasonSheet.experimentationTotalFailureCheck = true;
                            seasonSheet.experimentButtonState = 7;
                        } else if (expValue == 9) {
                            // roll = 9 : story event is triggered.
                            DICEROLLERHOLDERMSG.textContent = "9 : Évènement spécial ou d'histoire : à la discrétion du compteur, un évènement impliquant toute l'alliance ce produit en conséquence de votre travail.";
                            seasonSheet.experimentationConsequences.push("Évènement spécial ou d'histoire.");
                        } else if (expValue == 10) {
                            // roll = 10 : discovery, roll on discovery table.
                            DICEROLLERHOLDERMSG.textContent = "10 : Découverte : relancez sur la table des découvertes.";
                            // set the first roll value for the discovery table to true, as explained in the "10+" case of the table.
                            seasonSheet.experimentationDiscoveryFirstRoll = true;
                            seasonSheet.experimentButtonState = 5;
                        } else if (expValue == 11) {
                            // roll = 11 : the effect is modified in some way.
                            DICEROLLERHOLDERMSG.textContent = "11 : Effet modifié : relancez sur la table des effets modifiés.";
                            seasonSheet.experimentButtonState = 6;
                        } else if (expValue >= 12) {
                            // roll = 12 : two more throws.
                            DICEROLLERHOLDERMSG.textContent = "12+ : Faites deux jets de plus sur cette table";
                            seasonSheet.experimentationExtraordinaryRollsLeft += 2;
                        } else {
                            
                        }
                    };

                    console.log('c', seasonSheet.experimentationExtraordinaryRollsLeft, seasonSheet.experimentButtonState);
                    // If the number of rolls left is 0, experimentation is over, disable the roll button and enable the validate button.
                    if (seasonSheet.experimentationExtraordinaryRollsLeft == 0 && seasonSheet.experimentButtonState == 1) {
                        DICEROLLERHOLDERMSG.textContent += "\r\nExpérimentation terminé!";
                        // Since the button become active once more after a second, by default, we add a datapoint to the button so that it doesn't turn on after the final throw.
                        // Since the button auto-deactivate once clicked and only reactivates after a bit, we don't need to deactivate the button here, it simply won't reactivate.
                        D10DISPLAYBOX.dataset.disabledFinal = true;
                        document.getElementById("season_validate_button").disabled = false;
                    }

                    break;

                // Case 2 takes care of validating disasters.
                case 2:
                    // Reduce the number of rolls left by one and register the roll.
                    seasonSheet.experimentationDisasterCheckRollsLeft -= 1;
                    seasonSheet.experimentationDisasterCheckRollsResults.push(expValue);
                    let disasterCheckHistory = seasonSheet.experimentationDisasterCheckRollsResults.toString() + "X".repeat(seasonSheet.experimentationDisasterCheckRollsLeft);
                    // If a 0 is registered, finish all the rolls before switching to the disaster table..
                    if (seasonSheet.experimentationDisasterCheckRollsResults.includes(0)) {
                        if (seasonSheet.experimentationDisasterCheckRollsLeft > 0) {
                            DICEROLLERHOLDERMSG.textContent = `Désastre confirmé... finissez vos jets. (${disasterCheckHistory})`;
                        } else {
                            DICEROLLERHOLDERMSG.textContent = `Désastre confirmé... roulez sur la table des désastres.`;
                            seasonSheet.experimentButtonState = 3;
                        }
                    // Otherwise we keep going.
                    } else {
                        // Unless this is the last roll:
                        if (seasonSheet.experimentationDisasterCheckRollsLeft > 0) {
                            DICEROLLERHOLDERMSG.textContent = `Tout va bien... (${disasterCheckHistory})`;
                        // If it *is* the last roll:
                        } else {
                            // If we still have dices to roll on the base table, we go back to it.
                            if (seasonSheet.experimentationExtraordinaryRollsLeft > 0) {
                                // Change back to the general table state to continue once this is done.
                                seasonSheet.experimentButtonState = 1;
                                DICEROLLERHOLDERMSG.textContent = `Tout va bien... (${disasterCheckHistory}). Lancez un nouveau dé sur la table des résultats extraordinaires.`;
                            // Else we call it a day.
                            } else {
                                D10DISPLAYBOX.dataset.disabledFinal = true;
                                DICEROLLERHOLDERMSG.textContent = `Tout va bien... (${disasterCheckHistory}). Fin de l'expérimentation!`;
                                document.getElementById("season_validate_button").disabled = false;
                            };
                        };
                    };
                    break;

                // Case 3 takes care of the disaster table.
                case 3:
                    // Reduce the number of rolls left by one and register the roll.
                    seasonSheet.experimentationDisasterTableRollsLeft -= 1;
                    seasonSheet.experimentationDisasterTableRollsResults.push(expValue);
                    if (expValue <= 0) {
                        // Total failure, disable the dice, and set the bonus to 0.
                        DICEROLLERHOLDERMSG.textContent = `0 : Vous devinez le désastre avant qu'il ne se produise. Votre saison est gâchée; cf. « Échec total».`;
                        seasonSheet.experimentationTotalFailureCheck = true;
                        seasonSheet.experimentationConsequences.push("Échec total.");
                    } else if (expValue == 1 || expValue == 2) {
                        // The item is destroyed...
                        DICEROLLERHOLDERMSG.textContent = `1-2 : Votre création est détruite.`;
                        seasonSheet.experimentationTotalFailureCheck = true;
                        // Set the item as destroyed and diseable all inputs.
                        itemSheet.itemIsDestroyed = 1;
                        DestroyedItemModifiers();
                        seasonSheet.experimentationConsequences.push("Objet détruit.");
                    } else if (expValue == 3 || expValue == 4) {
                        // The item as well as any precious object inside the laboratory is destroyed.
                        DICEROLLERHOLDERMSG.textContent = `3-4 : Votre création est détruite, ainsi qu'un autre des objets précieux que vous conservez dans votre laboratoire.`;
                        seasonSheet.experimentationTotalFailureCheck = true;
                        // Set the item as destroyed and diseable all inputs.
                        itemSheet.itemIsDestroyed = 1;
                        DestroyedItemModifiers();
                        seasonSheet.experimentationConsequences.push("Cet objet et un autre objet précieux du laboratoire est détruit.");
                    } else if (expValue == 5 || expValue == 6) {
                        // The item as well as a number of other objects are destroyed.
                        DICEROLLERHOLDERMSG.textContent = `5-6 : Éxplosion, lancez un dé simple pour chaque possession de valeur conservées dans votre laboratoire, sur un 0, la possession est détruite. \n Recevez des dégats égaux à un dé simple + le niveau de l'effet sur lequel vous travailliez.`;
                        seasonSheet.experimentationTotalFailureCheck = true;
                        // Set the item as destroyed and diseable all inputs.
                        itemSheet.itemIsDestroyed = 1;
                        DestroyedItemModifiers();
                        seasonSheet.experimentationConsequences.push("Objets du laboratoire Détruits.");
                    } else if (expValue == 7 || expValue == 8) {
                        // The covenant is in danger.
                        DICEROLLERHOLDERMSG.textContent = `7-8 : Toute l'alliance est menacé par le feu, l'invocation d'une menace majeure ou par une autre calamité définie par le conteur.`;
                        seasonSheet.experimentationConsequences.push("L'alliance est mise en danger par une calamitée.");
                    } else if (expValue == 9 || expValue == 10) {
                        // Gain distortion.
                        let distortionAmmount = seasonSheet.experimentationDisasterCheckRollsResults.length - seasonSheet.experimentationDisasterCheckRollsResults.reduce((accumulator, currentValue) => accumulator + currentValue, initialValue);
                        DICEROLLERHOLDERMSG.textContent = `9-10 : Vous gagnez autant de points de distortions que le nombre de 0 sur vos dés de désastres. Sur 2 ou plus, faites un jet de crépuscule.`;
                        seasonSheet.experimentationConsequences.push(`Gagnez ${distortionAmmount} points de distorsion${distortionAmmount ? "et faites un jet de crépuscule hors de ce programme" : ""}.`);
                    } else {
                        seasonSheet.experimentationDisasterTableRollsLeft += 2;
                    }

                    if (seasonSheet.experimentationDisasterTableRollsLeft <= 0) {
                        // If we still have dices to roll on the base table and the season can continue, we go back to it.
                        if (seasonSheet.experimentationExtraordinaryRollsLeft > 0 && seasonSheet.experimentationTotalFailureCheck == false) {
                            // Change back to the general table state to continue once this is done.
                            seasonSheet.experimentButtonState = 1;
                            DICEROLLERHOLDERMSG.textContent += `\nDésastres terminés, relancez sur la table des résultats extraordinaires.`;
                        // Else we call it a day.
                        } else {
                            D10DISPLAYBOX.dataset.disabledFinal = true;
                            DICEROLLERHOLDERMSG.textContent += `\nFin de l'expérimentation!`;
                            document.getElementById("season_validate_button").disabled = false;
                        };
                    } else {
                        DICEROLLERHOLDERMSG.textContent += `\nJet restants sur cette table : ${seasonSheet.experimentationDisasterTableRollsLeft}`;
                    }
                    break;

                // Case 4 takes care of secondary results.
                case 4:
                    seasonSheet.experimentationSecondaryEffectCasesResults.push(expValue);
                    if (expValue == 1) {
                        DICEROLLERHOLDERMSG.textContent = `1 : Votre sceau est exagéré à plusieurs fois sa force normale, devenant une partie majeure de l'effet.`;
                        seasonSheet.experimentationConsequences.push("Votre sceau devient une partie majeure de l'effet.");
                    } else if (expValue == 2 || expValue == 3) {
                        DICEROLLERHOLDERMSG.textContent = `2-3 : L'effet a un défaut mineur. Par exemple, un sort vous permettant de communiquer avec les animaux fait que vous conservez certains schémas de langage de l'animal pendant un certain temps après que le sort a expiré.`;
                        seasonSheet.experimentationConsequences.push("Le sort a un défaut mineur.");
                    } else if (expValue == 4 || expValue == 5) {
                        DICEROLLERHOLDERMSG.textContent = `4-5 : Le sort a un effet secondaire mineur. Par exemple, un sort permettant de contrôler un animal fait pousser l'herbe sous ses pattes.`;
                        seasonSheet.experimentationConsequences.push("Le sort a un effet secondaire mineur.");
                    } else if (expValue == 6) {
                        DICEROLLERHOLDERMSG.textContent = `6 : Le sort a un effet bénéfique mineur. Par exemple, un sort de vent aura une odeur agréable et entravera le vol des insectes.`;
                        seasonSheet.experimentationConsequences.push("Le sort a un effet bénéfique mineur.");
                    } else if (expValue == 7) {
                        DICEROLLERHOLDERMSG.textContent = `7 : Le sort a un défaut majeur. Par exemple, un sort desoins causera une grande douleur à la Cible.`;
                        seasonSheet.experimentationConsequences.push("Le sort a un défaut majeur.");
                    } else if (expValue == 8) {
                        DICEROLLERHOLDERMSG.textContent = `8 : Le sort a un effet secondaire majeur. Par exemple, un sort de contrôle des plantes attirera tous les oiseaux à cents pas.`;
                        seasonSheet.experimentationConsequences.push("Le sort a un effet secondaire majeur.");
                    } else if (expValue == 9) {
                        DICEROLLERHOLDERMSG.textContent = `9 : Le sort a un effet bénéfique majeur. Par exemple, un sort permettant de se transformer en loup vous permettra également de parler à toutes les créatures tant que vous serez sous forme de loup.`;
                        seasonSheet.experimentationConsequences.push("Le sort a un effet bénéfique majeur.");
                    // 10.
                    } else {
                        DICEROLLERHOLDERMSG.textContent = `10 : Le sort a un défaut fâcheux. Par exemple, un sort d'invisibilité vous fera briller.`;
                        seasonSheet.experimentationConsequences.push("Le sort a un défaut fâcheux.");
                    }

                    // If we still have dices to roll on the base table, we go back to it.
                    if (seasonSheet.experimentationExtraordinaryRollsLeft > 0) {
                        // Change back to the general table state to continue once this is done.
                        seasonSheet.experimentButtonState = 1;
                        DICEROLLERHOLDERMSG.textContent += `\nRelancez sur la table des résultats extraordinaires.`;
                    // Else we call it a day.
                    } else {
                        D10DISPLAYBOX.dataset.disabledFinal = true;
                        DICEROLLERHOLDERMSG.textContent += `\nFin de l'expérimentation!`;
                        document.getElementById("season_validate_button").disabled = false;
                    };
                    break;

                // Case 5 takes care of discoveries. (which is a 10 on the base table so it only works with a minimum risk value of 1, that is then reflected in the options.)
                case 5:
                    expValue = RiskFactorAdder(expValue);
                    seasonSheet.experimentationDiscoveryTableRollsLeft -= 1;
                    seasonSheet.experimentationDiscoveryCasesResults.push(expValue);
                    if (expValue >= 1 && expValue <= 4) {
                        DICEROLLERHOLDERMSG.textContent = `1-4 : Vous gagnez 15 points d'expérience en Théorie de la magie.`;
                        seasonSheet.experimentationConsequences.push("+15xp en Théorie de la magie");
                    } else if (expValue == 5 || expValue == 6) {
                        DICEROLLERHOLDERMSG.textContent = `5-6 : Vous gagnez 15 points d'expérience dans une Compétence liée à l'expérience.`;
                        seasonSheet.experimentationConsequences.push("+15xp dans une Compétence liée à l'expérience.");
                    } else if (expValue == 7 || expValue == 8) {
                        DICEROLLERHOLDERMSG.textContent = `7-8 : Vous gagnez 3 points d'expérience dans l'un des Arts utilisés pour l'expérience.`;
                        seasonSheet.experimentationConsequences.push("+3xp dans l'un des Arts utilisés pour l'expérience.");
                    } else if (expValue == 9) {
                        DICEROLLERHOLDERMSG.textContent = `9 : Vous gagnez suffisamment de points d'expérience pour monter l'un des Arts utilisés pour l'expérience au niveau supérieur ou trois points d'expérience (le plus haut des deux).`;
                        seasonSheet.experimentationConsequences.push("+ 1 niveau dans l'un des Arts utilisés pour l'expérience ou +3xp (plus haut des deux)");
                    // 10+.
                    }  else {
                        DICEROLLERHOLDERMSG.textContent = `10+ : Relancez deux fois et relancez à nouveau si vous obtenez ce résultat.`;
                        // If this is the first time we roll on this table after this specific extraordinary result roll (since we can roll multiple time on the extraordinary results
                        // table, we could fall twice or more on a discovery, meaning I have to reset a "first roll" value everytime and can't just use the list of discovery rolls' length):
                        if (seasonSheet.experimentationDiscoveryFirstRoll) {
                            // Add two rolls.
                            seasonSheet.experimentationDiscoveryTableRollsLeft += 2;
                        } else {
                            // Otherwise add one roll, meaning reroll this one roll. Roll...
                            seasonSheet.experimentationDiscoveryTableRollsLeft += 1;
                        }
                    }

                    // The first roll is over.
                    seasonSheet.experimentationDiscoveryFirstRoll = false;

                    if (seasonSheet.experimentationDiscoveryTableRollsLeft <= 0) {
                        // If we still have dices to roll on the base table, we go back to it.
                        if (seasonSheet.experimentationExtraordinaryRollsLeft > 0) {
                            // Change back to the general table state to continue once this is done.
                            seasonSheet.experimentButtonState = 1;
                            DICEROLLERHOLDERMSG.textContent += `\nRelancez sur la table des résultats extraordinaires.`;
                        // Else we call it a day.
                        } else {
                            D10DISPLAYBOX.dataset.disabledFinal = true;
                            DICEROLLERHOLDERMSG.textContent += `\nFin de l'expérimentation!`;
                            document.getElementById("season_validate_button").disabled = false;
                        };
                    } else {
                        DICEROLLERHOLDERMSG.textContent += `\nJet restants sur cette table : ${seasonSheet.experimentationDisasterTableRollsLeft}`;
                    }
                    break;

                // Case 6 takes care of modified effects. (which is a 11 on the base table so it only works with a minimum risk value of 2, which is.. partly reflected int the options (should be 2-3 for the first).)
                case 6:
                    expValue = RiskFactorAdder(expValue);
                    seasonSheet.experimentationModifiedEffectCasesResults.push(expValue);
                    if (expValue >= 1 && expValue <= 3) {
                        DICEROLLERHOLDERMSG.textContent = `1-3 : Le sort ou l'effet voit sa Portée, sa Durée, sa Cible ou sa puissance réduite.`;
                        seasonSheet.experimentationConsequences.push("La Portée, Durée, Cible ou puissance de l'effet est réduite.");
                    } else if (expValue >= 4 && expValue <= 6) {
                        DICEROLLERHOLDERMSG.textContent = `4-6 : Le sort ou l'effet voit sa Portée, sa Durée, sa Cible ou sa puissance augmentée.`;
                        seasonSheet.experimentationConsequences.push("La Portée, Durée, Cible ou puissance de l'effet est augmentée.");
                    } else if (expValue == 7 || expValue == 8) {
                        DICEROLLERHOLDERMSG.textContent = `7-8 : L'utilisation du sort ou de l'effet est limitée. Par exemple, il échoue dans certaines circonstances, comme quand il pleut.`;
                        seasonSheet.experimentationConsequences.push("L'utilisation du sort ou de l'effet est limitée.");
                    } else if (expValue == 9 || expValue == 10) {
                        DICEROLLERHOLDERMSG.textContent = `9-10 : Le véritable effet de votre sort est modifié. Par exemple, un sort comme Malédiction de Circé (cf. p. 201) transforme la Cible en chèvre, non en porc.`;
                        seasonSheet.experimentationConsequences.push("Le véritable effet de votre sort est modifié.");
                    // 11+.
                    } else {
                        DICEROLLERHOLDERMSG.textContent = `11+ : Le véritable effet de votre sort est complètement modifié, à l'exception de la Technique et de la Forme, qui restent inchangées, et du niveau, qui reste similaire.`;
                        seasonSheet.experimentationConsequences.push("Le véritable effet de votre sort est complètement modifié.");
                    }
                    
                    // If we still have dices to roll on the base table, we go back to it.
                    if (seasonSheet.experimentationExtraordinaryRollsLeft > 0) {
                        // Change back to the general table state to continue once this is done.
                        seasonSheet.experimentButtonState = 1;
                        DICEROLLERHOLDERMSG.textContent += `\nRelancez sur la table des résultats extraordinaires.`;
                    // Else we call it a day.
                    } else {
                        D10DISPLAYBOX.dataset.disabledFinal = true;
                        DICEROLLERHOLDERMSG.textContent += `\nFin de l'expérimentation!`;
                        document.getElementById("season_validate_button").disabled = false;
                    };
                    break;
                    
                case 7:
                    if (expValue == 0) {
                        // The item is destroyed...
                        DICEROLLERHOLDERMSG.textContent = `0 : Votre création est détruite...`;
                        // Set the item as destroyed and diseable all inputs.
                        itemSheet.itemIsDestroyed = 1;
                        DestroyedItemModifiers();
                        seasonSheet.experimentationConsequences.push("Objet détruit.");
                    } else {
                        DICEROLLERHOLDERMSG.textContent = `La saison n'est que ruinée :).`;
                    }
                    D10DISPLAYBOX.dataset.disabledFinal = true;
                    seasonSheet.experimentationConsequences.push("Échec total.");
                    document.getElementById("season_validate_button").disabled = false;
                    break;

                default:
                    break;
            }
            
        };
        // -----------------------------------------------------------------------------------

        // Compute the lab total.
        [SEASONASSISTINT, SEASONASSISTMAGTHEORY, SEASONSIMILARSPELL, SEASONSIMILARITEM, SEASONSIMILARENCHANT, SEASONSUPPBONUSES].forEach(elem => {
            elem[1].addEventListener('change', (e) => {
                let labTotal = CalcLabTotal(SEASONLABTOTAL, character, itemSheet.enchantments[enchantID], seasonSheet);
                CalcEffectiveLabTotal(SEASONEFFECTIVELABTOTAL, labTotal, itemSheet.itemType, itemSheet.enchantments[enchantID], seasonSheet);
            });
        });

        // Create the buttons to close and confirm season.
        const SEASONBOTTOMBUTTONSHOLDER = document.createElement('div');
        SEASONBOTTOMBUTTONSHOLDER.className = "season_bottom_button_holder";
        const CANCELSEASON = document.createElement('input');
        CANCELSEASON.type = "button";
        CANCELSEASON.value = "Annuler";
        SEASONBOTTOMBUTTONSHOLDER.appendChild(CANCELSEASON);
        const CONFIRMSEASON = document.createElement('input');
        CONFIRMSEASON.type = "button";
        CONFIRMSEASON.value = "Confirmer";
        CONFIRMSEASON.id = "season_validate_button"
        SEASONBOTTOMBUTTONSHOLDER.appendChild(CONFIRMSEASON);
        SEASONMODAL.appendChild(SEASONBOTTOMBUTTONSHOLDER);

        SEASONMODAL.showModal();

        // Close & delete the modal if the button clicks the cancel button.
        CANCELSEASON.onclick = function(){
            SEASONMODAL.close();
            SEASONMODAL.remove();
        };
        // Close & delete the modal if the user clicks outside of it.
        SEASONMODAL.addEventListener('click', (event) => {
            let rect = SEASONMODAL.getBoundingClientRect();
            let isInDialog = rect.top <= event.clientY &&
                             event.clientY <= rect.top + rect.height &&
                             rect.left <= event.clientX &&
                             event.clientX <= rect.left + rect.width;
            if (!isInDialog) {
                SEASONMODAL.close();
                SEASONMODAL.remove();
            }
        });
        // Conclude the season by clicking the ''confirm'' button.
        CONFIRMSEASON.onclick = function(){
            SaveSeason(seasonSheet, itemSheet.enchantments[enchantID], itemSheet, seasonSheet.experimentationTotalFailureCheck);
            SEASONMODAL.close();
            SEASONMODAL.remove();
        };
        // Trigger the events to initialize the text.
        SEASONASSISTINT[1].dispatchEvent(new Event("change"));
    };
    // -----------------------------------------------------------------------------------------------

    DestroyedItemModifiers();
    localStorage.setItem('itemsList', JSON.stringify(itemsList));

    // -------------------------------------------------------------------------------------------------------------
};