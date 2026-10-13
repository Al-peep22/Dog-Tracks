import test from 'node:test';
import assert from 'node:assert/strict';
import { createDog, createSession, deleteDog, loadState, saveState, STORAGE_KEY } from '../src/storage.js';

function memoryStorage(initial = null) {
  let value = initial;
  return {
    getItem(key) {
      assert.equal(key, STORAGE_KEY);
      return value;
    },
    setItem(key, nextValue) {
      assert.equal(key, STORAGE_KEY);
      value = nextValue;
    },
  };
}

test('first load seeds and saves sample profiles and training entries', () => {
  const storage = memoryStorage();
  const state = loadState(storage);

  assert.equal(state.dogs.length, 2);
  assert.ok(state.sessions.length > 0);
  assert.ok(storage.getItem(STORAGE_KEY));
});

test('dog profiles can be added and are saved', () => {
  const storage = memoryStorage();
  const state = loadState(storage);
  const nextState = createDog(state, { name: '  Poppy ', breed: 'Spaniel', ageYears: '4', notes: '' }, 'dog-poppy');
  saveState(nextState, storage);

  assert.equal(loadState(storage).dogs.at(-1).name, 'Poppy');
});

test('training entries require a known dog and behavior', () => {
  const state = loadState(memoryStorage());
  assert.throws(() => createSession(state, { dogId: 'missing', behavior: 'Sit', trigger: '', notes: '' }), /Choose a dog/);
  assert.throws(() => createSession(state, { dogId: state.dogs[0].id, behavior: ' ', trigger: '', notes: '' }), /Enter a behavior/);
});

test('deleting a dog also removes its training entries', () => {
  const state = loadState(memoryStorage());
  const dogId = state.dogs[0].id;
  const nextState = deleteDog(state, dogId);

  assert.ok(nextState.dogs.every((dog) => dog.id !== dogId));
  assert.ok(nextState.sessions.every((session) => session.dogId !== dogId));
});

test('malformed profile fields are rejected before rendering', () => {
  const unsafeState = {
    dogs: [{ id: 'dog-unsafe', name: 'Pup', breed: '', ageYears: '<img src=x>', notes: '' }],
    sessions: [],
  };
  assert.throws(() => loadState(memoryStorage(JSON.stringify(unsafeState))), /dog profile data is invalid/);
});
test('malformed saved data fails visibly instead of being replaced', () => {
  assert.throws(() => loadState(memoryStorage('{invalid')), /Could not read saved DogTracks data/);
});