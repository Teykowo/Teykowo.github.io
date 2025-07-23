// ----------------------------------Create a function to compute the max ammount of vis allowed as well as the quantity needed for opening to enchantment.
export function CalcItemVisCostAndPotential(updatableElement, mat, size, characterSheet) {
    // Get the magic theory value from the character sheet, since a mage can't spend more vis tokens than twice his value in magic theory.
    let magicTheoryData = characterSheet.compCharList['Théorie de la Magie'];
    let magicTheoryScore = parseInt(magicTheoryData[0]);
    // If the specialization is applicable, add 1 to the lvl.
    if (['Enchantement', 'Objets', 'Travaux de Laboratoire'].includes(magicTheoryData[1])) {
        magicTheoryScore += 1;
    }
    let maxVis = magicTheoryScore*2;

    // Get the input element from the array.
    mat = mat[1];
    size = size[1];
    // Get the number value from the current selected valueby using a regex, this returns an array of various data.
    let numberMat = mat.options[mat.selectedIndex].text.match(/[:×]\s*(\d+)/);
    // Get the number from the array and turn it into a number element. 
    numberMat = numberMat ? parseInt(numberMat[1]) : 0;
    // Do the same for the size variable.
    let numberSize = size.options[size.selectedIndex].text.match(/[:×]\s*(\d+)/);
    numberSize = numberSize ? parseInt(numberSize[1]) : 0;
    // Apply the multiplication as per the rules to get the total vis cost.
    let total = numberMat * numberSize;

    // Check if the item can be opened given current settings and the magus' max vis capacity.
    if (maxVis >= total) {
        // Ensure the message has the correct colour, if it was previously changed.
        updatableElement.style.color = 'black';
        // If the button was deactivated because of this specific clause, then re-enables all buttons.
        Array.from(document.getElementsByClassName("spend_season_button")).forEach(button => {
            if (button.disabledReasonA) {
                button.disabled = false;
                button.disabledReasonA = false;
            }
        });
    } else {
        // If we can't, turn the text red and update the enchantability status.
        updatableElement.style.color = 'red';
        // Disable all enchantment buttons if there is such an error.
        Array.from(document.getElementsByClassName("spend_season_button")).forEach(button => {
            button.disabled = true;
            button.disabledReasonA = true;
        });
        // EnchantabilityCheck(updatableElement, state, reasonMessage);
    };
    // Update the text indicator.
    updatableElement.textContent = `Couts en Vis et Potentiel Max : ${total}/${maxVis}`;

    // If the user has the wast of vis flaw, we display it seperatly since the vis is used and counts towards the cap, but doesn't increase the enchantability of the item.
    if (Object.values(characterSheet.vicesCharList).includes("Gachis de Vis")) {
        let wastedVis = Math.ceil(total*0.25)
        if (total+wastedVis > maxVis) {
            updatableElement.style.color = 'red';
            // Disable all enchantment buttons if there is such an error.
            Array.from(document.getElementsByClassName("spend_season_button")).forEach(button => {
                button.disabled = true;
                button.disabledReasonA = true;
            });
        }
        updatableElement.textContent = `Couts en Vis et Potentiel Max : ${total} (+${wastedVis})/${maxVis} `;
    }

    // return the result as a string to be user later.
    return `${total}/${maxVis}`;
};

// ---------------------------------- Create a function that adds an event listener to a checkbox, exposing a textarea when checked.
export function ExtendModifierDescriptionListenerAdder(checkboxElem, textareaElem){
    checkboxElem[1].addEventListener('change', (e) => {
        if (e.target.checked) {
            textareaElem[0].style.display = "block"
            textareaElem[1].style.display = "block"
        } else {
            textareaElem[0].style.display = "none"
            textareaElem[1].style.display = "none"
        }
    });
};

