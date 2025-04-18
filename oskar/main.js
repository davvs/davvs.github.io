
// a inventory is a object that contains monsters
// a monster is a object that contains name, hp, and image

class Monster {
    constructor(id, hp) {
        this.id = id;
        this.hp = hp;
    }
}

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

// monster database
let monsterDB = [
    { id: 1, name: "Aquanid", image: "aquanid.png" },
    { id: 2, name: "Floweron", image: "Bob.png" },
    { id: 3, name: "Ancient Beast", image: "Bob.png" }
];

function choice(monsterId){
    let monsterDef = monsterDB.find(monster => monster.id === monsterId);

    let monster = new Monster(monsterId, 100);
    backpack.addMonster(monster);
    let monsterName = monsterDef.name;
    alert("HEJ du tog " + monsterName)
    updateInventory();
}

function updateInventory() {
    let inventory = document.getElementById("inventory");
    inventory.innerHTML = ""; // Clear the inventory display

    backpack.monsters.forEach(monster => {
        let monsterDiv = document.createElement("div");
        let monsterId = monster.id;
        monsterImg = monsterDB.find(m => m.id === monsterId).image;
        monsterName = monsterDB.find(m => m.id === monsterId).name;
        monsterDiv.innerHTML = `<img src="${monsterImg}" alt="${monsterName}"><p>${monsterName}</p>`;
        inventory.appendChild(monsterDiv);
    });
}

