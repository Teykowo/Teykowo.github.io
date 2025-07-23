// ----------------------------------------------- Imports -----------------------------------------------
import {SelectionMenuPage} from './Character Selection Page/SelectionMenuPageFunc.js';
import {SelectedCharPage} from './Character Sheet Page/SelectedCharPageFunc.js';
import {EnchantmentPage} from './Enchantment Page/EnchantmentPageFunc.js';
// -------------------------------------------------------------------------------------------------------
// ----------------------------------------------- Constants -----------------------------------------------
// Store the global html container.
const CONTAINERFICHESPERSOS = document.getElementById('container_fiches_persos');
const MAINCONTAINER = document.getElementById('main_container');

// Define the option lists for different drop down menus.
const COMPLIST = ['Artisanat 1', 'Artisanat 2', 'Artisanat 3', 'Théorie de la Magie', 'Philosophies'];
const ARTSLIST = ['Creo','Intellego','Muto','Perdo','Rego','Animal','Aquam','Auram','Corpus','Herbam','Ignem','Imaginem','Mentem','Terram','Vim',];
// Instantiate the "FOCUSES" constant as the list of arts, plus some through the use of an intermediary variable.
let focusesTemp = structuredClone(ARTSLIST);
focusesTemp.push('Enchantement', 'Objets', 'Travaux de Laboratoire', 'Extraction de Vis', 'Hermétique', '')
const OPTIONLISTS = {
    'MAISONSLIST' : ['Bjornaer', 'Bonisagus', 'Criamon', 'Ex Miscellanea', 'Flambeau', 'Guernicus', 'Jerbiton', 'Mercere', 'Merinita', 'Tremere', 'Tytalus', 'Verditius'],
    'VERTUESLIST' : ['',
                     'Expertise Magique Majeur',
                     'Étudiant Laborantin Adepte',
                     'Expertise Magique Mineure',
                     'Génie Inventif',
                     'Magie Cyclique (Positive)',
                     'Prudence en Sorcellerie',
                     ...ARTSLIST.map(art => `Talent en (${art})`), 
                     ...COMPLIST.map(comp => `Talent en (${comp})`),],
    'VICESLIST' : ['', 
                   'Arts Incompatibles',
                   'Circonstances Délétères',
                   'Créativité Asséchée',
                   'Enchantement Ardu',
                   'Érudition Limitée',
                   ...ARTSLIST.slice(5).map(form => `Forme Déficiente (${form})`), 
                   'Gachis de Vis',
                   'Grande Malédiction',
                   'Magie à Portée réduite',
                   'Magie Cyclique (Négative)',
                   'Magie Disjointe',
                   'Petite Malédiction',
                   ...ARTSLIST.slice(0, 5).map(tech => `Technique Déficiente (${tech})`), ],
    'COMPLIST' : COMPLIST,
    'FOCUSTITLES' : ['Focus d’Activité 1', 'Focus d’Activité 2', 'Focus de Technique 1', 'Focus de Technique 2', 'Focus de Forme 1', 'Focus de Forme 2',],
    'ARTSLIST' : ARTSLIST,
    'FOCUSES' : focusesTemp,
}

