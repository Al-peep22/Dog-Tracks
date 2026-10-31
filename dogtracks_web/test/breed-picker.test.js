import test from "node:test";
import assert from "node:assert/strict";

import {
  countBreedOccurrences,
  parseBreedSelection,
  rankBreeds,
  serializeBreedSelection,
} from "../src/breed-picker.js";

test("breed suggestions show common breeds when there is no query", () => {
  assert.deepEqual(rankBreeds("").slice(0, 3), [
    "French Bulldog",
    "Labrador Retriever",
    "Golden Retriever",
  ]);
});

test("breed suggestions rank matching and similarly spelled breeds", () => {
  assert.equal(rankBreeds("lab")[0], "Labrador Retriever");
  assert.equal(rankBreeds("golden retriver")[0], "Golden Retriever");
});

test("breed suggestions include mix options", () => {
  assert.ok(rankBreeds("mix").includes("Mixed Breed"));
});

test("the initial dropdown includes the full expanded breed list", () => {
  assert.ok(rankBreeds("").length > 150);
  assert.ok(rankBreeds("").includes("Xoloitzcuintli"));
});

test("up to three selected breeds are stored separately and duplicates are removed", () => {
  assert.equal(
    serializeBreedSelection(["Labrador Retriever", "Poodle", "Labrador retriever"]),
    "Labrador Retriever + Poodle"
  );
  assert.deepEqual(parseBreedSelection("Labrador Retriever + Poodle"), [
    "Labrador Retriever",
    "Poodle",
  ]);
});

test("four selected breeds are stored as Mutt", () => {
  assert.equal(
    serializeBreedSelection(["Labrador Retriever", "Poodle", "Beagle", "Boxer"]),
    "Mutt"
  );
  assert.deepEqual(parseBreedSelection("Labrador Retriever + Poodle + Beagle + Boxer"), ["Mutt"]);
});

test("mixed dogs count under each selected breed and four-breed dogs count as Mutt", () => {
  assert.deepEqual(
    countBreedOccurrences([
      { Breed: "Labrador Retriever + Poodle" },
      { Breed: "Poodle" },
      { Breed: "Labrador Retriever + Poodle + Beagle + Boxer" },
    ]),
    [["Poodle", 2], ["Labrador Retriever", 1], ["Mutt", 1]]
  );
});
