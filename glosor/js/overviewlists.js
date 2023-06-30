AllPracticeLists=[]
let persistenceManager = new PersistenceManager();

// Function to save AllPracticeLists to local storage
function saveAllPracticeLists() {
  localStorage.setItem("LocalPracticeListNames", JSON.stringify(AllPracticeLists));
}

// Function to load AllPracticeLists from local storage
function loadAllPracticeLists() {
  const practiceLists = localStorage.getItem("LocalPracticeListNames");
  if (practiceLists) {
    AllPracticeLists = JSON.parse(practiceLists);
  }
}

// Function to render the practice lists
function renderPracticeLists() {
  const practiceListsContainer = document.getElementById("practiceLists");
  practiceListsContainer.innerHTML = "";

  AllPracticeLists.forEach((name, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <span>${name}</span>
      <button class="trainButton" data-index="${index}">Träna på</button>
      <button class="openButton" data-index="${index}">Editera</button>
      <button class="removeButton" data-index="${index}">Ta bort</button>
      <button class="changeNameButton" data-index="${index}">Ändra namn</button>
      <button class="copyButton" data-index="${index}">Kopiera</button>
      <button class="exportButton" data-index="${index}">Exportera</button>
    `;
    practiceListsContainer.appendChild(listItem);
  });

  saveAllPracticeLists(); // Save changes to local storage
}

// Function to add a new practice list
function addPracticeList(name) {
  AllPracticeLists.push(name);
  renderPracticeLists();
}

// Function to remove a practice list
function removePracticeList(index) {
  AllPracticeLists.splice(index, 1);
  renderPracticeLists();

}

// Function to change the name of a practice list
function changePracticeListName(index, newName) {
  oldName = AllPracticeLists[index];
  AllPracticeLists[index] = newName;
  renderPracticeLists();
  practiceList = persistenceManager.getPracticeListByName(oldName);
  practiceList.name = newName;
  persistenceManager.savePracticeList(practiceList);
  persistenceManager.deletePracticeList(oldName);
}

// Function to copy a practice list
function copyPracticeList(index) {
  const oldName = AllPracticeLists[index];
  const newName = prompt("Enter a new name for the copied practice list:");
  if (newName !== null) {
    const isNameUnique = AllPracticeLists.every((list, i) => i === index || list !== newName.trim());
    if (isNameUnique) {
      AllPracticeLists.push(newName.trim());

      practiceList = persistenceManager.getPracticeListByName(oldName);
      practiceList.name = newName;
      persistenceManager.savePracticeList(practiceList);

      renderPracticeLists();
    } else {
      alert("A practice list with that name already exists. Please choose a different name.");
    }
  }
}

// Event listener for form submission
const addListForm = document.getElementById("addListForm");
addListForm.addEventListener("submit", function(event) {
  event.preventDefault();
  const listNameInput = document.getElementById("listNameInput");
  const name = listNameInput.value.trim();
  if (name !== "") {
    addPracticeList(name);
    listNameInput.value = "";
  }
});

// Event delegation for open, remove, change name, and copy buttons
const practiceListsContainer = document.getElementById("practiceLists");
practiceListsContainer.addEventListener("click", function(event) {
  const target = event.target;
  if (target.classList.contains("trainButton")) {
    const index = target.getAttribute("data-index");
    const name = AllPracticeLists[index];
    window.open(`rehearsal.html?localList=${encodeURIComponent(name)}`, "_self");
  } else if (target.classList.contains("openButton")) {
    const index = target.getAttribute("data-index");
    const name = AllPracticeLists[index];
    window.open(`editlist.html?localList=${encodeURIComponent(name)}`, "_self");
  } else if (target.classList.contains("removeButton")) {
    const index = target.getAttribute("data-index");
    const name = AllPracticeLists[index];
    const confirmed = confirm(`Are you sure you want to remove the practice list "${name}"?`);
    if (confirmed) {
      removePracticeList(index);
    }
  } else if (target.classList.contains("changeNameButton")) {
    const index = target.getAttribute("data-index");
    const name = AllPracticeLists[index];
    const newName = prompt("Enter a new name for the practice list:", name);
    if (newName !== null) {
      changePracticeListName(index, newName.trim());
    }
  } else if (target.classList.contains("copyButton")) {
    const index = target.getAttribute("data-index");
    copyPracticeList(index);
  } else if (target.classList.contains("exportButton")) {
    const index = target.getAttribute("data-index");
    const name = AllPracticeLists[index];
    window.open(`export.html?localList=${encodeURIComponent(name)}`, "_self");
  }
});

// Load practice lists from local storage on page load
loadAllPracticeLists();

// Initial rendering of practice lists
renderPracticeLists();