// Create a dict of option lists specifically for the enchantments.
const ENCHANTEMENTOPTIONLISTS = {
    ITEMMATERIALS : ['Tissu, verre: 1', 'Bois, cuir: 2', 'Os, roche tendre: 3', 'Roche dure: 4', 'Métal de base: 5', 'Argent: 6', 'Or: 10', 'Pierre semi-précieuse: 12', 
        'Pierre précieuse: 15', 'Pierre inestimable: 20'],
    ITEMSIZES : ['Très petite (bijoux, pierre précieuses): ×1', 'Petite (dague, ceinture, chapeau): ×2', 'Moyenne (épée, tunique, crane): ×3', 'Grande (bâton, bouclier, cape, squelette): ×4', 'Très grande (bâteau, corps humain, petite salle): ×5'],
    ITEMSHAPEANDMATERIALBONUSES : [
        "",
        "Herminette: +2 embellir les structures en bois",
        "Albâtre: +2 indulgence, +4 acuité mentale",
        "Alexandrite: +2 régénération, +3 longévité, +5 chevaux",
        "Ambre: +2 Corpus, +3 contrôler le mouvement",
        "Agate: +3 air, +5 protection contre les tempêtes, +7 protection contre le venin",
        "Aloès: +3 amitié",
        "Améthyste: +2 ouïe, +2 richesse, +3 rêves, +3 poisons, +4 tempérance, +7 ivresse",
        "Aigue-marine: +3 eau",
        "Amulette portant les symboles des anges: +7 bannir les démons, +7 protection contre les démons",
        "Os d'animal: +4 nuire ou détruire les animaux",
        "Peau d'animal: +7 se transformer en un animal approprié",
        "Sphère armillaire: +5 afficher les cieux, le temps céleste",
        "Armure: +7 protéger le porteur",
        "Flèche: +2 viser, +3 direction",
        "Astrolabe: +5 mesurer les étoiles et les cieux, astrologie et navigation",
        "Aiguille: +2 façonner le bois, percer le bois",
        "Hache: +4 détruire le bois",
        "Sac/ Sacoche: +3 déplacer des objets dedans ou dehors, +5 piéger des objets à l'intérieur",
        "Bandage: +4 guérir les blessures",
        "Basalte: +3 Ignem, +3 Perdo",
        "Panier: +2 collecter et préserver des objets, +3 créer des choses à l’intérieur, +4 préserver le contenu, +5 créer de la nourriture à l’intérieur",
        "Lit: +6 affecter le sommeil et les rêves",
        "Cloche: +5 avertir",
        "Soufflet: +4 créer du vent, +5 renforcer le feu",
        "Ceinture: +3 affecter la force",
        "Béryl: +3 eau",
        "Hachette: +2 tailler les plantes",
        "Pierre de sang: +4 sang et blessures",
        "Livre: +2 Intellego, +3 Divination, +4 Numérologie",
        "Bibliothèque: +3 cacher des objets à l’intérieur, +4 protéger des objets à l’intérieur",
        "Bottes: +5 affecter la marche",
        "Arc: +5 détruire des objets à distance",
        "Laiton: +3 Ignem, +3 musique, +4 démons, diables et anges",
        "Bronze: +3 Terram, +5 ténèbres",
        "Bufonites: +3 détecter le poison",
        "Bougie faite de graisse de chèvre: +3 invoquer des démons",
        "Bougie noire: +2 invoquer des démons",
        "Sculpture de Béhémoth: +3 grande taille",
        "Fût: +3 induire l’ivresse",
        "Œil de chat: +3 contre le Corpus malveillant",
        "Centaurée: +3 vol",
        "Calice: +4 détecter le poison à l’intérieur, +5 transformer ou créer du liquide à l’intérieur",
        "Craie bleue: +2 protection contre les démons",
        "Cinnabarre: +3 longévité, +4 langue, +4 richesse, +5 dragons",
        "Cannelle: +2 détruire les fantômes, +4 Imaginem",
        "Cinquefoil: +1 Rego Mentem, +2 réparer, +3 chasser les démons, +3 leadership, +4 résister au poison",
        "Clach Crubain: +2 arthrite",
        "Coquille de palourde: +2 protection",
        "Verre transparent: +4 invisibilité, +5 voir à travers quelque chose",
        "Fendeur: +2 boucherie, +3 Perdo Animal",
        "Manteau: +3 vol, +4 transformer le porteur, +5 altérer/supprimer l’image du porteur",
        "Ciseaux à tissu: +2 façonner les tissus",
        "Pièce: +2 diplomatie, +3 protéger les voyageurs, +4 induire la cupidité, +4 richesse et commerce",
        "Collier: +6 contrôler le porteur",
        "Peigne: +5 beauté, +7 affecter les cheveux",
        "Contenant: +5 créer ou transformer à l’intérieur",
        "Cuivre: +2 passion, +2 magie sexuelle, +3 effusion de sang, +4 habileté, +4 effets qui modifient sa propre forme",
        "Corail rouge: +10 contre les démons",
        "Cornu Ammonis: +3 affecter les visions, rêves",
        "Croix: +5 bannir les démons, +5 causer des dégâts aux créatures infernales, +5 protéger contre le surnaturel",
        "Levier: +2 déplacer la pierre",
        "Couronne: +2 sagesse, +3 contrôler les gens, +5 gagner le respect, l’autorité",
        "Cristal: +5 effet lié à l’eau",
        "Dague/Couteau: +2 destruction précise, +3 trahison, assassinat, +3 empoisonnement",
        "Diamant: +5 contre les démons",
        "Diviseurs: +2 mesurer",
        "Porte: +5 protection",
        "Portail: +5 transport magique, +7 affecter le mouvement à travers, +7 portes et portails magiques",
        "Plumes: +3 silence",
        "Tambour: +2 induire la peur, +3 créer des tempêtes et du tonnerre, +5 assourdissant",
        "Boucle d'oreille: +5 affecter l’ouïe",
        "Électrum: +3 tromperie, +3 voyance, +4 Muto Terram",
        "Émeraude: +2 calme, +4 inciter l’amour ou la passion, +7 serpents et dragons",
        "Pain de fée: +4 garder le lait frais",
        "Ventilateur: +4 bannir les phénomènes météorologiques, +4 créer ou contrôler les vents",
        "Fenouil: +2 rêves, +5 repousser les mauvais esprits, +5 repousser les fantômes",
        "Argile cuite: +4 contenir ou protéger du feu",
        "Fléau: +3 récolte des grains",
        "Sol: +7 affecter le mouvement à travers",
        "Encens: +3 rêves, +3 Perdo Vim, +4 purifier un lieu des créatures infernales",
        "Grenat: +2 navigation, +2 renforcer le corps et l’esprit, +3 liens d’engagement, +4 repousser les insectes",
        "Verre clair: +4 invisibilité, +5 voir à travers quelque chose",
        "Glossopetrae: +5 résister au venin de serpent",
        "Gant: +4 affecter les objets par le toucher, +4 manipulation à distance",
        "Or: +2 contrôler les gens, +2 santé, +3 prévenir le vieillissement, +4 affecter la richesse, +4 induire la cupidité, +4 noblesse, +4 paix",
        "Granit: +2 richesse, +3 Terram",
        "Turquoise verte: +4 nécromancie",
        "Hall: +3 transport magique, +6 affecter le mouvement à travers",
        "Marteau, petit: +2 construction",
        "Scie à main: +3 façonner délicatement le bois",
        "Chapeau: +4 affecter l’image de soi",
        "Hachette: +4 détruire le bois",
        "Noisetier: +3 divination",
        "Foyer: +5 détruire des objets à l’intérieur, +7 créer le feu et la chaleur",
        "Casque: +4 affecter l’esprit/émotions du porteur, +6 affecter la vision du porteur",
        "Fer à cheval: +2 protection, +6 affecter le mouvement du cheval",
        "Sablier: +3 augmenter la vitesse, +7 chronométrage et alarmes",
        "Os humain: +3 détruire l’esprit humain, +4 détruire le corps humain",
        "Crâne humain: +4 détruire le corps humain, +5 détruire l’esprit humain, +5 détruire ou contrôler les fantômes, +10 détruire ou contrôler un fantôme particulier",
        "Hyacinthe: +2 guérison",
        "Encre d’Hermès: +3 Vim, +5 livres",
        "Fer: +3 liens, +7 nuire ou repousser les fées",
        "Menottes en fer: +8 lier les fées",
        "Ivoire: +5 guérison",
        "Jade: +4 Aquam",
        "Jasper: +2 guérison, +2 contre les démons",
        "Jet: +2 protection, +3 ténèbres",
        "Bijoux/Vêtements: +4 se transformer soi-même, +4 se protéger soi-même, +2 se déplacer soi-même",
        "Lampe: +4 créer du feu, +7 produire de la lumière",
        "Plomb: +3 haine, +3 invoquer ou lier les fantômes, +4 protections",
        "Sang de lion: +2 leadership, +3 courage, +4 protection contre les bêtes sauvages",
        "Crinière de lion: +5 force, courage, fierté",
        "Lyre: +3 créer des sons, +5 affecter la musique",
        "Aimant: +2 Rego, +4 Rego Corpus, +4 Rego Terram",
        "Magnétite: +3 Animal",
        "Maillet: +2 précision",
        "Menottes: +4 lier",
        "Marbre: +3 beauté, +5 protections",
        "Masque: +2 affecter la vision du porteur, +3 dissimulation, +7 déguisement",
        "Ciseau de maçon: +2 façonner la pierre",
        "Mercure: +3 arts et sciences, +3 Terram et Aquam, +5 Muto",
        "Miroir: +6 afficher des images, +3 invoquer ou lier des fantômes",
        "Gui: +7 divination",
        "Myrrhe: +3 esprits",
        "Collier: +4 affecter la respiration et la parole",
        "Filet: +5 immobilisation",
        "Chêne: +7 protection contre les tempêtes",
        "Rame: +4 affecter les courants",
        "Obsidienne: +5 ténèbres",
        "Onyx: +4 ténèbres, +4 mort",
        "Opale: +2 images, +2 imagination, +2 invisibilité, +4 mémoire, +4 voyage, +6 yeux",
        "Ovum Anguinum: +2 arguments juridiques, +2 résister aux blessures, +2 contre les infections et poisons",
        "Flûte de Pan: +3 affecter les émotions, +5 contrôler les enfants, +5 festivités, +6 affecter les émotions des fées",
        "Parchemin: +2 affecter l’écriture, +2 amulette mineure",
        "Perle: +5 détecter ou éliminer les poisons",
        "Pennyroyal: +3 guérison",
        "Poivre: +2 Perdo",
        "Péridot: +3 protection contre les cauchemars",
        "Violette: +1 loyauté ou affection, +3 amour",
        "Phylactère: +5 protéger le porteur",
        "Pique: +4 détruire la pierre",
        "Plume de pin: +2 Auram, +5 vol",
        "Fourche: +2 récolter les grains, +4 déplacer ou détruire la terre",
        "Platine: +4 Air",
        "Quartz: +5 invisibilité",
        "Plume: +7 écriture",
        "Crâne de rat: +3 causer des maladies",
        "Or rouge: +1 Perdo, +4 guerre",
        "Rhodocrosite: +3 oubli, +2 souvenirs, +3 lier les blessures",
        "Anneau: +2 effet constant",
        "Cristal roche: +3 guérison, +3 glace, +4 clarté, +5 clairvoyance",
        "Pièce: +4 créer des choses à l’intérieur, +6 affecter tout à l’intérieur en même temps",
        "Corde: +2 étranglement, +4 contrainte ou lien",
        "Rubis: +2 courage, +3 affecter le sang, +3 blessures de guerre, +4 leadership en guerre, +6 effet lié au feu",
        "Tapis: +3 affecter ceux qui y sont",
        "Selle: +4 affecter le cheval, +7 affecter la monte",
        "Safran: +4 force physique",
        "Saphir: +2 connaissance, +2 Perdo Vim contre les esprits, +2 contre le Corpus malveillant, +3 guérison, +3 réduire la colère",
        "Sardoine: +2 contre le Corpus malveillant",
        "Écaille: +3 peser les biens et l’argent",
        "Faucheuse: +3 récolte, +3 effets de durée d’un an, +4 effets causant spécifiquement la mort",
        "Coquillage de mer: +2 la mer, +3 créatures marines",
        "Menottes: +6 contrainte ou lien magique",
        "Lame aiguisée: +2 façonner le cuir",
        "Ciseaux à tondre: +2 tondre",
        "Bouclier: +5 protection",
        "Voile de navire: +4 affecter les vents, +7 navigation",
        "Serpe: +2 récolte",
        "Langue de serpent: +6 mensonge, +3 tromperie",
        "Cisaille : +2 façonner le métal",
        "Pelle: +2 déplacer la terre, +4 déplacer ou détruire la terre",
        "Épée: +3 bloquer une attaque, +4 nuire aux corps humains et animaux",
        "Tablette: +1 affecter l’écriture, +2 commander aux esprits",
        "Foudre: +2 Auram, +3 foudre, +4 protection contre les démons",
        "Pinces: +2 contrôler le métal",
        "Jouet: +4 contrôler les enfants",
        "Truelle: +2 construction",
        "Bâton: +2 repousser les choses, +3 projeter un projectile ou autre missile, +4 contrôler les choses à distance, +4 détruire les choses à distance",
        "Outre: +5 créer du liquide à l’intérieur",
        "Fouet: +4 contrôler le corps humain ou animal, +5 induire la peur chez les animaux",
        "Santal Jaune: +3 lier les gens",
        "Joug: +4 contrôler le porteur, +5 augmenter la force du porteur"],

    EXPERIMENTATIONRISKFACTORS : ["0", "+1", "+2", "+3"],
    SIMILAROBJECTBONUSES : ["Aucun objet similaire: 0", "Objet vaguement similaire: +1", "Objet similaire (même technique/forme/effet): +3", "Objet identique: +5"],
    ENCHANTDAILYUSECAPS : [
        "1 utilisation par jour: 0", "2 utilisation par jour: +1", "3 utilisation par jour: +2", "6 utilisation par jour: +3", "12 utilisation par jour: +4", "24 utilisation par jour: +5", 
        "50 utilisation par jour: +6", "Illimitée: +10", ],
    ENCHANTRANGES : [
        'Personnel (ArM5): +0', 'Contact visuel (ArM5): +1', 'Prop (RoP: F): +1', 'Toucher (ArM5): +1', 'Croisée des chemins (RoP: TI, RoP: F): +2', 'Présence (RoP: TD, RoP: F): +2', 
        'Route (ArM5 & TMRE): +2', 'Voix (ArM5): +2', 'Ligne (TMRE): +3', 'Vue (ArM5): +3', 'Voile de la Mort (AM): +3', 'Chemin d’eau (RoP: M): +3', 'Lien Arcanique (ArM5): +4', 
        'Communion (RoP:TD): +4', 'Symbole (HoH: MC, RoP: F): +4'],
    ENCHANTDURATIONS : [
        'Momentané (ArM5): +0', 'Concentration (ArM5): +1', 'Diamètre (ArM5): +1', 'Rêve (TMRE): +1', 'Focus (RoP: F): +1', 'Tenue (HoH: MC): +1 (Special)', 'Minutes (TMRE): +1', 
        'Office (RoP: TD): +1', 'Performance (TMRE): +1', 'Récitation (RoP: TD): +1', 'Tempête (RoP: M): +1', 'Pendant (HoH: MC): +1', 'Maudit (RoP: TI): +2 (Special)', 
        'Dévotion (RoP: TD): +2', 'Géas (RoP: F): +2 (Special)', 'Heure +1 (RoP: F): +2', 'Heures (TMRE): +2', 'Midi/Minuit (HoH: MC, RoP: F): +2 (Special)', 'Non (HoH: MC, RoP: F): +2', 
        'Anneau (ArM5): +2', 'Sabbat (RoP: TD): +2', 'Soleil (ArM5): +2', '40 (RoP: TD): +3', 'Anneau Arcanique (TMRE): +3', 'Marché (ArM5): +3 (Special)', 'Jours (TMRE): +3', 
        'Jeûne (RoP: TD): +3', 'Feu (ArM5): +3', 'Lune (ArM5): +3', 'Rune (AM): +3', 'Si (HoH: MC, RoP: F): +4 (Special)'],
    ENCHANTTARGETS : [
        'Individu (ArM5): +0', 'Cercle (ArM5): +0', 'Rêve (TMRE): +0', 'Saveur (HoH: MC): +0', 'Inscription (AM): +0', 'Péché (RoP: TD): +0', 'Goût (ArM5): +0', 
        'Enfant à naître (AM): +0', 'Cercle Arcanique (TMRE): +1', 'Médium (RoP: F): +1 (Special)', 'Partie (ArM5): +1', 'Texture (HoH: MC): +1', 'Toucher (ArM5): +1', 
        'Foi (RoP: TD): +2', 'Groupe (ArM5): +2', 'Passion (RoP: TI, RoP: F): +2', 'Route (TMRE): +2', 'Salle (ArM5): +2', 'Parfum (HoH: MC): +2', 'Odeur (ArM5): +2', 
        'Lignée (ArM5): +3', 'Étendue d’eau (RoP: M): +3', 'Ouïe (ArM5): +3', 'Son (HoH: MC): +3', 'Structure (ArM5): +3', 'Spectacle (HoH: MC): +4', 'Vision (ArM5): +4'],
    ENCHANTTECHNIQUES : ['Creo','Intellego','Muto','Perdo','Rego'],
    ENCHANTFORMS : ['Animal','Aquam','Auram','Corpus','Herbam','Ignem','Imaginem','Mentem','Terram','Vim'],
    ENCHANTEXPIRATIONMODS : ["Éternel: x1", "70 ans: x2", "7 ans: x5", "1 année: x10"],
    EXPEXTRAORDIANRYRESULTSTABLE : ["Désastre", "Pas d’effet extraordinaire", "Effet secondaire", "Pas d’avantage", "Échec total", "Évènement spécial ou d’histoire", "Découverte", "Effet modifié", 
        "Faites deux jets de plus sur cette table"],
    EXPDISASTERTABLE : ["Vous devinez le désastre avant qu’il ne se produise. Votre saison est gâchée ; cf. « Échec total ».", "Votre création est détruite.", "Votre création est détruite, ainsi qu’un autre des objets précieux que vous conservez dans votre laboratoire.", 
        "Explosion ! L’équipement de votre laboratoire est détruit et vous devez lancer un dé simple pour chaque possession de valeur que vous conservez dans votre laboratoire. Sur un 0, la possession est détruite. Vous recevrez un nombre de dégâts égal à un dé simple + le niveau du sort ou de l’effet sur lequel vous travaillez.", 
        "Votre expérience tourne tellement mal que toute l’alliance est menacée par le feu, l’invocation d’une menace majeure ou par quelque autre calamité définie par le conteur.", "Vous gagnez un nombre de points de Distorsion égal au nombre de 0 sur les dés de désastre. Faites un jet de Crépuscule si vous en gagnez 2 ou plus.", 
        "Faites deux jets de plus sur cette table."],
    EXPSECONDARYEFFECTTABLE : ["Votre sceau est exagéré à plusieurs fois sa force normale, devenant une partie majeure de l'effet.", "L'effet a un défaut mineur. Par exemple, un sort vous permettant de communiquer avec les animaux fait que vous conservez certains schémas de langage de l'animal pendant un certain temps après que le sort a expiré.", 
        "Le sort a un effet secondaire mineur. Par exemple, un sort permettant de contrôler un animal fait pousser l'herbe sous ses pattes.", "Le sort a un effet bénéfique mineur. Par exemple, un sort de vent aura une odeur agréable et entravera le vol des insectes.", "Le sort a un défaut majeur. Par exemple, un sort de soins causera une grande douleur à la Cible. ", 
        "Le sort a un effet secondaire majeur. Par exemple, un sort de contrôle des plantes attirera tous les oiseaux à cents pas. ", "Le sort a un effet bénéfique majeur. Par exemple, un sort permettant de se transformer en loup vous permettra également de parler à toutes les créatures tant que vous serez sous forme de loup.", 
        "Le sort a un défaut fâcheux. Par exemple, un sort d'invisibilité vous fera briller."],
    EXPDISCOVERYTABLE : ["Vous gagnez 15 points d' expé1ience en Théolie de la magie.", "Vous gagnez 15 points d'expérience dans une Compétence liée à l'expérience.", "Vous gagnez 3 points d'expérience dans l'un des Arts utilisés pour l'expérience.", 
        "Vous gagnez suffisamment de points d'expérience pour monter l'un des Arts utilisés pour l'expérience au niveau supérieur ou trois points d'expérience (le plus haut des deux).", "Relancez deux fois et relancez à nouveau si vous obtenez ce résultat."],
    EXPMODIFIEDEFFECTTABLE : ["Le sort ou l'effet voit sa Portée, sa Durée, sa Cible ou sa puissance réduite.", " Le sort ou l'effet voit sa Portée, sa Durée, sa Cible ou sa puissance augmentée.", "L'utilisation du sort ou de l'effet est limitée. Par exemple, il échoue dans certaines circonstances, comme quand il pleut.", 
        "Le véritable effet de votre expérience est modifié. Par exemple, un sort comme Malédiction de Circé (cf. p. 201) transforme la Cible en chèvre, non en porc.", " Le véritable effet de votre expérience est complètement modifié, à l'exception de la Technique et de la Forme, qui restent inchangées, et du niveau, qui reste similaire."],
}

