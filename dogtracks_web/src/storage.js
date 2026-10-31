// -------------------------------------------------------------
// FIRESTORE STORAGE MODULE
// -------------------------------------------------------------
// Import modular Firestore functions using browser-ready official CDN.
import { 
  collection, 
  doc, 
  setDoc,
  getDoc,
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  GeoPoint 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Helper function to safely calculate whole years elapsed from a Date or Timestamp.
export function calculateAgeYears(birthDate) {
  // Return zero if birth date is null, undefined, or missing.
  if (!birthDate) return 0;

  // Convert to Date instance whether value is a Firestore Timestamp or date string.
  const dob = birthDate?.toDate ? birthDate.toDate() : new Date(birthDate);

  // Return zero if parsing produced an invalid date.
  if (Number.isNaN(dob.getTime())) return 0;

  // Calculate elapsed time in milliseconds from birth to current time.
  const diffMs = Date.now() - dob.getTime();

  // If birth date is in the future, return 0 years.
  if (diffMs < 0) return 0;

  // Convert elapsed milliseconds to a Date relative to 1970 epoch.
  const ageDate = new Date(diffMs);

  // Return non-negative integer years.
  return Math.max(0, Math.abs(ageDate.getUTCFullYear() - 1970));
}

// Helper function to safely extract the string document ID from a reference or string.
export function extractId(refOrId) {
  // Return empty string if value is null or undefined.
  if (!refOrId) return '';
  // Return value directly if it is already a string ID.
  if (typeof refOrId === 'string') return refOrId;
  // Return the id property if it is a Firestore DocumentReference.
  if (refOrId.id) return refOrId.id;
  // Fallback to string coercion.
  return String(refOrId);
}

// -------------------------------------------------------------
// FIRESTORE USER COLLECTION AUTHENTICATION & REGISTRATION
// -------------------------------------------------------------
// Checks the 'Users' collection for a matching Email and Password document.
export async function authenticateDatabaseUser(db, email, password) {
  // Query the 'Users' collection for a document where Email matches (case-sensitive check).
  const usersQuery = query(
    collection(db, "Users"), 
    where("Email", "==", String(email).trim())
  );

  // Fetch the matching document snapshot.
  const snapshot = await getDocs(usersQuery);

  // If no user document with this email exists, return null.
  if (snapshot.empty) {
    return null;
  }

  // Find the document where the plain text Password field matches.
  const matchingDoc = snapshot.docs.find((docSnap) => {
    const data = docSnap.data();
    return String(data.Password) === String(password);
  });

  // If password does not match, return null.
  if (!matchingDoc) {
    return null;
  }

  // Return user object containing the Firestore document ID as uid.
  return {
    uid: matchingDoc.id,
    email: matchingDoc.data().Email,
    displayName: matchingDoc.data().Name,
    isDatabaseUser: true,
    ...matchingDoc.data()
  };
}

// Checks if a Firestore user document exists by UID; if not, creates it after email verification.
export async function ensureUserProfileCreated(db, userId, { name, email, password }) {
  const userRef = doc(db, "Users", userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const userPayload = {
      Address: new GeoPoint(0, 0),
      CreatedAt: Timestamp.now(),
      Email: String(email).trim(),
      Name: String(name || email.split('@')[0]).trim(),
      Password: String(password || ''),
    };

    await setDoc(userRef, userPayload);
    return { uid: userId, ...userPayload };
  }

  return { uid: snap.id, ...snap.data() };
}

// Creates a new user record in the 'Users' collection without requiring latitude/longitude coordinates.
export async function createUserProfile(db, { name, email, password, address = null }) {
  // Construct user payload strictly adhering to the casing shown in your console screenshot.
  const userPayload = {
    Address: address || new GeoPoint(0, 0),
    CreatedAt: Timestamp.now(),
    Email: String(email).trim(),
    Name: String(name).trim(),
    Password: String(password),
  };

  // Insert a new document with an auto-generated ID into the 'Users' collection.
  const docRef = await addDoc(collection(db, "Users"), userPayload);

  // Return the created user object including the new document ID.
  return {
    uid: docRef.id,
    ...userPayload
  };
}

// Cascades deletion of all dogs, sessions, and profile data belonging to a user.
// Cascades deletion of all dogs, sessions, and profile data belonging to a user.
export async function deleteUserAccount(db, userId) {
  if (!userId) throw new Error('Missing user ID for account deletion.');

  try {
    // 1. Fetch all dogs and identify those owned by this user
    const dogsSnapshot = await getDocs(collection(db, "Dogs"));
    const userDogIds = [];

    dogsSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const rawOwner = data?.OwnerId;
      const ownerId = extractId(rawOwner);

      // Matches string ID or DocumentReference ID
      if (ownerId === userId) {
        userDogIds.push(docSnap.id);
      }
    });

    // 2. Cascade delete all dogs and their related training sessions
    for (const dogId of userDogIds) {
      await deleteDog(db, dogId);
    }

    // 3. Delete the user profile document in the Users collection
    const userRef = doc(db, "Users", userId);
    await deleteDoc(userRef);

    return true;
  } catch (error) {
    console.error("deleteUserAccount storage error:", error);
    throw error;
  }
}