// ---------------------------------- Create a function to update the enchantment's total level, by taking the base level and adding any relevent modifiers.
export function CalcEnchantmentTotalLvl(updatableElement, enchantmentTable) {
    // First we fetch the base lvl of the spell and create the "total" variable that starts at this value.
    let baselvl = enchantmentTable.enchantBaseLvl;
    let total = parseInt(baselvl);

    // ([+-]?\d+) matches any number of digits, (?=\s*(\(Special\))?\s*$): Positive lookahead, asserts that the number is followed only by optional whitespace and optionally (Special) before the end of the string.
    //  We need the (special) management since durations and target can have it after the bonus.
    let regex = /([+-]?\d+)(?=\s*(\(Special\))?\s*$)/;

    // Do the same for range duration and target since they have similar formats, but we add it by magnitude.
    // Instead of copy pasting it thrice, we make a function for the range, duration and target managing.
    function MagnitudeAdder(value, regex, total) {
        let match = value.match(regex);
        if (match) {
            let numberStr = match[0].trim().replace(/^\+/, '');
            let number = parseInt(numberStr);
            // If the current total is under 5, simply add it.
            if (total < 5){
                total += number;
                // But if it goes beyond during this operation, then we need to add the overflow multiplyed by 5, since it's added by magnitude.
                if (total > 5) {
                    let leftovers = total-5;
                    total = total - leftovers + (leftovers * 5);
                }
            } else {
                total += number * 5;
            };
        };
        return total;
    };
    let range = enchantmentTable.enchantRange;
    total = MagnitudeAdder(range, regex, total)
    let duration = enchantmentTable.enchantDuration;
    total = MagnitudeAdder(duration, regex, total)
    let target = enchantmentTable.enchantTarget;
    total = MagnitudeAdder(target, regex, total)

    // If we have a second form, the magnitude increases by one.
    let form2 = enchantmentTable.enchantSupp;
    if (form2) {
        if (total < 5){
            total += 1;
        } else {
            total += 5;
        };
    };

    // The DailyUseCap adds levels following this format : "1 utilisation par jour: 0", "2 utilisation par jour: +1".
    let dailyUseCap = enchantmentTable.enchantDailyUseCap;
    let match4 = dailyUseCap.match(regex);
    // Check if it worked and then isolate the digit and turn it into a integer before adding it to the total.
    if (match4) {
        let numberStr = match4[0].trim().replace(/^\+/, '');
        let number = parseInt(numberStr);
        total += number;
    }

    // For each two points of penetration, the cost increases by 1.
    let penetrationMod = enchantmentTable.enchantPenetrationMod;
    total += Math.floor(penetrationMod/2);

    // Those last 4 modifiers are boolean that add +5 or +3 to the cost if checked.
    let concentrationMod = enchantmentTable.enchantConcentrationMod;
    if (concentrationMod) {
        total += 5;
    };
    let limitedUsersMod = enchantmentTable.enchantLimitedUsersMod;
    let envTriggerMod = enchantmentTable.enchantEnvTriggerMod;
    let linkedTriggerMod = enchantmentTable.enchantLinkedTriggerMod;
    // Since the three last booleans add +3 each, we can just sum them as if true == 1 and false == 0.
    let totalBooleanModsX3 = [limitedUsersMod, envTriggerMod, linkedTriggerMod].reduce((sum, current) => sum + (current ? 1 : 0), 0)
    // The total will thus be the number of +3 that should be added, so we multiply it by 3 when adding it to the total.
    total += totalBooleanModsX3 * 3;

    updatableElement.textContent = `| Niveau Total : ${total} |`;
    return total;
};

export function CalcEnchantmentCharges(updatableElement, enchantmentTotalLevel) {
    let chargeCount = Math.ceil(Math.max(enchantmentTotalLevel/5, 1));
    updatableElement.textContent = `Nombre de Charges : ${chargeCount} |`;
    return chargeCount;
};

