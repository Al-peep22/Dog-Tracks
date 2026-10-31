// -------------------------------------------------------------
// FIRESTORE STORAGE MODULE
// -------------------------------------------------------------
// Import modular Firestore functions using browser-ready official CDN.
import { 
  collection, 
  doc, 
  setDoc,
  getDoc,
  updateDoc,
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  GeoPoint 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Helper function to safely calculate whole years elapsed from birth to passing or current time.
export function calculateAgeYears(birthDate, deathDate = null) {
  if (!birthDate) return 0;
  const dob = birthDate?.toDate ? birthDate.toDate() : new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return 0;

  const endDate = deathDate
    ? (deathDate?.toDate ? deathDate.toDate() : new Date(deathDate))
    : new Date();

  const diffMs = endDate.getTime() - dob.getTime();
  if (diffMs < 0) return 0;
  const ageDate = new Date(diffMs);
  return Math.max(0, Math.abs(ageDate.getUTCFullYear() - 1970));
}

// Helper function to safely extract the string document ID from a reference or string.
export function extractId(refOrId) {
  if (!refOrId) return '';
  if (typeof refOrId === 'string') return refOrId;
  if (refOrId.id) return refOrId.id;
  return String(refOrId);
}

// Determines if a dog profile is archived based on presence and validity of DateOfDeath.
export function isDogArchived(dog) {
  if (!dog || !dog.DateOfDeath) return false;
  const dod = dog.DateOfDeath?.toDate ? dog.DateOfDeath.toDate() : new Date(dog.DateOfDeath);
  if (Number.isNaN(dod.getTime())) return false;
  return dod.getTime() <= Date.now();
}

// -------------------------------------------------------------
// FIRESTORE USER COLLECTION AUTHENTICATION & REGISTRATION
// -------------------------------------------------------------
export async function authenticateDatabaseUser(db, email, password) {
  const usersQuery = query(
    collection(db, "Users"), 
    where("Email", "==", String(email).trim())
  );

  const snapshot = await getDocs(usersQuery);
  if (snapshot.empty) return null;

  const matchingDoc = snapshot.docs.find((docSnap) => {
    const data = docSnap.data();
    return String(data.Password) === String(password);
  });

  if (!matchingDoc) return null;

  return {
    uid: matchingDoc.id,
    email: matchingDoc.data().Email,
    displayName: matchingDoc.data().Name,
    isDatabaseUser: true,
    ...matchingDoc.data()
  };
}

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

export async function deleteUserAccount(db, userId, userEmail = null, knownDogIds = []) {
  if (!userId && !userEmail) throw new Error('Missing user ID for account deletion.');

  const dogIdsToDelete = new Set(knownDogIds);

  try {
    const dogsSnapshot = await getDocs(collection(db, "Dogs"));
    dogsSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const extractedOwnerId = extractId(data?.OwnerId);
      if (extractedOwnerId === userId) {
        dogIdsToDelete.add(docSnap.id);
      }
    });
  } catch (err) {
    console.warn("[DeleteAccount] Could not scan Dogs collection; using known dog IDs:", err);
  }

  for (const dogId of dogIdsToDelete) {
    try {
      await deleteDog(db, dogId);
    } catch (dogErr) {
      console.warn(`[DeleteAccount] Could not delete dog ${dogId}:`, dogErr);
    }
  }

  if (userId) {
    try {
      await deleteDoc(doc(db, "Users", userId));
    } catch (userDocErr) {
      console.warn(`[DeleteAccount] Could not delete Users doc with ID ${userId}:`, userDocErr);
    }
  }

  if (userEmail) {
    try {
      const emailQuery = query(collection(db, "Users"), where("Email", "==", String(userEmail).trim()));
      const emailSnap = await getDocs(emailQuery);
      for (const d of emailSnap.docs) {
        await deleteDoc(doc(db, "Users", d.id));
      }
    } catch (emailQueryErr) {
      console.warn("[DeleteAccount] Could not query Users by email:", emailQueryErr);
    }
  }

  return true;
}