// Define the json format of saved character sheets.
const CHARSHEETFORMAT = {'charID' : 0,
                        'charName' : 'Inconnu',
                        'house' : 'Bjornaer',
                        'intValue' : 0,
                        'vertuesCharList' : {},
                        'vicesCharList' : {},
                        'compCharList' : Object.fromEntries(OPTIONLISTS['COMPLIST'].map(x => [x, [0, '']])),
                        'artsCharList' : Object.fromEntries(ARTSLIST.map(x => [x, 0])),
                        'labAura' : 0,
                        'customLab' : {
                            'labQG' : 0,
                            'labDistortion' : 0,
                            'labFocuses' : Object.fromEntries(OPTIONLISTS['FOCUSTITLES'].map(x => [x, [0, '']])),
                        },
};

// Define the json format of saved enchanted items.
// First we list of variables that depend on each specific season.
const ITEMENCHANTSSEASONFORMAT = {'seasonID' : 0,
                                  'labTotal' : 0,
                                  'effectiveLabTotal' : 0,
                                  
                                  'applicableContextualVertuesAndFlaws' : {},
                                  'applicableCraft' : '',
                                  'applicableShape' : {},
                                  'applicableMaterial' : {},
                                  
                                  'assistantIntBonus' : 0,
                                  'assistantTheoryBonus' : 0,
                                  'similarSpellBonus' : 0,
                                  'similarObjectBonus' : "Aucun objet similaire : 0",
                                  'similarEnchantmentBonus' : 0,
                                  'additionalBonuses' : 0,

                                  'experimentedBool' : false,
                                  'experimentationBonusResult' : 0,
                                  'experimentationRiskFactor' : 0,
                                  'experimentButtonState' : 0,
                                  'experimentCurrentMultiplier' : 1,

                                  'experimentationExtraordinaryRollsLeft' : 1,
                                  'experimentationExtraordinaryRollsResults' : [],

                                  'experimentationDisasterCheckRollsLeft' : 0,
                                  'experimentationDisasterCheckRollsResults' : [],

                                  'experimentationDisasterTableRollsLeft' : 1,
                                  'experimentationDisasterTableRollsResults' : [],

                                  'experimentationTotalFailureCheck' : false,

                                  'experimentationSecondaryEffectCasesResults' : [],
                                  'experimentationDiscoveryTableRollsLeft' : 1,
                                  'experimentationDiscoveryFirstRoll' : true,
                                  'experimentationDiscoveryCasesResults' : [],
                                  'experimentationModifiedEffectCasesResults' : [],
                                  'experimentationConsequences' : [],
}