// ---------------------------------- Create a function that computes the cost in vis of an enchantment and ensures it is within the limits of mage's abilities, and opened item limits if needed.
export function CalcEnchantmentVisCost(updatableElement, enchantmentTotalLevel, characterSheet, itemSheet, itemType) {
    // The enchantment costs one point of vis for every 10 level, even incomplete.
    let visCost = Math.ceil(enchantmentTotalLevel/10);

    // Get the magic theory value from the character sheet, since a mage can't spend more vis tokens than twice his value in magic theory.
    // We compute this everytime to cover the possibility of the player having *lost* magic theory score.
    let magicTheoryData = characterSheet.compCharList['Théorie de la Magie'];
    let magicTheoryScore = parseInt(magicTheoryData[0]);
    // If the specialization is applicable, add 1 to the lvl.
    if (['Enchantement', 'Objets', 'Travaux de Laboratoire'].includes(magicTheoryData[1])) {
        magicTheoryScore += 1;
    }
    let maxVisChar = magicTheoryScore*2;

    // Init a variable for the max number of vis given a major enchanted item, we set its value high as if the item is minor, this should be ignored.
    let maxVisItem = 1000
    // If the item is a major item, the enchant shouldn't cost more that how much was spent to open the item minus what's already been used to enchant it.
    if (itemType == "major") {
        // Get the number of vis tokens used to open the item.
        let itemOpeningVisCount = itemSheet.itemVisCostAndPotential.split("/")[0];
        // Make a list of the values of all previously fully inbued enchantments vis cost and add them up.
        let alreadyUsedVis =  Object.values(itemSheet.enchantments).filter(entry => entry.enchanted).map(entry => entry.enchantVisCost).reduce((sum, val) => sum + val, 0);
        maxVisItem = itemOpeningVisCount - alreadyUsedVis;
    };

    // Check if the enchantment can be paid for given current settings and the magus' max vis capacity.
    if (maxVisChar >= visCost && maxVisItem >= visCost) {
        // Ensure the message has the correct colour, if it was previously changed.
        updatableElement.style.color = 'black';
        // Re-enables all buttons.
        Array.from(document.getElementsByClassName("spend_season_button")).forEach(button => {
            if (button.disabledReasonB && button.dataset.enchantID == updatableElement.dataset.enchantID) {
                button.disabled = false;
                button.disabledReasond = false;
            }
        });
    } else {
        // If we can't, turn the text red and update the enchantability status.
        updatableElement.style.color = 'red';
        // Disable all enchantment buttons if there is such an error.
        Array.from(document.getElementsByClassName("spend_season_button")).forEach(button => {
            button.disabled = true;
            button.disabledReasonB = true;
        });
        // EnchantabilityCheck(updatableElement, state, reasonMessage);
    };
    
    updatableElement.textContent = `Coût en Vis : ${visCost}/${Math.min(maxVisChar, maxVisItem)} |`;

    // If the user has the wast of vis flaw, we display it seperatly since the vis is used and counts towards the cap, but doesn't increase the size off of the item taken by the enchantment.
    if (Object.values(characterSheet.vicesCharList).includes("Gachis de Vis")) {
        let wastedVis = Math.ceil(visCost*0.25)
        if (visCost > maxVisItem || visCost+wastedVis > maxVisChar) {
            updatableElement.style.color = 'red';
            // Disable all enchantment buttons if there is such an error.
            Array.from(document.getElementsByClassName("spend_season_button")).forEach(button => {
                button.disabled = true;
                button.disabledReasonB = true;
            });
        }
        updatableElement.textContent = `Coût en Vis : ${visCost} (+${wastedVis})/${Math.min(maxVisChar, maxVisItem)} |`;
    }

    return visCost;
};

// ---------------------------------- Create a function dedicated to checking if a specialization is relevent for this operation.
function SpeCheck(spe, params) {
    // This list of specializations are always relevent.
    let alwaysRelevSpes = ['Enchantement', 'Objets', 'Travaux de Laboratoire', 'Hermétique'];
    let speToCheck = params.concat(alwaysRelevSpes);
    if (speToCheck.includes(spe)) {
        return 1;
    } else {
        return 0;
    };
};

