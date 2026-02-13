saved.firstTimePlaying = true //esta flag se tiene que quitar cuando seleccione el pkmn, es lo que hace que no puedas guardar


function saveGame() {
  if (saved.firstTimePlaying == true) return //scary!
  let data = {};

  // Variable suelta
  data.saved = saved;
  data.team = team;

  // Items
  for (const i in item) {
    data[i] = {};
    data[i].got = item[i].got;
    data[i].newItem = item[i].newItem;
  }


  // Shop
  for (const i in shop) {
    data[i] = {};
    data[i].stock = shop[i].stock;
  }

  // Areas
  for (const i in areas) {
    data[i] = {};
    data[i].defeated = areas[i].defeated;
    data[i].hpPercentage = areas[i].hpPercentage;

    if (areas[i].type == "frontier") data[i].level = areas[i].level;
    if (areas[i].type == "frontier") data[i].team = areas[i].team;
    if (areas[i].type == "frontier") data[i].difficulty = areas[i].difficulty;
    if (areas[i].type == "frontier") data[i].tier = areas[i].tier;
    if (areas[i].type == "frontier") data[i].reward = areas[i].reward;
    if (areas[i].type == "frontier") data[i].itemReward = areas[i].itemReward;
    if (areas[i].type == "frontier") data[i].background = areas[i].background;
    if (areas[i].type == "frontier") data[i].fieldEffect = areas[i].fieldEffect;
    if (areas[i].id == "training") data[i].tier = areas[i].tier;
    if (areas[i].id == "training") data[i].currentTraining = areas[i].currentTraining;
    if (areas[i].id == "wildlifePark") data[i].spawns = areas[i].spawns;
    if (areas[i].id == "wildlifePark") data[i].icon = areas[i].icon;
    if (areas[i].id == areas.frontierBattleFactory.id) data[i].icon = areas[i].icon;
  }

  // Pokémon
  for (const i in pkmn) {
    if (!data[i]) data[i] = {};
    data[i].caught = pkmn[i].caught;
    data[i].movepool = pkmn[i].movepool;
    data[i].level = pkmn[i].level;
    data[i].moves = pkmn[i].moves;
    data[i].newmoves = pkmn[i].newmoves;
    data[i].ivs = pkmn[i].ivs;
    data[i].exp = pkmn[i].exp;
    data[i].newEvolution = pkmn[i].newEvolution;
    data[i].ability = pkmn[i].ability;
    data[i].shiny = pkmn[i].shiny;
    data[i].shinyDisabled = pkmn[i].shinyDisabled;
    data[i].hiddenAbilityUnlocked = pkmn[i].hiddenAbilityUnlocked;
    data[i].tag = pkmn[i].tag;
    data[i].ribbons = pkmn[i].ribbons;
    data[i].pokerus = pkmn[i].pokerus;
    data[i].recordSpiraling = pkmn[i].recordSpiraling;
    data[i].movepoolMemory = pkmn[i].movepoolMemory;
    data[i].nuzlocked = pkmn[i].nuzlocked;
    data[i].nickname = pkmn[i].nickname;
    data[i].decor = pkmn[i].decor;
    data[i].decorOwned = pkmn[i].decorOwned;
  }

  // Policy: If logged in, DO NOT save to local storage (only Cloud)
  // If Guest (not logged in), MUST save to local storage
  const authToken = localStorage.getItem('pokechill_token');

  if (!authToken) {
    localStorage.setItem("gameData", JSON.stringify(data));
  }

  // Cloud Save
  if (typeof saveToCloud === 'function') {
    saveToCloud(data);
  }
}

function manualSave() {
  saveGame();

  // Check if logged in for better feedback
  const authToken = localStorage.getItem('pokechill_token');
  if (authToken) {
    alert("Game Saved to Cloud successfully!");
  } else {
    alert("Game Saved to Local Storage! (Log in to enable Cloud Saves & Server Sync)");
  }
}

