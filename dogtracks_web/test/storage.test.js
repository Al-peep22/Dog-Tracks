// Import Node.js test runner
import test from 'node:test';

// Import strict assertion library (throws errors when tests fail)
import assert from 'node:assert/strict';

// Import the functions being tested
import {
  createDog,
  createSession,
  deleteDog,
  loadState,
  saveState,
  STORAGE_KEY
} from '../src/storage.js';

// -------------------------------------------------------------
// Fake in-memory storage so tests don't use real localStorage
// -------------------------------------------------------------
function memoryStorage(initial = null) {
  let value = initial; // stored JSON string

  return {
    // Simulate localStorage.getItem()
    getItem(key) {
      assert.equal(key, STORAGE_KEY); // ensure correct key is used
      return value;
    },

    // Simulate localStorage.setItem()
    setItem(key, nextValue) {
      assert.equal(key, STORAGE_KEY); // ensure correct key is used
      value = nextValue; // update stored value
    },
  };
}

// -------------------------------------------------------------
// TEST 1 — First load seeds starter data
// -------------------------------------------------------------
test('first load seeds and saves sample profiles and training entries', () => {
  const storage = memoryStorage(); // empty fake storage
  const state = loadState(storage); // should load starterState

  // Expect 2 dogs from starterState
  assert.equal(state.dogs.length, 2);

  // Expect at least 1 training session
  assert.ok(state.sessions.length > 0);

  // Ensure something was saved to storage
  assert.ok(storage.getItem(STORAGE_KEY));
});

// -------------------------------------------------------------
// TEST 2 — Adding a dog works and is saved
// -------------------------------------------------------------
test('dog profiles can be added and are saved', () => {
  const storage = memoryStorage();
  const state = loadState(storage);

  // Create a new dog named Poppy
  const nextState = createDog(
    state,
    { name: '  Poppy ', breed: 'Spaniel', ageYears: '4', notes: '' },
    'dog-poppy'
  );

  // Save updated state
  saveState(nextState, storage);

  // Reload and check last dog name
  assert.equal(loadState(storage).dogs.at(-1).name, 'Poppy');
});

// -------------------------------------------------------------
// TEST 3 — Training entries require valid dog + valid behavior
// -------------------------------------------------------------
test('training entries require a known dog and behavior', () => {
  const state = loadState(memoryStorage());

  // Should fail: dogId does not exist
  assert.throws(
    () => createSession(state, { dogId: 'missing', behavior: 'Sit', trigger: '', notes: '' }),
    /Choose a dog/
  );

  // Should fail: behavior is empty
  assert.throws(
    () => createSession(state, { dogId: state.dogs[0].id, behavior: ' ', trigger: '', notes: '' }),
    /Enter a behavior/
  );
});

// -------------------------------------------------------------
// TEST 4 — Deleting a dog removes its sessions too
// -------------------------------------------------------------
test('deleting a dog also removes its training entries', () => {
  const state = loadState(memoryStorage());
  const dogId = state.dogs[0].id;

  const nextState = deleteDog(state, dogId);

  // Dog should be gone
  assert.ok(nextState.dogs.every((dog) => dog.id !== dogId));

  // All sessions belonging to that dog should be gone
  assert.ok(nextState.sessions.every((session) => session.dogId !== dogId));
});

// -------------------------------------------------------------
// TEST 5 — Invalid dog profile fields cause load failure
// -------------------------------------------------------------
test('malformed profile fields are rejected before rendering', () => {
  const unsafeState = {
    dogs: [
      {
        id: 'dog-unsafe',
        name: 'Pup',
        breed: '',
        ageYears: '<img src=x>', // invalid age
        notes: ''
      }
    ],
    sessions: [],
  };

  // Should throw because ageYears is invalid
  assert.throws(
    () => loadState(memoryStorage(JSON.stringify(unsafeState))),
    /dog profile data is invalid/
  );
});

// -------------------------------------------------------------
// TEST 6 — Invalid JSON fails visibly (not silently replaced)
// -------------------------------------------------------------
test('malformed saved data fails visibly instead of being replaced', () => {
  // Passing "{invalid" simulates corrupted JSON
  assert.throws(
    () => loadState(memoryStorage('{invalid')),
    /Could not read saved DogTracks data/
  );
});
