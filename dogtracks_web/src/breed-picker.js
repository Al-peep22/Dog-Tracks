const COMMON_BREEDS = [
  "French Bulldog",
  "Labrador Retriever",
  "Golden Retriever",
  "German Shepherd",
  "Poodle",
  "Dachshund",
  "Bulldog",
  "Beagle",
  "Rottweiler",
  "German Shorthaired Pointer",
  "Pembroke Welsh Corgi",
  "Australian Shepherd",
  "Yorkshire Terrier",
  "Cavalier King Charles Spaniel",
  "Doberman Pinscher",
  "Boxer",
  "Miniature Schnauzer",
  "Cane Corso",
  "Great Dane",
  "Shih Tzu",
  "Siberian Husky",
  "Pomeranian",
  "Boston Terrier",
  "Havanese",
  "Bernese Mountain Dog",
  "English Springer Spaniel",
  "Shetland Sheepdog",
  "Border Collie",
  "Chihuahua",
  "Maltese",
  "Bichon Frise",
  "Cocker Spaniel",
  "Australian Cattle Dog",
  "West Highland White Terrier",
  "Mastiff",
  "Brittany",
  "English Cocker Spaniel",
  "Vizsla",
  "Newfoundland",
  "Weimaraner",
  "American Staffordshire Terrier",
  "American Pit Bull Terrier",
  "American Bulldog",
  "Akita",
  "Alaskan Malamute",
  "Airedale Terrier",
  "Basenji",
  "Basset Hound",
  "Belgian Malinois",
  "Belgian Sheepdog",
  "Belgian Tervuren",
  "Bloodhound",
  "Borzoi",
  "Border Terrier",
  "Bouvier des Flandres",
  "Bull Terrier",
  "Bullmastiff",
  "Cardigan Welsh Corgi",
  "Chinese Crested",
  "Chow Chow",
  "Collie",
  "Dalmatian",
  "English Setter",
  "Flat-Coated Retriever",
  "Fox Terrier",
  "French Spaniel",
  "German Pinscher",
  "Giant Schnauzer",
  "Glen of Imaal Terrier",
  "Greyhound",
  "Irish Setter",
  "Irish Terrier",
  "Irish Wolfhound",
  "Italian Greyhound",
  "Japanese Chin",
  "Keeshond",
  "Kerry Blue Terrier",
  "Komondor",
  "Kuvasz",
  "Leonberger",
  "Lhasa Apso",
  "Manchester Terrier",
  "Miniature Pinscher",
  "Neapolitan Mastiff",
  "Norfolk Terrier",
  "Norwegian Elkhound",
  "Old English Sheepdog",
  "Papillon",
  "Pekingese",
  "Pointer",
  "Portuguese Water Dog",
  "Pug",
  "Rhodesian Ridgeback",
  "Saint Bernard",
  "Samoyed",
  "Scottish Terrier",
  "Staffordshire Bull Terrier",
  "Standard Schnauzer",
  "Tibetan Mastiff",
  "Tibetan Spaniel",
  "Tibetan Terrier",
  "Toy Fox Terrier",
  "Treeing Walker Coonhound",
  "Welsh Springer Spaniel",
  "Whippet",
  "Wirehaired Pointing Griffon",
  "American Eskimo Dog",
  "Anatolian Shepherd Dog",
  "Australian Terrier",
  "Barbet",
  "Bearded Collie",
  "Belgian Laekenois",
  "Black and Tan Coonhound",
  "Black Russian Terrier",
  "Bluetick Coonhound",
  "Boykin Spaniel",
  "Brussels Griffon",
  "Cairn Terrier",
  "Canaan Dog",
  "Catahoula Leopard Dog",
  "Chinese Shar-Pei",
  "Clumber Spaniel",
  "Curly-Coated Retriever",
  "Dandie Dinmont Terrier",
  "English Foxhound",
  "Field Spaniel",
  "Finnish Lapphund",
  "Finnish Spitz",
  "German Wirehaired Pointer",
  "Icelandic Sheepdog",
  "Japanese Spitz",
  "Lagotto Romagnolo",
  "Lowchen",
  "Norwich Terrier",
  "Nova Scotia Duck Tolling Retriever",
  "Otterhound",
  "Pharaoh Hound",
  "Plott Hound",
  "Polish Lowland Sheepdog",
  "Redbone Coonhound",
  "Saluki",
  "Schipperke",
  "Sealyham Terrier",
  "Silky Terrier",
  "Spinone Italiano",
  "Swedish Vallhund",
  "Taiwan Dog",
  "Thai Ridgeback",
  "Toy Poodle",
  "Treeing Tennessee Brindle",
  "Welsh Terrier",
  "Xoloitzcuintli",
  "Yorkipoo",
  "Sheepadoodle",
  "Schnoodle",
  "Sheprador",
  "Puggle",
  "Morkie",
  "Shih-poo",
  "Aussiedoodle",
  "Whoodle",
  "Newfypoo",
  "Foodle",
  "Bordoodle",
  "Chiweenie",
  "Pitsky",
  "Chorkie",
  "Jackapoo",
  "Corgipoo",
  "Mutt",
  "Mixed Breed",
];