// -------------------------------------------------------------
// DOG PROFILE CRUD
// -------------------------------------------------------------
export async function createDog(db, input, ownerId = null) {
  const name = String(input?.Name ?? input?.name ?? '').trim();
  if (!name) throw new Error('Enter a name for the dog.');

  if (!input?.DateOfBirth) {
    throw new Error('Please select a valid date of birth.');
  }

  const [bYear, bMonth, bDay] = input.DateOfBirth.split('-').map(Number);
  const dobDate = new Date(bYear, bMonth - 1, bDay);

  if (Number.isNaN(dobDate.getTime())) {
    throw new Error('Please select a valid date of birth.');
  }

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  if (dobDate.getTime() > endOfToday.getTime()) {
    throw new Error('Invalid Date: Date of birth cannot be in the future.');
  }

  let dodTimestamp = null;
  if (input?.DateOfDeath) {
    const [dYear, dMonth, dDay] = input.DateOfDeath.split('-').map(Number);
    const dodDate = new Date(dYear, dMonth - 1, dDay);

    if (Number.isNaN(dodDate.getTime())) {
      throw new Error('Please select a valid date of passing.');
    }
    if (dodDate.getTime() < dobDate.getTime()) {
      throw new Error('Date of passing cannot be earlier than date of birth.');
    }
    if (dodDate.getTime() > endOfToday.getTime()) {
      throw new Error('Date of passing cannot be in the future.');
    }
    dodTimestamp = Timestamp.fromDate(dodDate);
  }

  const dateOfBirthTimestamp = Timestamp.fromDate(dobDate);
  const ownerRef = ownerId ? doc(db, "Users", ownerId) : null;
  const colorHex = String(input?.Color ?? input?.color ?? '#315f4e').trim();
  const photoDataUrl = String(input?.PhotoDataUrl ?? input?.photoDataUrl ?? '').trim();

  const dogPayload = {
    Name: name,
    Breed: String(input?.Breed ?? input?.breed ?? '').trim(),
    Color: colorHex,
    PhotoDataUrl: photoDataUrl,
    DateOfBirth: dateOfBirthTimestamp,
    DateOfDeath: dodTimestamp,
    Notes: String(input?.Notes ?? input?.notes ?? '').trim(),
    OwnerId: ownerRef,
  };

  return await addDoc(collection(db, "Dogs"), dogPayload);
}

// Update a dog's DateOfDeath to transition the profile into Memorial Archives.
export async function updateDogDeathDate(db, dogId, dateOfDeathStr, dobDateVal) {
  if (!dogId) throw new Error('Missing dog ID.');
  if (!dateOfDeathStr) throw new Error('Please specify a date.');

  const [dYear, dMonth, dDay] = dateOfDeathStr.split('-').map(Number);
  const dodDate = new Date(dYear, dMonth - 1, dDay);

  if (Number.isNaN(dodDate.getTime())) {
    throw new Error('Invalid date provided.');
  }

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  if (dodDate.getTime() > endOfToday.getTime()) {
    throw new Error('Date of passing cannot be in the future.');
  }

  if (dobDateVal) {
    const dob = dobDateVal?.toDate ? dobDateVal.toDate() : new Date(dobDateVal);
    if (!Number.isNaN(dob.getTime()) && dodDate.getTime() < dob.getTime()) {
      throw new Error('Date of passing cannot precede date of birth.');
    }
  }

  const dogRef = doc(db, "Dogs", dogId);
  await updateDoc(dogRef, {
    DateOfDeath: Timestamp.fromDate(dodDate)
  });
}

export async function deleteDog(db, dogId) {
  if (!dogId) throw new Error('Missing dog ID for deletion.');

  const dogRef = doc(db, "Dogs", dogId);
  const sessionsQuery = query(collection(db, "Sessions"), where("DogId", "==", dogRef));
  const sessionDocs = await getDocs(sessionsQuery);

  const deleteSessionPromises = sessionDocs.docs.map((sDoc) => deleteDoc(doc(db, "Sessions", sDoc.id)));
  await Promise.all(deleteSessionPromises);

  await deleteDoc(dogRef);
}

// -------------------------------------------------------------
// SESSION CRUD
// -------------------------------------------------------------
export async function createSession(db, input) {
  const rawDogId = input?.DogId ?? input?.dogId;
  const dogId = extractId(rawDogId);
  if (!dogId) throw new Error('Choose a dog before logging a training entry.');

  const behavior = String(input?.Behavior ?? input?.behavior ?? '').trim();
  if (!behavior) throw new Error('Enter a behavior or training activity.');

  const dogRef = doc(db, "Dogs", dogId);
  const rawDate = input?.OccurredAt ?? input?.occurredAt;
  const occurredDate = rawDate ? new Date(rawDate) : new Date();
  const validDate = Number.isNaN(occurredDate.getTime()) ? new Date() : occurredDate;

  const sessionPayload = {
    Behavior: behavior,
    DogId: dogRef,
    Trigger: String(input?.Trigger ?? input?.trigger ?? '').trim(),
    Notes: String(input?.Notes ?? input?.notes ?? '').trim(),
    OccurredAt: Timestamp.fromDate(validDate),
  };

  return await addDoc(collection(db, "Sessions"), sessionPayload);
}

// -------------------------------------------------------------
// LOAD ALL DATA FROM FIRESTORE
// -------------------------------------------------------------
export async function loadState(db, { ownerId, isAdmin = false } = {}) {
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
      dateOfDeath: data.DateOfDeath?.toDate ? data.DateOfDeath.toDate().toISOString() : null,
      ageYears: calculateAgeYears(data.DateOfBirth, data.DateOfDeath),
    };
  });

  const dogIds = new Set(dogs.map((dog) => dog.id));
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