// Then the the enchantmene variables and the lab total, since it uses the season values above. 
const ITEMENCHANTSFORMAT = {'enchantID' : 0,
                            'enchantBaseLvl' : 0,
                            'enchantTotalLvl' : 0,
                            'enchantCharges' : "X",
                            'enchantVisCost' : 0,
                            'enchantDailyUseCap' : '1 utilisation par jour: 0',
                            'enchantRange' : 'Personnel (ArM5): +0',
                            'enchantDuration' : 'Momentané (ArM5): +0',
                            'enchantTarget' : 'Individu (ArM5): +0',
                            'enchantTechnique' : '',
                            'enchantForm1' : '',
                            'enchantSupp' : '',
                            'enchantPenetrationMod' : 0,
                            'enchantConcentrationMod' : false,
                            'enchantExpirationMod' : '',
                            'enchantLimitedUsersMod' : false,
                            'enchantLimitedUsersList' : '',
                            'enchantEnvTriggerMod' : false,
                            'enchantEnvTriggerCondition' : '',
                            'enchantLinkedTriggerMod' : false,
                            'enchantLinkedTriggerCondition' : '',
                            'enchantDescription' : '',

                            'seasonsSpent' : {},
                            'bonusFromFailedSeasons' : 0,
                            'leftoverFromLastSeasonMajorItems' : 0,
                            'enchanted' : false,
};

