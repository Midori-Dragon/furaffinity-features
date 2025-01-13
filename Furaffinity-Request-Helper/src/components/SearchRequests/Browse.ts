import { WaitAndCallAction } from '../../utils/WaitAndCallAction';
import { Semaphore } from '../../utils/Semaphore';
import { Page } from '../GalleryRequests/Page';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';
import { SearchRequests } from '../../modules/SearchRequests';
import { convertToNumber } from '../../utils/GeneralUtils';

export class Browse {
    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    public static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/browse/';
    }

    public get newBrowseOptions(): BrowseOptions {
        return new BrowseOptions();
    }
    public static get newBrowseOptions(): BrowseOptions {
        return new BrowseOptions();
    }

    public get BrowseOptions(): typeof BrowseOptions {
        return BrowseOptions;
    }
    public static get BrowseOptions(): typeof BrowseOptions {
        return BrowseOptions;
    }

    public async getFiguresBetweenIds(fromId?: string | number, toId?: string | number, browseOptions?: BrowseOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        
        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getBrowseFiguresTillId, [toId, undefined, browseOptions, this._semaphore], action, delay);
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getBrowseFiguresSinceId, [fromId, undefined, browseOptions, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getBrowseFiguresBetweenIds, [fromId, toId, undefined, undefined, browseOptions, this._semaphore], action, delay, true);
        }
    }

    public async getFiguresBetweenIdsBetweenPages(fromId?: string | number, toId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, browseOptions?: BrowseOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);
        
        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getBrowseFiguresTillId, [toId, fromPageNumber, browseOptions, this._semaphore], action, delay);
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getBrowseFiguresSinceId, [fromId, toPageNumber, browseOptions, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getBrowseFiguresBetweenIds, [fromId, toId, fromPageNumber, toPageNumber, browseOptions, this._semaphore], action, delay, true);
        }
    }

    public async getFiguresBetweenPages(fromPageNumber?: string | number, toPageNumber?: string | number, browseOptions?: BrowseOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);
        
        if (fromPageNumber == null || fromPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getBrowseFiguresTillPage, [toPageNumber, browseOptions, this._semaphore], action, delay, true);
        } else if (toPageNumber == null || toPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getBrowseFiguresSincePage, [fromPageNumber, browseOptions, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getBrowseFiguresBetweenPages, [fromPageNumber, toPageNumber, browseOptions, this._semaphore], action, delay, true);
        }
    }

    public async getFigures(pageNumber?: string | number, browseOptions?: BrowseOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[]> {
        pageNumber = convertToNumber(pageNumber);
        
        return await WaitAndCallAction.callFunctionAsync(SearchRequests.getBrowseFigures, [pageNumber, browseOptions, this._semaphore], action, delay);
    }

    public async getPage(pageNumber?: string | number, browseOptions?: BrowseOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);
        
        return await WaitAndCallAction.callFunctionAsync(Page.getBrowsePage, [pageNumber, browseOptions, this._semaphore], action, delay);
    }
}

export class BrowseOptions {
    public category: number | undefined;
    public type: number | undefined;
    public species: number | undefined;
    public gender: number | undefined;
    public results: number | undefined;
    public ratingGeneral: boolean;
    public ratingMature: boolean;
    public ratingAdult: boolean;

    constructor() {
        this.category = BrowseOptions.category['all'];
        this.type = BrowseOptions.type['all'];
        this.species = BrowseOptions.species['any'];
        this.gender = BrowseOptions.gender['any'];
        this.results = BrowseOptions.results['72'];
        this.ratingGeneral = true;
        this.ratingMature = true;
        this.ratingAdult = true;
    }