let pickerSequence = 0;

function normalize(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function editDistance(left, right) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const above = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1)
      );
      diagonal = above;
    }
  }
  return row[right.length];
}

function similarity(left, right) {
  if (!left || !right) return 0;
  return 1 - editDistance(left, right) / Math.max(left.length, right.length);
}

function breedScore(query, breed) {
  const normalizedBreed = normalize(breed);
  if (normalizedBreed === query) return 1000;
  if (normalizedBreed.startsWith(query)) return 900;

  const words = normalizedBreed.split(" ");
  if (words.some((word) => word.startsWith(query))) return 800;
  if (normalizedBreed.includes(query)) return 700;
  if (query.length < 3) return 0;

  const queryWords = query.split(" ");
  const wordMatches = queryWords.map((queryWord) =>
    Math.max(...words.map((word) => similarity(queryWord, word)))
  );
  const score = wordMatches.reduce((total, match) => total + match, 0) / wordMatches.length;
  return score >= 0.45 ? 500 + score * 100 : 0;
}

export function rankBreeds(query, limit) {
  const normalizedQuery = normalize(query);
  if (limit === undefined) limit = normalizedQuery ? 20 : COMMON_BREEDS.length;
  if (!normalizedQuery) return COMMON_BREEDS.slice(0, limit);

  return COMMON_BREEDS
    .map((breed, index) => ({ breed, index, score: breedScore(normalizedQuery, breed) }))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map(({ breed }) => breed);
}

export function parseBreedSelection(value) {
  const breeds = String(value || "")
    .split(/\s+\+\s+/)
    .map((breed) => breed.trim())
    .filter(Boolean);
  const unique = [];
  const seen = new Set();
  for (const breed of breeds) {
    const key = normalize(breed);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(breed);
    }
  }
  return unique.length > 3 ? ["Mutt"] : unique;
}

export function countBreedOccurrences(dogs) {
  const counts = new Map();
  for (const dog of dogs) {
    const breeds = parseBreedSelection(dog.Breed);
    for (const breed of breeds.length ? breeds : ["Unknown"]) {
      counts.set(breed, (counts.get(breed) || 0) + 1);
    }
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1]);
}

export function serializeBreedSelection(values) {
  const unique = [];
  const seen = new Set();
  for (const value of values) {
    const breed = String(value || "").trim();
    const key = normalize(breed);
    if (breed && !seen.has(key)) {
      seen.add(key);
      unique.push(breed);
    }
  }
  if (unique.length > 3) return "Mutt";
  return unique.join(" + ");
}

export function getBreedSelection(fieldList) {
  return serializeBreedSelection(
    [...fieldList.querySelectorAll("input[name='Breed']")].map((input) => input.value)
  );
}