// ---------------------------------- Create a function to compute the lab total given the character's stats and the enchant's specificities, as wel as other modifiers.
export function CalcLabTotal(updatableElement, characterSheet, enchantmentSheet, seasonSheet) {
    let labTotal = 0;

    // Get the arts used for this enchantment and create a list that removes the blank values.
    let relevTech = enchantmentSheet.enchantTechnique;
    let relevForm = enchantmentSheet.enchantForm1;
    let relevSupp = enchantmentSheet.enchantSupp;
    let techFormSupplist = [relevTech, relevForm, relevSupp].filter(value => value !== '');

    // Also get the lab focuses so that the activity/tech/form serves as key to the bonus value.
    let labFocusesClean = Object.values(characterSheet.customLab.labFocuses).map(value => [value[1], value[0]]);
    labFocusesClean = Object.fromEntries(labFocusesClean);

    // Get the lists of applicable vertues and flaws.
    let allCharVertues = Object.values(characterSheet.vertuesCharList);
    let allCharFlaws = Object.values(characterSheet.vicesCharList);
    // First merge the two lists of character vertues and flaws:
    let jointVandF = allCharVertues.concat(allCharFlaws);
    // Since some of those need to be checked by the user to be applicable, we compare this list to the entries in the season object.
    for (let i = 0; i < jointVandF.length; i++) {
        const VorF = jointVandF[i];
        // If the element is in the list then it needs to be checked to be counted, first, is it in the list?
        if (Object.keys(seasonSheet.applicableContextualVertuesAndFlaws).includes(VorF)) {
            // If yes, is it checked as "true"? if not, then it shall be removed from the joint list, as it shouldn't be applied.
            if (!seasonSheet.applicableContextualVertuesAndFlaws[VorF]) {
                jointVandF.splice(i, 1);
            };
        };
    };
    
    // ----------------- First we add the bonuses from the character directly.
    labTotal += parseInt(characterSheet.intValue);
    labTotal += parseInt(characterSheet.labAura);
    labTotal += parseInt(characterSheet.customLab.labQG);

    // ----------------- Then the bonuses from the characters house.
    // If Verditius :
    if (characterSheet.house == 'Verditius') {
        // Check if a craft has been set as applicable.
        if (seasonSheet.applicableCraft != '') {
            // And if yes, fetch it's data in the character sheet and add it to the total, checking for spe.
            let craftBonus = characterSheet.compCharList[seasonSheet.applicableCraft];
            labTotal +=  parseInt(craftBonus[0]) + SpeCheck(craftBonus[1], techFormSupplist);
            if (jointVandF.includes(`Talent en (${seasonSheet.applicableCraft})`)) {
                labTotal += 3;
            };
        }
        // Also add the philosophy bonus.
        let philoBonus = characterSheet.compCharList.Philosophies;
        labTotal +=  parseInt(philoBonus[0]) + SpeCheck(philoBonus[1], techFormSupplist);
        if (jointVandF.includes('Talent en (Philosophies)')) {
            labTotal += 3;
        };
    };

    // ----------------- Add the magic theory value.
    let magTheoryBonus = characterSheet.compCharList['Théorie de la Magie'];
    labTotal += parseInt(magTheoryBonus[0]) + SpeCheck(magTheoryBonus[1], techFormSupplist);
    if (jointVandF.includes('Talent en (Théorie de la Magie)')) {
        labTotal += 3;
    };

    // ----------------- Then those from the characters ars scores.
    // Innit variables for the final value of tech and form, after all bonuses added. it's used in some vertues/flaws.
    let baseTechValue = parseInt(characterSheet.artsCharList[relevTech]);
    let baseFormValue = parseInt(characterSheet.artsCharList[relevForm]);

    let techValue = baseTechValue;
    // If the character has a talent in this arts, then we add +3.
    if (jointVandF.includes(`Talent en (${relevTech})`)) {
        techValue += 3;
    };
    if (Object.keys(labFocusesClean).includes(relevTech)) {
        techValue += parseInt(labFocusesClean[relevTech]);
    };

    let formValue = baseFormValue;
    if (jointVandF.includes(`Talent en (${relevForm})`)) {
        formValue += 3;
    };
    if (Object.keys(labFocusesClean).includes(relevForm)) {
        techValue += parseInt(labFocusesClean[relevForm]);
    };

    let suppValue = 0;
    // If no supplement is given, set this value to 0, else give it its proper value, and apply any bonuses/maluses.
    if (relevSupp != '') {
        let baseSuppValue = parseInt(characterSheet.artsCharList[relevSupp]);
        suppValue = baseSuppValue;

        if (jointVandF.includes(`Talent en (${relevSupp})`)) {
            suppValue += 3;
        };
        if (Object.keys(labFocusesClean).includes(relevSupp)) {
            techValue += parseInt(labFocusesClean[relevSupp]);
        };
        
        // Also find out if the supplement is a technique or form, and select the lesser value of any.
        if (['Creo','Intellego','Muto','Perdo','Rego'].includes(relevSupp)) {
            // Is the value of the complement tech inferior to the value of the regular tech? if yes, then the value of the complement is used, 
            // Otherwise, it's that of the regular tech that is kept.
            techValue = (suppValue < techValue) ? suppValue : techValue;
            // change the base tech value to the smallest.
            baseTechValue = (baseSuppValue < baseTechValue) ? baseSuppValue : baseTechValue;
        } else if(['Animal','Aquam','Auram','Corpus','Herbam','Ignem','Imaginem','Mentem','Terram','Vim'].includes(relevSupp)) {
            formValue = (suppValue < formValue) ? suppValue : formValue;
            // change the base tech value to the smallest.
            baseFormValue = (baseSuppValue < baseFormValue) ? baseSuppValue : baseFormValue;
        };
    };
    // We now add those values to the total.
    labTotal += techValue;
    labTotal += formValue;
    
    // ----------------- Then all the bonuses/maluses from vertues and flaws.
    jointVandF.forEach(VorF => {
        switch (VorF) {
            case 'Expertise Magique Majeur':
                // The smaller value between technique and form is doubled.
                labTotal += (baseTechValue < baseFormValue) ? baseTechValue : baseFormValue;
                break;
            
            case 'Étudiant Laborantin Adepte':
                labTotal += 6;
                break;
            
            case 'Expertise Magique Mineure':
                // The smaller value between technique and form is doubled.
                labTotal += (baseTechValue < baseFormValue) ? baseTechValue : baseFormValue;
                break;
            
            case 'Génie Inventif':
                labTotal += seasonSheet.experimentedBool ? 6 : 3;
                break;
            
            case 'Magie Cyclique (Positive)':
                labTotal += 3;
                break;
            
            case 'Créativité Asséchée':
                labTotal -= 3;
                break;
            
            case 'Érudition Limitée':
                labTotal -= 6;
                break;
            
            case 'Magie Cyclique (Négative)':
                labTotal -= 3;
                break;

            default:
                break;
        }
    });
    
    // Those have to be computed after the rest, or nescessitate a more complex setup not allowed in switch statements.
    let seasonValdiateButton = document.getElementById("season_validate_button");
    if (jointVandF.includes('Arts Incompatibles')) {
            seasonValdiateButton.disabled = true;
            seasonValdiateButton.disabledReasonA = true;
    } else {
        if (seasonValdiateButton.disabledReasonA) {
            seasonValdiateButton.disabled = false;
            seasonValdiateButton.disabledReasonA = false;
        }
    }

    if (jointVandF.includes('Circonstances Délétères')) {
        labTotal = Math.floor(labTotal / 2);
    }

    if (jointVandF.includes(`Forme Déficiente (${relevForm})`)) {
        labTotal = Math.floor(labTotal / 2);
    }

    if (jointVandF.includes(`Technique Déficiente (${relevTech})`)) {
        labTotal = Math.floor(labTotal / 2);
    }

    // For the supplement, instead of checking again if it's a form or a technique, we just check for both, as entries such as "Technique Déficiente (form)" wouldn't exist.
    if (jointVandF.includes(`Forme Déficiente (${relevSupp})`) || jointVandF.includes(`Technique Déficiente (${relevSupp})`)) {
        labTotal = Math.floor(labTotal / 2);
    }

    if (jointVandF.includes('Enchantement Ardu')) {
        labTotal = Math.floor(labTotal / 2);
    }

    // Here, the malus is applied if the range is superior to "contact", we count as superior to contact any range that adds more than 1 magnitude to the spell's cost.
    if (jointVandF.includes('Magie à Portée réduite') && parseInt(enchantmentSheet.enchantRange.slice(-2)) > 1) {
        labTotal = Math.floor(labTotal / 2);
    }

    // ----------------- Then add the bonuses from shape and material.
    // Iterate over the keys, get the bool value, if the value is "true" then use a regex to fetch the bonus value.
    Object.keys(seasonSheet.applicableShape).forEach(key => {
        let relevantBool = seasonSheet.applicableShape[key];
        if (relevantBool) {
            let bonus = key.match(/\+\d+/);
            labTotal += parseInt(bonus[0]);
        }
    });

    // ----------------- Then add the results of experimentation if any.
    labTotal += parseInt(seasonSheet.experimentationBonusResult);

    // ----------------- Then all the other bonuses relative to the season.
    labTotal += parseInt(seasonSheet.assistantIntBonus);
    labTotal += parseInt(seasonSheet.assistantTheoryBonus);
    labTotal += parseInt(enchantmentSheet.bonusFromFailedSeasons);
    console.log(enchantmentSheet.bonusFromFailedSeasons)
    // This flaw disables the bonuses brought by knowing a similar spell or having a similar enchant in the object.
    if (!jointVandF.includes( 'Magie Disjointe')) {
        labTotal += parseInt(seasonSheet.similarSpellBonus);
        labTotal += parseInt(seasonSheet.similarObjectBonus.slice(-2));
        labTotal += parseInt(seasonSheet.similarEnchantmentBonus);
    }
    labTotal += parseInt(seasonSheet.additionalBonuses);

    // ----------------- If the season is a total failure du to extraordinary results, then we set the value to 0.
    if (seasonSheet.experimentationTotalFailureCheck) {
        labTotal = 0;
    }

    updatableElement.textContent = `Totale de Laboratoire : ${labTotal}`;
    // Also update the season sheet.
    seasonSheet.labTotal = labTotal;
    return labTotal;
};

