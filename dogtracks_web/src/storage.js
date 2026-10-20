// Key used to store data in the browser's localStorage
export const STORAGE_KEY = 'dogtracks.state.v1';

// -------------------------------------------------------------
// Default starter data shown the first time the app loads
// -------------------------------------------------------------
const starterState = {
  dogs: [
    {
      id: 'dog-bailey',
      name: 'Bailey',
      breed: 'Labrador Retriever',
      ageYears: 3,
      notes: 'Enjoys learning new cues.',
    },
    {
      id: 'dog-milo',
      name: 'Milo',
      breed: 'Mixed breed',
      ageYears: 2,
      notes: 'Practicing calm greetings.',
    },
  ],
  sessions: [
    {
      id: 'session-bailey-1',
      dogId: 'dog-bailey',
      behavior: 'Loose-leash walking',
      trigger: '',
      notes: 'Practiced around the neighborhood.',
      occurredAt: '2026-10-06T16:30:00.000Z',
    },
    {
      id: 'session-milo-1',
      dogId: 'dog-milo',
      behavior: 'Calm greeting',
      trigger: 'Visitor at the door',
      notes: 'Settled after a short pause.',
      occurredAt: '2026-10-05T17:10:00.000Z',
    },
  ],
};

// -------------------------------------------------------------
// Validate the entire state object to ensure nothing is corrupted
// -------------------------------------------------------------
function assertState(state) {
  // Basic shape check
  if (!state || !Array.isArray(state.dogs) || !Array.isArray(state.sessions)) {
    throw new Error('DogTracks data is invalid. Clear this site\'s saved data or contact the project team.');
  }

  // Validate dog profiles
  const dogIds = new Set();
  for (const dog of state.dogs) {
    if (
      !dog ||
      typeof dog.id !== 'string' ||
      typeof dog.name !== 'string' ||
      !dog.name.trim() || // name must not be empty
      typeof dog.breed !== 'string' ||
      typeof dog.notes !== 'string' ||
      !Number.isInteger(dog.ageYears) ||
      dog.ageYears < 0 ||
      dog.ageYears > 40 ||
      dogIds.has(dog.id) // duplicate dog ID
    ) {
      throw new Error('DogTracks dog profile data is invalid. Clear this site\'s saved data or contact the project team.');
    }
    dogIds.add(dog.id);
  }

  // Validate training sessions
  const sessionIds = new Set();
  for (const session of state.sessions) {
    if (
      !session ||
      typeof session.id !== 'string' ||
      sessionIds.has(session.id) || // duplicate session ID
      !dogIds.has(session.dogId) || // session must belong to a real dog
      typeof session.behavior !== 'string' ||
      !session.behavior.trim() ||
      typeof session.trigger !== 'string' ||
      typeof session.notes !== 'string' ||
      typeof session.occurredAt !== 'string' ||
      Number.isNaN(Date.parse(session.occurredAt)) // must be valid date
    ) {
      throw new Error('DogTracks training history is invalid. Clear this site\'s saved data or contact the project team.');
    }
    sessionIds.add(session.id);
  }
}

// -------------------------------------------------------------
// Load saved state from localStorage
// -------------------------------------------------------------
export function loadState(storage = globalThis.localStorage) {
  if (!storage) throw new Error('Browser storage is unavailable. Open DogTracks in a current browser.');

  const saved = storage.getItem(STORAGE_KEY);

  // If no saved data exists, use starterState
  if (saved === null) {
    const initialState = structuredClone(starterState);
    saveState(initialState, storage);
    return initialState;
  }

  // Try to parse saved JSON
  let state;
  try {
    state = JSON.parse(saved);
  } catch (error) {
    throw new Error('Could not read saved DogTracks data. Clear this site\'s saved data to start fresh.', { cause: error });
  }

  // Validate the loaded state
  assertState(state);
  return state;
}

// -------------------------------------------------------------
// Save state to localStorage
// -------------------------------------------------------------
export function saveState(state, storage = globalThis.localStorage) {
  if (!storage) throw new Error('Browser storage is unavailable. Open DogTracks in a current browser.');
  assertState(state); // ensure data is valid before saving
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// -------------------------------------------------------------
// Create a new dog profile
// -------------------------------------------------------------
export function createDog(state, input, id = globalThis.crypto.randomUUID()) {
  const name = input.name.trim();
  if (!name) throw new Error('Enter a name for the dog.');

  const ageYears = Number(input.ageYears);
  if (!Number.isInteger(ageYears) || ageYears < 0 || ageYears > 40) {
    throw new Error('Enter an age from 0 to 40 whole years.');
  }

  // Build the new dog object
  const dog = {
    id,
    name,
    breed: input.breed.trim(),
    ageYears,
    notes: input.notes.trim(),
  };

  // Add dog to state
  const nextState = { ...state, dogs: [...state.dogs, dog] };
  assertState(nextState);
  return nextState;
}

// -------------------------------------------------------------
// Create a new training session
// -------------------------------------------------------------
export function createSession(
  state,
  input,
  occurredAt = new Date().toISOString(), // default timestamp
  id = globalThis.crypto.randomUUID()
) {
  // Ensure dog exists
  if (!state.dogs.some((dog) => dog.id === input.dogId)) {
    throw new Error('Choose a dog before logging a training entry.');
  }

  const behavior = input.behavior.trim();
  if (!behavior) throw new Error('Enter a behavior or training activity.');

  // Build session object
  const session = {
    id,
    dogId: input.dogId,
    behavior,
    trigger: input.trigger.trim(),
    notes: input.notes.trim(),
    occurredAt,
  };

  // Add session to state
  const nextState = { ...state, sessions: [...state.sessions, session] };
  assertState(nextState);
  return nextState;
}

// -------------------------------------------------------------
// Delete a dog and all its sessions
// -------------------------------------------------------------
export function deleteDog(state, dogId) {
  if (!state.dogs.some((dog) => dog.id === dogId)) {
    throw new Error('That dog profile no longer exists.');
  }

  return {
    // Remove dog
    dogs: state.dogs.filter((dog) => dog.id !== dogId),

    // Remove all sessions belonging to that dog
    sessions: state.sessions.filter((session) => session.dogId !== dogId),
  };
}