function createBreedRow(fieldList, value = "") {
  const row = document.createElement("div");
  row.className = "breed-row";

  const picker = document.createElement("div");
  picker.className = "breed-picker";
  const input = document.createElement("input");
  input.type = "text";
  input.name = "Breed";
  input.maxLength = 50;
  input.placeholder = "Search or enter a breed";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "Dog breed");
  input.value = value;

  const list = document.createElement("div");
  list.className = "breed-suggestions";
  list.setAttribute("role", "listbox");
  list.setAttribute("aria-label", "Breed suggestions");
  list.hidden = true;
  picker.append(input, list);
  row.append(picker);

  if (fieldList.querySelectorAll(".breed-row").length > 0) {
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "breed-remove";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", "Remove this breed");
    removeButton.addEventListener("click", () => {
      row.remove();
      updateAddButton(fieldList);
    });
    row.append(removeButton);
  }

  fieldList.append(row);
  initializeBreedInput(input);
  updateAddButton(fieldList);
  return input;
}

function updateAddButton(fieldList) {
  const button = fieldList.parentElement.querySelector("[data-add-breed]");
  if (!button) return;
  const count = fieldList.querySelectorAll("input[name='Breed']").length;
  button.hidden = count >= 4;
  button.textContent = count === 3 ? "Add another breed (4th will be Mutt)" : "Add another breed";
}

export function setBreedSelection(fieldList, value) {
  const breeds = parseBreedSelection(value);
  const values = breeds.length ? breeds : [""];
  const rows = [...fieldList.querySelectorAll(".breed-row")];
  while (rows.length > values.length) rows.pop().remove();
  while (fieldList.querySelectorAll(".breed-row").length < values.length) createBreedRow(fieldList);
  [...fieldList.querySelectorAll("input[name='Breed']")].forEach((input, index) => {
    input.value = values[index] || "";
  });
  updateAddButton(fieldList);
}

function hideSuggestions(input, list) {
  list.hidden = true;
  input.setAttribute("aria-expanded", "false");
}

function initializeBreedInput(input) {
  if (input.dataset.breedPickerInitialized) return;
  input.dataset.breedPickerInitialized = "true";
  const list = input.parentElement.querySelector("[role='listbox']");
  if (!list) throw new Error("Breed picker is missing its suggestions list.");

  if (!list.id) list.id = `breed-suggestions-${++pickerSequence}`;
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-haspopup", "listbox");
  input.setAttribute("aria-controls", list.id);
  input.setAttribute("aria-expanded", "false");

  const renderSuggestions = () => {
    const query = input.value.trim();
    const matches = rankBreeds(query);
    const exactMatch = matches.some((breed) => normalize(breed) === normalize(query));
    const options = matches.map((breed) => ({ label: breed, value: breed }));
    if (query && !exactMatch) {
      options.push({ label: `Use "${query}" as a custom breed or mix`, value: query });
    }

    list.replaceChildren(...options.map(({ label, value }) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "breed-suggestion";
      option.setAttribute("role", "option");
      option.textContent = label;
      option.addEventListener("pointerdown", (event) => event.preventDefault());
      option.addEventListener("click", () => {
        input.value = value;
        hideSuggestions(input, list);
        input.focus();
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
      return option;
    }));
    list.hidden = options.length === 0;
    input.setAttribute("aria-expanded", String(!list.hidden));
  };

  input.addEventListener("focus", renderSuggestions);
  input.addEventListener("input", renderSuggestions);
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" && !list.hidden) {
      event.preventDefault();
      list.querySelector("button")?.focus();
    } else if (event.key === "Escape") {
      hideSuggestions(input, list);
    }
  });
  input.addEventListener("blur", () => {
    window.setTimeout(() => {
      if (!input.parentElement.contains(document.activeElement)) hideSuggestions(input, list);
    }, 0);
  });
}

export function initializeBreedPickers(root = document) {
  root.querySelectorAll(".breed-fields").forEach((fieldList) => {
    if (!fieldList.querySelector(".breed-row")) createBreedRow(fieldList);
    const addButton = fieldList.parentElement.querySelector("[data-add-breed]");
    if (addButton && !addButton.dataset.breedPickerInitialized) {
      addButton.dataset.breedPickerInitialized = "true";
      addButton.addEventListener("click", () => {
        if (fieldList.querySelectorAll("input[name='Breed']").length < 4) {
          createBreedRow(fieldList).focus();
        }
      });
    }
    fieldList.querySelectorAll("input[name='Breed']").forEach(initializeBreedInput);
    updateAddButton(fieldList);
  });
}