// ---- CARGAR ----
function loadGame() {
  const raw = localStorage.getItem("gameData");
  if (!raw) {
    return;
  }

  const data = JSON.parse(raw);

  if (data.saved !== undefined) saved = data.saved;
  if (data.team !== undefined) team = data.team;

  for (const i in item) {
    if (data[i]) {
      item[i].got = data[i].got;
      item[i].newItem = data[i].newItem;
    }
  }


  for (const i in shop) {
    if (data[i]) {
      shop[i].stock = data[i].stock;
    }
  }

  for (const i in areas) {
    if (data[i]) {
      areas[i].defeated = data[i].defeated;
      if (data[i].hpPercentage !== undefined) areas[i].hpPercentage = data[i].hpPercentage;

      if (areas[i].type == "frontier") areas[i].level = data[i].level;
      if (areas[i].type == "frontier") areas[i].team = data[i].team;
      if (areas[i].type == "frontier") areas[i].difficulty = data[i].difficulty;
      if (areas[i].type == "frontier") areas[i].tier = data[i].tier;
      if (areas[i].type == "frontier") areas[i].reward = data[i].reward;
      if (areas[i].type == "frontier") areas[i].itemReward = data[i].itemReward;
      if (areas[i].type == "frontier") areas[i].background = data[i].background;
      if (areas[i].type == "frontier") areas[i].fieldEffect = data[i].fieldEffect;
      if (areas[i].id == "training") areas[i].tier = data[i].tier;
      if (areas[i].id == "training") areas[i].currentTraining = data[i].currentTraining;
      if (areas[i].id == "wildlifePark") areas[i].spawns = data[i].spawns;
      if (areas[i].id == "wildlifePark") areas[i].icon = data[i].icon;
      if (areas[i].id == areas.frontierBattleFactory.id) areas[i].icon = data[i].icon;

    }
  }

  for (const i in pkmn) {
    if (data[i]) {
      pkmn[i].caught = data[i].caught;
      pkmn[i].movepool = data[i].movepool;
      pkmn[i].level = data[i].level;
      pkmn[i].moves = data[i].moves;
      pkmn[i].newmoves = data[i].newmoves;
      pkmn[i].ivs = data[i].ivs;
      pkmn[i].exp = data[i].exp;
      pkmn[i].newEvolution = data[i].newEvolution;
      pkmn[i].ability = data[i].ability;
      pkmn[i].shiny = data[i].shiny;
      pkmn[i].shinyDisabled = data[i].shinyDisabled;
      pkmn[i].hiddenAbilityUnlocked = data[i].hiddenAbilityUnlocked;
      pkmn[i].tag = data[i].tag;
      pkmn[i].ribbons = data[i].ribbons;
      pkmn[i].pokerus = data[i].pokerus;
      pkmn[i].recordSpiraling = data[i].recordSpiraling;
      pkmn[i].movepoolMemory = data[i].movepoolMemory;
      pkmn[i].nuzlocked = data[i].nuzlocked;
      pkmn[i].nickname = data[i].nickname;
      pkmn[i].decor = data[i].decor;
      pkmn[i].decorOwned = data[i].decorOwned;
    }
  }


}



async function exportData() {
  const authToken = localStorage.getItem('pokechill_token');
  let rawData = null;

  if (authToken) {
    // Fetch from Cloud
    try {
      const response = await fetch('/api/save', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          rawData = JSON.stringify(json.data);
          alert("Exporting Save from Cloud...");
        }
      }
    } catch (e) {
      console.error("Export fetch error:", e);
      alert("Failed to fetch cloud save for export.");
      return;
    }
  } else {
    // Fallback to local for guests
    saveGame(); // Ensure latest data
    rawData = localStorage.getItem("gameData");
    alert("Exporting Local Save (Guest Mode)...");
  }

  if (!rawData) {
    alert("No save data found to export.");
    return;
  }

  const blob = new Blob([rawData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Pokechill-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a); // Append to body for firefox compatibility
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

setInterval(saveGame, 1 * 60 * 1000);

document.addEventListener("keydown", (ev) => {
  if (ev.key.toLowerCase() === "s") {
    saveGame();
  }
});

function clearData() {
  localStorage.removeItem('gameData');
  localStorage.removeItem('pokechill_token');
  localStorage.removeItem('pokechill_username');
  window.location.reload();
}

function wipeNewUser() {
  localStorage.removeItem('gameData');
  localStorage.removeItem('pokechill_saved_team');
  localStorage.removeItem('pokechill_saved_version');
  window.location.reload();
}