// ---------------------------------- Create a function that compares the enchant lvl to the given lab total and tells wether it's enough to actually enchant the item.
export function CalcEffectiveLabTotal(updatableElement, labTotal, itemType, enchantSheet, seasonSheet) {
    // Get the enchantment's total lvl and the leftovers from the previous season, if the item is not a major item, the leftovers will be 0.
    let enchantLvl = enchantSheet.enchantTotalLvl;
    let leftovers = enchantSheet.leftoverFromLastSeasonMajorItems;
    // Set the rest of the effective lab total to generate to the remaining points, meaning the total points minus the leftovers (leftovers being those that have already been completed). 
    let enchantLvlLeft = enchantLvl - leftovers;
    // The effective lab total is the current lab total minus the enchant's total lvl.
    let effectiveLabTotal = labTotal - enchantLvl;
    // If we're enchanting a major object, then the result simply has to add to the enchant's completion, meaning it has to be above 0, otherwise it has to complete the enchant in one season.
    let minimumAllowedEffectiveLabTotal = 1 ? (itemType == "Objet Magique Majeur") : enchantLvl;
    // If we pass, then leave the button active and enables them if this specific clause disabled them previously.
    if (effectiveLabTotal >= minimumAllowedEffectiveLabTotal) {
        if (document.getElementById("season_validate_button").disabledReasonB) {
            updatableElement.style.color = 'black';
            document.getElementById("season_validate_button").disabled = false;
            document.getElementById("season_validate_button").disabledReasonB = false;
        }
    } else {
        updatableElement.style.color = 'red';
        document.getElementById("season_validate_button").disabled = true;
        document.getElementById("season_validate_button").disabledReasonB = true;
    }
    updatableElement.textContent = `Total de Laboratoire Effectif : ${effectiveLabTotal}/${enchantLvlLeft}`;
    // Also update the season sheet.
    seasonSheet.effectiveLabTotal = effectiveLabTotal;
};


export function EnchantabilityCheck(updatableElement, state, reasonMessage) {
    
};