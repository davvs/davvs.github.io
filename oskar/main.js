
// a inventory is a object that contains monsters
// a monster is a object that contains name, hp, and image

class Monster {
    constructor(id) {
        this.id = id;
        this.hp = monsterDB.find(monster => monster.id === id).maxHp;
    }
}


// monster database
let monsterDB = [
    { id: 1, name: "Aquanid", image: "aquanid.png", maxHp: 90 },
    { id: 2, name: "Floweron", image: "floweron.png", maxHp: 100 },
    { id: 3, name: "Ancient Beast", image: "ancient_beast.png", maxHp: 110 }
];


class Backpack {
    constructor() {
        this.monsters = [];
    }

    addMonster(monster) {
        this.monsters.push(monster);
    }

    removeMonster(monster) {
        const index = this.monsters.indexOf(monster);
        if (index > -1) {
            this.monsters.splice(index, 1);
        }
    }
}

// create a new inventory
let backpack = new Backpack();

function updateInventory() {
    let inventory = document.getElementById("inventory");
    inventory.innerHTML = "<h2>Dina monster:</h2>"; // Clear the inventory display

    backpack.monsters.forEach(monster => {
        let monsterDiv = document.createElement("div");
        let monsterId = monster.id;
        let monsterDef = monsterDB.find(m => m.id === monsterId);
        let monsterImg = monsterDef.image;
        let monsterName = monsterDef.name;
        let hpMax = monsterDef.maxHp;
        let hp = monster.hp;
        monsterDiv.innerHTML = `<img src="${monsterImg}" alt="${monsterName}"><p>${monsterName} HP:${hp}/${hpMax}</p>`;
        inventory.appendChild(monsterDiv);
    });
}

function updateEncounter(encounterText) {
    let encounter = document.getElementById("encounter");
    encounter.innerHTML = encounterText;
}

function updateChoices(){
    let choices = document.getElementById("choices");
    choices.innerHTML = ""; // Clear the choices display

    //generate two buttons
    let button1 = document.createElement("button");
    button1.innerHTML = "Mörka skogen";
    button1.onclick = function() { enterDarkWoods(); };
    choices.appendChild(button1);

    let button2 = document.createElement("button");
    button2.innerHTML = "Grottan";
    // button1.onclick = function() { alert("TODO"); };
    choices.appendChild(button2);
}

function updateChoicesDarkWoods(){
    let choices = document.getElementById("choices");
    choices.innerHTML = ""; // Clear the choices display

    //generate two buttons
    let button1 = document.createElement("button");
    button1.innerHTML = "Undersöka lyktan";
    // button1.onclick = function() { enterDarkWoods(); };
    choices.appendChild(button1);

    let button2 = document.createElement("button");
    button2.innerHTML = "Springa tillbaka";
    // button1.onclick = function() { alert("TODO"); };
    choices.appendChild(button2);
}

function enterDarkWoods(){
    updateEncounter("Du är i den mörka skogen. Du ser en pumpalykta på marken som lyser. Vad vill du göra?");
    updateChoicesDarkWoods();
}

function choice(monsterId){
    let monsterDef = monsterDB.find(monster => monster.id === monsterId);

    let monster = new Monster(monsterId);
    backpack.addMonster(monster);
    let monsterName = monsterDef.name;
    alert("HEJ du tog " + monsterName)
    updateInventory();
    updateEncounter("Vad vill du utforska nu?");
    updateChoices();

}