    public static get category(): Record<string, number> {
        return {
            'all': 1,
            'artwork-digital': 2,
            'artwork-traditional': 3,
            'cel-shading': 4,
            'crafting': 5,
            'designs': 6,
            'flash': 7,
            'fursuiting': 8,
            'icons': 9,
            'mosaics': 10,
            'photography': 11,
            'food-recipes': 32,
            'sculpting': 12,
            'story': 13,
            'poetry': 14,
            'prose': 15,
            'music': 16,
            'podcasts': 17,
            'skins': 18,
            'handhelds': 19,
            'resources': 20,
            'adoptables': 21,
            'auctions': 22,
            'contests': 23,
            'current-events': 24,
            'desktops': 25,
            'stockart': 26,
            'screenshots': 27,
            'scraps': 28,
            'wallpaper': 29,
            'ych-sale': 30,
            'other': 31
        };
    }
    public static get type(): Record<string, number> {
        return {
            'all': 1,
            'abstract': 2,
            'animal-related-non-anthro': 3,
            'anime': 4,
            'comics': 5,
            'doodle': 6,
            'fanart': 7,
            'fantasy': 8,
            'human': 9,
            'portraits': 10,
            'scenery': 11,
            'still-life': 12,
            'tutorials': 13,
            'miscellaneous': 14,
            'baby-fur': 101,
            'bondage': 102,
            'digimon': 103,
            'fat-furs': 104,
            'fetish-other': 105,
            'fursuit': 106,
            'gore': 119,
            'hyper': 107,
            'hypnosis': 121,
            'inflation': 108,
            'micro': 109,
            'muscle': 110,
            'my-little-pony': 111,
            'paw': 112,
            'pokemon': 113,
            'pregnancy': 114,
            'sonic': 115,
            'transformation': 116,
            'tf-tg': 120,
            'vore': 117,
            'water-sports': 118,
            'general-furry-art': 100,
            'techno': 201,
            'trance': 202,
            'house': 203,
            '90s': 204,
            '80s': 205,
            '70s': 206,
            '60s': 207,
            'pre-60s': 208,
            'classical': 209,
            'game-music': 210,
            'rock': 211,
            'pop': 212,
            'rap': 213,
            'industrial': 214,
            'other-music': 200
        };
    }
    public static get species(): Record<string, number> {
        return {
            'any': 1,
            'airborne-vehicle': 10001,
            'alien': 5001,
            'amphibian': 1000,
            'aquatic': 2000,
            'avian': 3000,
            'bear': 6002,
            'bovine': 6007,
            'canine': 6017,
            'cervine': 6018,
            'dog': 6010,
            'dragon': 4000,
            'equine': 10009,
            'exotic': 5000,
            'feline': 6030,
            'fox': 6075,
            'slime': 10007,
            'hybrid-species': 10002,
            'inanimate': 10006,
            'insect': 8003,
            'land-vehicle': 10003,
            'mammal': 6000,
            'marsupial': 6042,
            'mustelid': 6051,
            'plant': 10008,
            'primate': 6058,
            'reptilian': 7000,
            'robot': 10004,
            'rodent': 6067,
            'sea-vehicle': 10005,
            'taur': 5025,
            'vulpine': 6015,
            'original-species': 11014,
            'character': 11015,
            'aeromorph': 11001,
            'angel-dragon': 11002,
            'avali': 11012,
            'chakat': 5003,
            'citra': 5005,
            'crux': 5006,
            'dracat': 5009,
            'dutch': 11003,
            'felkin': 11011,
            'ferrin': 11004,
            'jogauni': 11005,
            'langurhali': 5014,
            'nevrean': 11006,
            'protogen': 11007,
            'rexouium': 11016,
            'sergal': 5021,
            'synx': 11010,
            'wickerbeast': 11013,
            'yinglet': 11009,
            'zorgoia': 11008,
            'angel': 12001,
            'centaur': 12002,
            'cerberus': 12003,
            'shape-shifter': 12038,
            'chimera': 12004,
            'chupacabra': 12005,
            'cockatrice': 12006,
            'daemon': 5007,
            'demon': 12007,
            'displacer-beast': 12008,
            'dragonborn': 12009,
            'drow': 12010,
            'dwarf': 12011,
            'eastern-dragon': 4001,
            'elf': 5011,
            'gargoyle': 5012,
            'goblin': 12012,
            'golem': 12013,
            'gryphon': 3007,
            'harpy': 12014,
            'hellhound': 12015,
            'hippogriff': 12016,
            'hobbit': 12017,
            'hydra': 4002,
            'imp': 12018,
            'incubus': 12019,
            'jackalope': 12020,
            'kirin': 12021,
            'kitsune': 12022,
            'kobold': 12023,
            'lamia': 12024,
            'manticore': 12025,
            'minotaur': 12026,
            'naga': 5016,
            'nephilim': 12027,
            'orc': 5018,
            'pegasus': 12028,
            'peryton': 12029,
            'phoenix': 3010,
            'sasquatch': 12030,
            'satyr': 5020,
            'sphinx': 12031,
            'succubus': 12032,
            'tiefling': 12033,
            'troll': 12034,
            'unicorn': 5023,
            'water-dragon': 12035,
            'werewolf': 12036,
            'western-dragon': 4004,
            'wyvern': 4005,
            'yokai': 12037,
            'alicorn': 13001,
            'argonian': 5002,
            'asari': 13002,
            'bangaa': 13003,
            'bubble-dragon': 13004,
            'burmecian': 13005,
            'charr': 13006,
            'chiss': 13007,
            'chocobo': 5004,
            'deathclaw': 13008,
            'digimon': 5008,
            'draenei': 5010,
            'drell': 13009,
            'elcor': 13010,
            'ewok': 13011,
            'hanar': 13012,
            'hrothgar': 13013,
            'iksar': 5013,
            'kaiju': 5015,
            'kelpie': 13041,
            'kemonomimi': 13014,
            'khajiit': 13015,
            'koopa': 13016,
            'krogan': 13017,
            'lombax': 13018,
            'mimiga': 13019,
            'mobian': 13020,
            'moogle': 5017,
            'neopet': 13021,
            'nu-mou': 13022,
            'pokemon': 5019,
            'pony-mlp': 13023,
            'protoss': 13024,
            'quarian': 13025,
            'ronso': 13026,
            'salarian': 13027,
            'sangheili': 13028,
            'tauntaun': 13029,
            'tauren': 13030,
            'trandoshan': 13031,
            'transformer': 13032,
            'turian': 13033,
            'twilek': 13034,
            'viera': 13035,
            'wookiee': 13036,
            'xenomorph': 5024,
            'yautja': 13037,
            'yordle': 13038,
            'yoshi': 13039,
            'zerg': 13040,
            'aardvark': 14001,
            'aardwolf': 14002,
            'african-wild-dog': 14003,
            'akita': 14004,
            'albatross': 14005,
            'crocodile': 7001,
            'alpaca': 14006,
            'anaconda': 14007,
            'anteater': 14008,
            'antelope': 6004,
            'arachnid': 8000,
            'arctic-fox': 14009,
            'armadillo': 14010,
            'axolotl': 14011,
            'baboon': 14012,
            'badger': 6045,
            'bat': 6001,
            'beaver': 6064,
            'bee': 14013,
            'binturong': 14014,
            'bison': 14015,
            'blue-jay': 14016,
            'border-collie': 14017,
            'brown-bear': 14018,
            'buffalo': 14019,
            'buffalo-bison': 14020,
            'bull-terrier': 14021,
            'butterfly': 14022,
            'caiman': 14023,
            'camel': 6074,
            'capybara': 14024,
            'caribou': 14025,
            'caterpillar': 14026,
            'cephalopod': 2001,
            'chameleon': 14027,
            'cheetah': 6021,
            'chicken': 14028,
            'chimpanzee': 14029,
            'chinchilla': 14030,
            'chipmunk': 14031,
            'civet': 14032,
            'clouded-leopard': 14033,
            'coatimundi': 14034,
            'cockatiel': 14035,
            'corgi': 14036,
            'corvid': 3001,
            'cougar': 6022,
            'cow': 6003,
            'coyote': 6008,
            'crab': 14037,
            'crane': 14038,
            'crayfish': 14039,
            'crow': 3002,
            'crustacean': 14040,
            'dalmatian': 14041,
            'deer': 14042,
            'dhole': 14043,
            'dingo': 6011,
            'dinosaur': 8001,
            'doberman': 6009,
            'dolphin': 2002,
            'donkey': 6019,
            'duck': 3003,
            'eagle': 3004,
            'eel': 14044,
            'elephant': 14045,
            'falcon': 3005,
            'fennec': 6072,
            'ferret': 6046,
            'finch': 14046,
            'fish': 2005,
            'flamingo': 14047,
            'fossa': 14048,
            'frog': 1001,
            'gazelle': 6005,
            'gecko': 7003,
            'genet': 14049,
            'german-shepherd': 6012,
            'gibbon': 14050,
            'giraffe': 6031,
            'goat': 6006,
            'goose': 3006,
            'gorilla': 6054,
            'gray-fox': 14051,
            'great-dane': 14052,
            'grizzly-bear': 14053,
            'guinea-pig': 14054,
            'hamster': 14055,
            'hawk': 3008,
            'hedgehog': 6032,
            'heron': 14056,
            'hippopotamus': 6033,
            'honeybee': 14057,
            'horse': 6034,
            'housecat': 6020,
            'human': 6055,
            'humanoid': 14058,
            'hummingbird': 14059,
            'husky': 6014,
            'hyena': 6035,
            'iguana': 7004,
            'impala': 14060,
            'jackal': 6013,
            'jaguar': 6023,
            'kangaroo': 6038,
            'kangaroo-mouse': 14061,
            'kangaroo-rat': 14062,
            'kinkajou': 14063,
            'kit-fox': 14064,
            'koala': 6039,
            'kodiak-bear': 14065,
            'komodo-dragon': 14066,
            'labrador': 14067,
            'lemur': 6056,
            'leopard': 6024,
            'liger': 14068,
            'linsang': 14069,
            'lion': 6025,
            'lizard': 7005,
            'llama': 6036,
            'lobster': 14070,
            'longhair-cat': 14071,
            'lynx': 6026,
            'magpie': 14072,
            'maine-coon': 14073,
            'malamute': 14074,
            'mammal-feline': 14075,
            'mammal-herd': 14076,
            'mammal-marsupial': 14077,
            'mammal-mustelid': 14078,
            'mammal-other predator': 14079,
            'mammal-prey': 14080,
            'mammal-primate': 14081,
            'mammal-rodent': 14082,
            'manatee': 14083,
            'mandrill': 14084,
            'maned-wolf': 14085,
            'mantid': 8004,
            'marmoset': 14086,
            'marten': 14087,
            'meerkat': 6043,
            'mink': 6048,
            'mole': 14088,
            'mongoose': 6044,
            'monitor-lizard': 14089,
            'monkey': 6057,
            'moose': 14090,
            'moth': 14091,
            'mouse': 6065,
            'musk-deer': 14092,
            'musk-ox': 14093,
            'newt': 1002,
            'ocelot': 6027,
            'octopus': 14094,
            'okapi': 14095,
            'olingo': 14096,
            'opossum': 6037,
            'orangutan': 14097,
            'orca': 14098,
            'oryx': 14099,
            'ostrich': 14100,
            'otter': 6047,
            'owl': 3009,
            'panda': 6052,
            'pangolin': 14101,
            'panther': 6028,
            'parakeet': 14102,
            'parrot': 14103,
            'peacock': 14104,
            'penguin': 14105,
            'persian-cat': 14106,
            'pig': 6053,
            'pigeon': 14107,
            'pika': 14108,
            'pine-marten': 14109,
            'platypus': 14110,
            'polar-bear': 14111,
            'pony': 6073,
            'poodle': 14112,
            'porcupine': 14113,
            'porpoise': 2004,
            'procyonid': 14114,
            'puffin': 14115,
            'quoll': 6040,
            'rabbit': 6059,
            'raccoon': 6060,
            'rat': 6061,
            'ray': 14116,
            'red-fox': 14117,
            'red-panda': 6062,
            'reindeer': 14118,
            'reptillian': 14119,
            'rhinoceros': 6063,
            'robin': 14120,
            'rottweiler': 14121,
            'sabercats': 14122,
            'sabertooth': 14123,
            'salamander': 1003,
            'scorpion': 8005,
            'seagull': 14124,
            'seahorse': 14125,
            'seal': 6068,
            'secretary-bird': 14126,
            'serpent-dragon': 4003,
            'serval': 14127,
            'shark': 2006,
            'sheep': 14128,
            'shiba-inu': 14129,
            'shorthair-cat': 14130,
            'shrew': 14131,
            'siamese': 14132,
            'sifaka': 14133,
            'silver-fox': 14134,
            'skunk': 6069,
            'sloth': 14135,
            'snail': 14136,
            'snake-serpent': 7006,
            'snow-leopard': 14137,
            'sparrow': 14138,
            'squid': 14139,
            'squirrel': 6070,
            'stoat': 14140,
            'stork': 14141,
            'sugar-glider': 14142,
            'sun-bear': 14143,
            'swan': 3011,
            'swift-fox': 14144,
            'tanuki': 5022,
            'tapir': 14145,
            'tasmanian-devil': 14146,
            'thylacine': 14147,
            'tiger': 6029,
            'toucan': 14148,
            'turtle': 7007,
            'vulture': 14149,
            'wallaby': 6041,
            'walrus': 14150,
            'wasp': 14151,
            'weasel': 6049,
            'whale': 2003,
            'wolf': 6016,
            'wolverine': 6050,
            'zebra': 6071
        };
    }
    public static get gender(): Record<string, number> {
        return {
            'any': 0,
            'male': 2,
            'female': 3,
            'herm': 4,
            'intersex': 11,
            'trans-male': 8,
            'trans-female': 9,
            'non-binary': 10,
            'multiple': 6,
            'other': 7,
            'not-specified': 7
        };
    }
    public static get results(): Record<string, number> {
        return {
            '24': 24,
            '48': 48,
            '72': 72,
            '96': 96,
            '128': 128
        };
    }
}