// And finally define the part that defines the item itself since it uses all of the above.
const ITEMSHEETFORMAT = {'itemID' : 0,
                         'itemName' : 'Objet Enchanté',
                         'manufacturerName' : '',
                         'manufacturerID': null,
                         'itemType' : '',
                         'itemMaterial' : '',
                         'itemSize' : '',
                         'itemVisCostAndPotential' : 0,
                         'itemShapeBonus' : '',
                         'itemMaterialBonus' : '',
                         'itemDescription' : '',
                         'enchantments' : {},
                         'itemIsDestroyed' : 0,
};
// ---------------------------------------------------------------------------------------------------------
// ----------------------------------------------- Functions -----------------------------------------------
// -------------------------------------- Main Function --------------------------------------
function main() {
    let currentPage = window.location.hash
    window.location.hash = 'launch';
    window.location.hash = currentPage;
};
// -------------------------------------------------------------------------------------------
// --------------------------------------- Hash Router ---------------------------------------
// Écouter l'événement
window.addEventListener("hashchange", function(event) {
    // Reset the colour of the background, in case we traveled from a destroyed item.
    document.body.style.backgroundColor = 'rgb(93, 175, 252)';
    // Récupérer la nouvelle valeur de l'ancre
    let hash = window.location.hash;
    // Route the user to the correct page given the hash.
    switch (true) {
        case /^#CharacterNumber\d$/.test(hash):
            SelectedCharPage(MAINCONTAINER, OPTIONLISTS, hash.split('#CharacterNumber')[1])
            break;
            case /^#CharacterNumber\d+#Enchanting_(minor|major|charge)\.\d+$/.test(hash):
            EnchantmentPage(MAINCONTAINER, hash.split('#CharacterNumber')[1].split('#Enchanting')[0], ITEMSHEETFORMAT, ITEMENCHANTSFORMAT, ITEMENCHANTSSEASONFORMAT, ENCHANTEMENTOPTIONLISTS)
            break;
        default:
            SelectionMenuPage(MAINCONTAINER, CHARSHEETFORMAT);
            break;
    }
});
// -------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
// ------------------------------------------------- Calls -------------------------------------------------
main();
// ---------------------------------------------------------------------------------------------------------