// -------------------------------------------------------------
// DOG PROFILE CRUD
// -------------------------------------------------------------
// Create a new dog record conforming to strict schema with date validation.
export async function createDog(db, input, ownerId = null) {
  // Validate and trim the dog's name (required field).
  const name = String(input?.Name ?? input?.name ?? '').trim();
  if (!name) throw new Error('Enter a name for the dog.');

  // Validate DateOfBirth input.
  if (!input?.DateOfBirth) {
    throw new Error('Please select a valid date of birth.');
  }

  // Split date string to extract year, month, and day without timezone offsets.
  const [year, month, day] = input.DateOfBirth.split('-').map(Number);
  const dobDate = new Date(year, month - 1, day);

  if (Number.isNaN(dobDate.getTime())) {
    throw new Error('Please select a valid date of birth.');
  }

  // Compare against local end-of-day today.
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  if (dobDate.getTime() > endOfToday.getTime()) {
    throw new Error('Invalid Date: Date of birth cannot be in the future.');
  }

  // Wrap the JS date in a Firestore Timestamp object.
  const dateOfBirthTimestamp = Timestamp.fromDate(dobDate);

  // Create DocumentReference for the Owner if provided, otherwise null.
  const ownerRef = ownerId ? doc(db, "Users", ownerId) : null;

  // Extract Color hex string or default to standard brand green.
  const colorHex = String(input?.Color ?? input?.color ?? '#315f4e').trim();

  // Extract PhotoDataUrl data string if present.
  const photoDataUrl = String(input?.PhotoDataUrl ?? input?.photoDataUrl ?? '').trim();

  // Construct document payload strictly adhering to schema casing and types.
  const dogPayload = {
    Name: name,
    Breed: String(input?.Breed ?? input?.breed ?? '').trim(),
    Color: colorHex,
    PhotoDataUrl: photoDataUrl,
    DateOfBirth: dateOfBirthTimestamp,
    Notes: String(input?.Notes ?? input?.notes ?? '').trim(),
    OwnerId: ownerRef,
  };

  // Persist record to the 'Dogs' collection and return reference.
  return await addDoc(collection(db, "Dogs"), dogPayload);
}

// Delete a dog and cascade-delete all training sessions linked to it.
export async function deleteDog(db, dogId) {
  // Ensure an ID is present.
  if (!dogId) throw new Error('Missing dog ID for deletion.');

  // Create DocumentReference for the target dog.
  const dogRef = doc(db, "Dogs", dogId);

  // Build query to find all sessions where DogId points to this document.
  const sessionsQuery = query(collection(db, "Sessions"), where("DogId", "==", dogRef));

  // Fetch the matching session records.
  const sessionDocs = await getDocs(sessionsQuery);

  // Prepare parallel deletion promises for all related sessions.
  const deleteSessionPromises = sessionDocs.docs.map((sDoc) => deleteDoc(doc(db, "Sessions", sDoc.id)));

  // Await completion of all session deletions.
  await Promise.all(deleteSessionPromises);

  // Finally, delete the parent dog document.
  await deleteDoc(dogRef);
}

// -------------------------------------------------------------
// SESSION CRUD
// -------------------------------------------------------------
// Add a training session linked to a dog via DocumentReference.
export async function createSession(db, input) {
  // Extract dog document ID.
  const rawDogId = input?.DogId ?? input?.dogId;
  const dogId = extractId(rawDogId);
  if (!dogId) throw new Error('Choose a dog before logging a training entry.');

  // Validate behavior text.
  const behavior = String(input?.Behavior ?? input?.behavior ?? '').trim();
  if (!behavior) throw new Error('Enter a behavior or training activity.');

  // Create DocumentReference for the target dog.
  const dogRef = doc(db, "Dogs", dogId);

  // Resolve session occurrence time.
  const rawDate = input?.OccurredAt ?? input?.occurredAt;
  const occurredDate = rawDate ? new Date(rawDate) : new Date();
  const validDate = Number.isNaN(occurredDate.getTime()) ? new Date() : occurredDate;

  // Assemble payload matching schema.
  const sessionPayload = {
    Behavior: behavior,
    DogId: dogRef,
    Trigger: String(input?.Trigger ?? input?.trigger ?? '').trim(),
    Notes: String(input?.Notes ?? input?.notes ?? '').trim(),
    OccurredAt: Timestamp.fromDate(validDate),
  };

  // Add document to the 'Sessions' collection.
  return await addDoc(collection(db, "Sessions"), sessionPayload);
}

// -------------------------------------------------------------
// LOAD ALL DATA FROM FIRESTORE (Dogs + Sessions)
// -------------------------------------------------------------
export async function loadState(db, { ownerId, isAdmin = false } = {}) {
  // Fetch dogs
  const dogSnapshot = await getDocs(collection(db, "Dogs"));

  const dogs = dogSnapshot.docs.filter((docSnap) => {
    return isAdmin || (ownerId && extractId(docSnap.data().OwnerId) === ownerId);
  }).map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.Name,
      breed: data.Breed,
      color: data.Color || '#315f4e',
      photoDataUrl: data.PhotoDataUrl || '',
      notes: data.Notes,
      dateOfBirth: data.DateOfBirth?.toDate ? data.DateOfBirth.toDate().toISOString() : '',
      ageYears: calculateAgeYears(data.DateOfBirth),
    };
  });

  const dogIds = new Set(dogs.map((dog) => dog.id));

  // Fetch sessions
  const sessionSnapshot = await getDocs(collection(db, "Sessions"));

  const sessions = sessionSnapshot.docs.filter((docSnap) => {
    return dogIds.has(extractId(docSnap.data().DogId));
  }).map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      dogId: extractId(data.DogId),
      behavior: data.Behavior,
      trigger: data.Trigger,
      notes: data.Notes,
      occurredAt: data.OccurredAt?.toDate ? data.OccurredAt.toDate().toISOString() : '',
    };
  });

  return { dogs, sessions };
}