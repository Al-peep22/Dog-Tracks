# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetUser*](#getuser)
  - [*ListAllUsers*](#listallusers)
  - [*GetDog*](#getdog)
  - [*ListMyDogs*](#listmydogs)
  - [*GetTrainingGoal*](#gettraininggoal)
  - [*ListDogGoals*](#listdoggoals)
  - [*GetTrainingSession*](#gettrainingsession)
  - [*ListDogSessions*](#listdogsessions)
  - [*GetBehaviorLog*](#getbehaviorlog)
  - [*ListDogLogs*](#listdoglogs)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpdateUser*](#updateuser)
  - [*DeleteUser*](#deleteuser)
  - [*CreateDog*](#createdog)
  - [*UpdateDog*](#updatedog)
  - [*DeleteDog*](#deletedog)
  - [*CreateTrainingGoal*](#createtraininggoal)
  - [*UpdateTrainingGoal*](#updatetraininggoal)
  - [*DeleteTrainingGoal*](#deletetraininggoal)
  - [*CreateTrainingSession*](#createtrainingsession)
  - [*UpdateTrainingSession*](#updatetrainingsession)
  - [*DeleteTrainingSession*](#deletetrainingsession)
  - [*CreateBehaviorLog*](#createbehaviorlog)
  - [*UpdateBehaviorLog*](#updatebehaviorlog)
  - [*DeleteBehaviorLog*](#deletebehaviorlog)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetUser
You can execute the `GetUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUser(options?: ExecuteQueryOptions): QueryPromise<GetUserData, undefined>;

interface GetUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserData, undefined>;
}
export const getUserRef: GetUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserData, undefined>;

interface GetUserRef {
  ...
  (dc: DataConnect): QueryRef<GetUserData, undefined>;
}
export const getUserRef: GetUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserRef:
```typescript
const name = getUserRef.operationName;
console.log(name);
```

### Variables
The `GetUser` query has no variables.
### Return Type
Recall that executing the `GetUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserData {
  user?: {
    id: UUIDString;
    displayName: string;
    email: string;
  } & User_Key;
}
```
### Using `GetUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUser } from '@dataconnect/generated';


// Call the `getUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUser(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getUser().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserRef } from '@dataconnect/generated';


// Call the `getUserRef()` function to get a reference to the query.
const ref = getUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## ListAllUsers
You can execute the `ListAllUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllUsers(options?: ExecuteQueryOptions): QueryPromise<ListAllUsersData, undefined>;

interface ListAllUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllUsersData, undefined>;
}
export const listAllUsersRef: ListAllUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllUsersData, undefined>;

interface ListAllUsersRef {
  ...
  (dc: DataConnect): QueryRef<ListAllUsersData, undefined>;
}
export const listAllUsersRef: ListAllUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllUsersRef:
```typescript
const name = listAllUsersRef.operationName;
console.log(name);
```

### Variables
The `ListAllUsers` query has no variables.
### Return Type
Recall that executing the `ListAllUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllUsersData {
  users: ({
    id: UUIDString;
    displayName: string;
  } & User_Key)[];
}
```
### Using `ListAllUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllUsers } from '@dataconnect/generated';


// Call the `listAllUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
listAllUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListAllUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllUsersRef } from '@dataconnect/generated';


// Call the `listAllUsersRef()` function to get a reference to the query.
const ref = listAllUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetDog
You can execute the `GetDog` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getDog(vars: GetDogVariables, options?: ExecuteQueryOptions): QueryPromise<GetDogData, GetDogVariables>;

interface GetDogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDogVariables): QueryRef<GetDogData, GetDogVariables>;
}
export const getDogRef: GetDogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getDog(dc: DataConnect, vars: GetDogVariables, options?: ExecuteQueryOptions): QueryPromise<GetDogData, GetDogVariables>;

interface GetDogRef {
  ...
  (dc: DataConnect, vars: GetDogVariables): QueryRef<GetDogData, GetDogVariables>;
}
export const getDogRef: GetDogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getDogRef:
```typescript
const name = getDogRef.operationName;
console.log(name);
```

### Variables
The `GetDog` query requires an argument of type `GetDogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetDogVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetDog` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetDogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetDogData {
  dog?: {
    name: string;
    breed: string;
    owner?: {
      displayName: string;
    };
  };
}
```
### Using `GetDog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getDog, GetDogVariables } from '@dataconnect/generated';

// The `GetDog` query requires an argument of type `GetDogVariables`:
const getDogVars: GetDogVariables = {
  id: ..., 
};

// Call the `getDog()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getDog(getDogVars);
// Variables can be defined inline as well.
const { data } = await getDog({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getDog(dataConnect, getDogVars);

console.log(data.dog);

// Or, you can use the `Promise` API.
getDog(getDogVars).then((response) => {
  const data = response.data;
  console.log(data.dog);
});
```

### Using `GetDog`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getDogRef, GetDogVariables } from '@dataconnect/generated';

// The `GetDog` query requires an argument of type `GetDogVariables`:
const getDogVars: GetDogVariables = {
  id: ..., 
};

// Call the `getDogRef()` function to get a reference to the query.
const ref = getDogRef(getDogVars);
// Variables can be defined inline as well.
const ref = getDogRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getDogRef(dataConnect, getDogVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.dog);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.dog);
});
```

## ListMyDogs
You can execute the `ListMyDogs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMyDogs(options?: ExecuteQueryOptions): QueryPromise<ListMyDogsData, undefined>;

interface ListMyDogsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyDogsData, undefined>;
}
export const listMyDogsRef: ListMyDogsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyDogs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyDogsData, undefined>;

interface ListMyDogsRef {
  ...
  (dc: DataConnect): QueryRef<ListMyDogsData, undefined>;
}
export const listMyDogsRef: ListMyDogsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyDogsRef:
```typescript
const name = listMyDogsRef.operationName;
console.log(name);
```

### Variables
The `ListMyDogs` query has no variables.
### Return Type
Recall that executing the `ListMyDogs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyDogsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMyDogsData {
  dogs: ({
    id: UUIDString;
    name: string;
  } & Dog_Key)[];
}
```
### Using `ListMyDogs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyDogs } from '@dataconnect/generated';


// Call the `listMyDogs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyDogs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyDogs(dataConnect);

console.log(data.dogs);

// Or, you can use the `Promise` API.
listMyDogs().then((response) => {
  const data = response.data;
  console.log(data.dogs);
});
```

### Using `ListMyDogs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyDogsRef } from '@dataconnect/generated';


// Call the `listMyDogsRef()` function to get a reference to the query.
const ref = listMyDogsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyDogsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.dogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.dogs);
});
```

## GetTrainingGoal
You can execute the `GetTrainingGoal` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getTrainingGoal(vars: GetTrainingGoalVariables, options?: ExecuteQueryOptions): QueryPromise<GetTrainingGoalData, GetTrainingGoalVariables>;

interface GetTrainingGoalRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTrainingGoalVariables): QueryRef<GetTrainingGoalData, GetTrainingGoalVariables>;
}
export const getTrainingGoalRef: GetTrainingGoalRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getTrainingGoal(dc: DataConnect, vars: GetTrainingGoalVariables, options?: ExecuteQueryOptions): QueryPromise<GetTrainingGoalData, GetTrainingGoalVariables>;

interface GetTrainingGoalRef {
  ...
  (dc: DataConnect, vars: GetTrainingGoalVariables): QueryRef<GetTrainingGoalData, GetTrainingGoalVariables>;
}
export const getTrainingGoalRef: GetTrainingGoalRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getTrainingGoalRef:
```typescript
const name = getTrainingGoalRef.operationName;
console.log(name);
```

### Variables
The `GetTrainingGoal` query requires an argument of type `GetTrainingGoalVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetTrainingGoalVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetTrainingGoal` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetTrainingGoalData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetTrainingGoalData {
  trainingGoal?: {
    title: string;
    status?: string | null;
  };
}
```
### Using `GetTrainingGoal`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getTrainingGoal, GetTrainingGoalVariables } from '@dataconnect/generated';

// The `GetTrainingGoal` query requires an argument of type `GetTrainingGoalVariables`:
const getTrainingGoalVars: GetTrainingGoalVariables = {
  id: ..., 
};

// Call the `getTrainingGoal()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getTrainingGoal(getTrainingGoalVars);
// Variables can be defined inline as well.
const { data } = await getTrainingGoal({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getTrainingGoal(dataConnect, getTrainingGoalVars);

console.log(data.trainingGoal);

// Or, you can use the `Promise` API.
getTrainingGoal(getTrainingGoalVars).then((response) => {
  const data = response.data;
  console.log(data.trainingGoal);
});
```

### Using `GetTrainingGoal`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getTrainingGoalRef, GetTrainingGoalVariables } from '@dataconnect/generated';

// The `GetTrainingGoal` query requires an argument of type `GetTrainingGoalVariables`:
const getTrainingGoalVars: GetTrainingGoalVariables = {
  id: ..., 
};

// Call the `getTrainingGoalRef()` function to get a reference to the query.
const ref = getTrainingGoalRef(getTrainingGoalVars);
// Variables can be defined inline as well.
const ref = getTrainingGoalRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getTrainingGoalRef(dataConnect, getTrainingGoalVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.trainingGoal);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.trainingGoal);
});
```

## ListDogGoals
You can execute the `ListDogGoals` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listDogGoals(vars: ListDogGoalsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDogGoalsData, ListDogGoalsVariables>;

interface ListDogGoalsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListDogGoalsVariables): QueryRef<ListDogGoalsData, ListDogGoalsVariables>;
}
export const listDogGoalsRef: ListDogGoalsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listDogGoals(dc: DataConnect, vars: ListDogGoalsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDogGoalsData, ListDogGoalsVariables>;

interface ListDogGoalsRef {
  ...
  (dc: DataConnect, vars: ListDogGoalsVariables): QueryRef<ListDogGoalsData, ListDogGoalsVariables>;
}
export const listDogGoalsRef: ListDogGoalsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listDogGoalsRef:
```typescript
const name = listDogGoalsRef.operationName;
console.log(name);
```

### Variables
The `ListDogGoals` query requires an argument of type `ListDogGoalsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListDogGoalsVariables {
  dogId: UUIDString;
}
```
### Return Type
Recall that executing the `ListDogGoals` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListDogGoalsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListDogGoalsData {
  trainingGoals: ({
    title: string;
    targetDate: DateString;
  })[];
}
```
### Using `ListDogGoals`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listDogGoals, ListDogGoalsVariables } from '@dataconnect/generated';

// The `ListDogGoals` query requires an argument of type `ListDogGoalsVariables`:
const listDogGoalsVars: ListDogGoalsVariables = {
  dogId: ..., 
};

// Call the `listDogGoals()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listDogGoals(listDogGoalsVars);
// Variables can be defined inline as well.
const { data } = await listDogGoals({ dogId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listDogGoals(dataConnect, listDogGoalsVars);

console.log(data.trainingGoals);

// Or, you can use the `Promise` API.
listDogGoals(listDogGoalsVars).then((response) => {
  const data = response.data;
  console.log(data.trainingGoals);
});
```

### Using `ListDogGoals`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listDogGoalsRef, ListDogGoalsVariables } from '@dataconnect/generated';

// The `ListDogGoals` query requires an argument of type `ListDogGoalsVariables`:
const listDogGoalsVars: ListDogGoalsVariables = {
  dogId: ..., 
};

// Call the `listDogGoalsRef()` function to get a reference to the query.
const ref = listDogGoalsRef(listDogGoalsVars);
// Variables can be defined inline as well.
const ref = listDogGoalsRef({ dogId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listDogGoalsRef(dataConnect, listDogGoalsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.trainingGoals);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.trainingGoals);
});
```

## GetTrainingSession
You can execute the `GetTrainingSession` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getTrainingSession(vars: GetTrainingSessionVariables, options?: ExecuteQueryOptions): QueryPromise<GetTrainingSessionData, GetTrainingSessionVariables>;

interface GetTrainingSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTrainingSessionVariables): QueryRef<GetTrainingSessionData, GetTrainingSessionVariables>;
}
export const getTrainingSessionRef: GetTrainingSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getTrainingSession(dc: DataConnect, vars: GetTrainingSessionVariables, options?: ExecuteQueryOptions): QueryPromise<GetTrainingSessionData, GetTrainingSessionVariables>;

interface GetTrainingSessionRef {
  ...
  (dc: DataConnect, vars: GetTrainingSessionVariables): QueryRef<GetTrainingSessionData, GetTrainingSessionVariables>;
}
export const getTrainingSessionRef: GetTrainingSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getTrainingSessionRef:
```typescript
const name = getTrainingSessionRef.operationName;
console.log(name);
```

### Variables
The `GetTrainingSession` query requires an argument of type `GetTrainingSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetTrainingSessionVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetTrainingSession` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetTrainingSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetTrainingSessionData {
  trainingSession?: {
    skillFocused: string;
    successRating?: number | null;
  };
}
```
### Using `GetTrainingSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getTrainingSession, GetTrainingSessionVariables } from '@dataconnect/generated';

// The `GetTrainingSession` query requires an argument of type `GetTrainingSessionVariables`:
const getTrainingSessionVars: GetTrainingSessionVariables = {
  id: ..., 
};

// Call the `getTrainingSession()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getTrainingSession(getTrainingSessionVars);
// Variables can be defined inline as well.
const { data } = await getTrainingSession({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getTrainingSession(dataConnect, getTrainingSessionVars);

console.log(data.trainingSession);

// Or, you can use the `Promise` API.
getTrainingSession(getTrainingSessionVars).then((response) => {
  const data = response.data;
  console.log(data.trainingSession);
});
```

### Using `GetTrainingSession`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getTrainingSessionRef, GetTrainingSessionVariables } from '@dataconnect/generated';

// The `GetTrainingSession` query requires an argument of type `GetTrainingSessionVariables`:
const getTrainingSessionVars: GetTrainingSessionVariables = {
  id: ..., 
};

// Call the `getTrainingSessionRef()` function to get a reference to the query.
const ref = getTrainingSessionRef(getTrainingSessionVars);
// Variables can be defined inline as well.
const ref = getTrainingSessionRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getTrainingSessionRef(dataConnect, getTrainingSessionVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.trainingSession);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.trainingSession);
});
```

## ListDogSessions
You can execute the `ListDogSessions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listDogSessions(vars: ListDogSessionsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDogSessionsData, ListDogSessionsVariables>;

interface ListDogSessionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListDogSessionsVariables): QueryRef<ListDogSessionsData, ListDogSessionsVariables>;
}
export const listDogSessionsRef: ListDogSessionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listDogSessions(dc: DataConnect, vars: ListDogSessionsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDogSessionsData, ListDogSessionsVariables>;

interface ListDogSessionsRef {
  ...
  (dc: DataConnect, vars: ListDogSessionsVariables): QueryRef<ListDogSessionsData, ListDogSessionsVariables>;
}
export const listDogSessionsRef: ListDogSessionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listDogSessionsRef:
```typescript
const name = listDogSessionsRef.operationName;
console.log(name);
```

### Variables
The `ListDogSessions` query requires an argument of type `ListDogSessionsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListDogSessionsVariables {
  dogId: UUIDString;
}
```
### Return Type
Recall that executing the `ListDogSessions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListDogSessionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListDogSessionsData {
  trainingSessions: ({
    date: DateString;
    skillFocused: string;
  })[];
}
```
### Using `ListDogSessions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listDogSessions, ListDogSessionsVariables } from '@dataconnect/generated';

// The `ListDogSessions` query requires an argument of type `ListDogSessionsVariables`:
const listDogSessionsVars: ListDogSessionsVariables = {
  dogId: ..., 
};

// Call the `listDogSessions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listDogSessions(listDogSessionsVars);
// Variables can be defined inline as well.
const { data } = await listDogSessions({ dogId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listDogSessions(dataConnect, listDogSessionsVars);

console.log(data.trainingSessions);

// Or, you can use the `Promise` API.
listDogSessions(listDogSessionsVars).then((response) => {
  const data = response.data;
  console.log(data.trainingSessions);
});
```

### Using `ListDogSessions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listDogSessionsRef, ListDogSessionsVariables } from '@dataconnect/generated';

// The `ListDogSessions` query requires an argument of type `ListDogSessionsVariables`:
const listDogSessionsVars: ListDogSessionsVariables = {
  dogId: ..., 
};

// Call the `listDogSessionsRef()` function to get a reference to the query.
const ref = listDogSessionsRef(listDogSessionsVars);
// Variables can be defined inline as well.
const ref = listDogSessionsRef({ dogId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listDogSessionsRef(dataConnect, listDogSessionsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.trainingSessions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.trainingSessions);
});
```

## GetBehaviorLog
You can execute the `GetBehaviorLog` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getBehaviorLog(vars: GetBehaviorLogVariables, options?: ExecuteQueryOptions): QueryPromise<GetBehaviorLogData, GetBehaviorLogVariables>;

interface GetBehaviorLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBehaviorLogVariables): QueryRef<GetBehaviorLogData, GetBehaviorLogVariables>;
}
export const getBehaviorLogRef: GetBehaviorLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getBehaviorLog(dc: DataConnect, vars: GetBehaviorLogVariables, options?: ExecuteQueryOptions): QueryPromise<GetBehaviorLogData, GetBehaviorLogVariables>;

interface GetBehaviorLogRef {
  ...
  (dc: DataConnect, vars: GetBehaviorLogVariables): QueryRef<GetBehaviorLogData, GetBehaviorLogVariables>;
}
export const getBehaviorLogRef: GetBehaviorLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getBehaviorLogRef:
```typescript
const name = getBehaviorLogRef.operationName;
console.log(name);
```

### Variables
The `GetBehaviorLog` query requires an argument of type `GetBehaviorLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetBehaviorLogVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetBehaviorLog` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetBehaviorLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetBehaviorLogData {
  behaviorLog?: {
    behaviorType: string;
    notes?: string | null;
  };
}
```
### Using `GetBehaviorLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getBehaviorLog, GetBehaviorLogVariables } from '@dataconnect/generated';

// The `GetBehaviorLog` query requires an argument of type `GetBehaviorLogVariables`:
const getBehaviorLogVars: GetBehaviorLogVariables = {
  id: ..., 
};

// Call the `getBehaviorLog()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getBehaviorLog(getBehaviorLogVars);
// Variables can be defined inline as well.
const { data } = await getBehaviorLog({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getBehaviorLog(dataConnect, getBehaviorLogVars);

console.log(data.behaviorLog);

// Or, you can use the `Promise` API.
getBehaviorLog(getBehaviorLogVars).then((response) => {
  const data = response.data;
  console.log(data.behaviorLog);
});
```

### Using `GetBehaviorLog`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getBehaviorLogRef, GetBehaviorLogVariables } from '@dataconnect/generated';

// The `GetBehaviorLog` query requires an argument of type `GetBehaviorLogVariables`:
const getBehaviorLogVars: GetBehaviorLogVariables = {
  id: ..., 
};

// Call the `getBehaviorLogRef()` function to get a reference to the query.
const ref = getBehaviorLogRef(getBehaviorLogVars);
// Variables can be defined inline as well.
const ref = getBehaviorLogRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getBehaviorLogRef(dataConnect, getBehaviorLogVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.behaviorLog);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.behaviorLog);
});
```

## ListDogLogs
You can execute the `ListDogLogs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listDogLogs(vars: ListDogLogsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDogLogsData, ListDogLogsVariables>;

interface ListDogLogsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListDogLogsVariables): QueryRef<ListDogLogsData, ListDogLogsVariables>;
}
export const listDogLogsRef: ListDogLogsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listDogLogs(dc: DataConnect, vars: ListDogLogsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDogLogsData, ListDogLogsVariables>;

interface ListDogLogsRef {
  ...
  (dc: DataConnect, vars: ListDogLogsVariables): QueryRef<ListDogLogsData, ListDogLogsVariables>;
}
export const listDogLogsRef: ListDogLogsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listDogLogsRef:
```typescript
const name = listDogLogsRef.operationName;
console.log(name);
```

### Variables
The `ListDogLogs` query requires an argument of type `ListDogLogsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListDogLogsVariables {
  dogId: UUIDString;
}
```
### Return Type
Recall that executing the `ListDogLogs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListDogLogsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListDogLogsData {
  behaviorLogs: ({
    timestamp: TimestampString;
    behaviorType: string;
  })[];
}
```
### Using `ListDogLogs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listDogLogs, ListDogLogsVariables } from '@dataconnect/generated';

// The `ListDogLogs` query requires an argument of type `ListDogLogsVariables`:
const listDogLogsVars: ListDogLogsVariables = {
  dogId: ..., 
};

// Call the `listDogLogs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listDogLogs(listDogLogsVars);
// Variables can be defined inline as well.
const { data } = await listDogLogs({ dogId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listDogLogs(dataConnect, listDogLogsVars);

console.log(data.behaviorLogs);

// Or, you can use the `Promise` API.
listDogLogs(listDogLogsVars).then((response) => {
  const data = response.data;
  console.log(data.behaviorLogs);
});
```

### Using `ListDogLogs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listDogLogsRef, ListDogLogsVariables } from '@dataconnect/generated';

// The `ListDogLogs` query requires an argument of type `ListDogLogsVariables`:
const listDogLogsVars: ListDogLogsVariables = {
  dogId: ..., 
};

// Call the `listDogLogsRef()` function to get a reference to the query.
const ref = listDogLogsRef(listDogLogsVars);
// Variables can be defined inline as well.
const ref = listDogLogsRef({ dogId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listDogLogsRef(dataConnect, listDogLogsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.behaviorLogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.behaviorLogs);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  displayName: string;
  email: string;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  displayName: ..., 
  email: ..., 
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ displayName: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  displayName: ..., 
  email: ..., 
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ displayName: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateUser
You can execute the `UpdateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUser(vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;

interface UpdateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
}
export const updateUserRef: UpdateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUser(dc: DataConnect, vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;

interface UpdateUserRef {
  ...
  (dc: DataConnect, vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
}
export const updateUserRef: UpdateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserRef:
```typescript
const name = updateUserRef.operationName;
console.log(name);
```

### Variables
The `UpdateUser` mutation requires an argument of type `UpdateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUserVariables {
  displayName: string;
}
```
### Return Type
Recall that executing the `UpdateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUser, UpdateUserVariables } from '@dataconnect/generated';

// The `UpdateUser` mutation requires an argument of type `UpdateUserVariables`:
const updateUserVars: UpdateUserVariables = {
  displayName: ..., 
};

// Call the `updateUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUser(updateUserVars);
// Variables can be defined inline as well.
const { data } = await updateUser({ displayName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUser(dataConnect, updateUserVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUser(updateUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserRef, UpdateUserVariables } from '@dataconnect/generated';

// The `UpdateUser` mutation requires an argument of type `UpdateUserVariables`:
const updateUserVars: UpdateUserVariables = {
  displayName: ..., 
};

// Call the `updateUserRef()` function to get a reference to the mutation.
const ref = updateUserRef(updateUserVars);
// Variables can be defined inline as well.
const ref = updateUserRef({ displayName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserRef(dataConnect, updateUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## DeleteUser
You can execute the `DeleteUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteUser(): MutationPromise<DeleteUserData, undefined>;

interface DeleteUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserData, undefined>;
}
export const deleteUserRef: DeleteUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteUser(dc: DataConnect): MutationPromise<DeleteUserData, undefined>;

interface DeleteUserRef {
  ...
  (dc: DataConnect): MutationRef<DeleteUserData, undefined>;
}
export const deleteUserRef: DeleteUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteUserRef:
```typescript
const name = deleteUserRef.operationName;
console.log(name);
```

### Variables
The `DeleteUser` mutation has no variables.
### Return Type
Recall that executing the `DeleteUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteUserData {
  user_delete?: User_Key | null;
}
```
### Using `DeleteUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteUser } from '@dataconnect/generated';


// Call the `deleteUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteUser(dataConnect);

console.log(data.user_delete);

// Or, you can use the `Promise` API.
deleteUser().then((response) => {
  const data = response.data;
  console.log(data.user_delete);
});
```

### Using `DeleteUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteUserRef } from '@dataconnect/generated';


// Call the `deleteUserRef()` function to get a reference to the mutation.
const ref = deleteUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_delete);
});
```

## CreateDog
You can execute the `CreateDog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createDog(vars: CreateDogVariables): MutationPromise<CreateDogData, CreateDogVariables>;

interface CreateDogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDogVariables): MutationRef<CreateDogData, CreateDogVariables>;
}
export const createDogRef: CreateDogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createDog(dc: DataConnect, vars: CreateDogVariables): MutationPromise<CreateDogData, CreateDogVariables>;

interface CreateDogRef {
  ...
  (dc: DataConnect, vars: CreateDogVariables): MutationRef<CreateDogData, CreateDogVariables>;
}
export const createDogRef: CreateDogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createDogRef:
```typescript
const name = createDogRef.operationName;
console.log(name);
```

### Variables
The `CreateDog` mutation requires an argument of type `CreateDogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateDogVariables {
  name: string;
  breed: string;
  birthDate: DateString;
}
```
### Return Type
Recall that executing the `CreateDog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateDogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateDogData {
  dog_insert: Dog_Key;
}
```
### Using `CreateDog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createDog, CreateDogVariables } from '@dataconnect/generated';

// The `CreateDog` mutation requires an argument of type `CreateDogVariables`:
const createDogVars: CreateDogVariables = {
  name: ..., 
  breed: ..., 
  birthDate: ..., 
};

// Call the `createDog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createDog(createDogVars);
// Variables can be defined inline as well.
const { data } = await createDog({ name: ..., breed: ..., birthDate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createDog(dataConnect, createDogVars);

console.log(data.dog_insert);

// Or, you can use the `Promise` API.
createDog(createDogVars).then((response) => {
  const data = response.data;
  console.log(data.dog_insert);
});
```

### Using `CreateDog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createDogRef, CreateDogVariables } from '@dataconnect/generated';

// The `CreateDog` mutation requires an argument of type `CreateDogVariables`:
const createDogVars: CreateDogVariables = {
  name: ..., 
  breed: ..., 
  birthDate: ..., 
};

// Call the `createDogRef()` function to get a reference to the mutation.
const ref = createDogRef(createDogVars);
// Variables can be defined inline as well.
const ref = createDogRef({ name: ..., breed: ..., birthDate: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createDogRef(dataConnect, createDogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.dog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.dog_insert);
});
```

## UpdateDog
You can execute the `UpdateDog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateDog(vars: UpdateDogVariables): MutationPromise<UpdateDogData, UpdateDogVariables>;

interface UpdateDogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateDogVariables): MutationRef<UpdateDogData, UpdateDogVariables>;
}
export const updateDogRef: UpdateDogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateDog(dc: DataConnect, vars: UpdateDogVariables): MutationPromise<UpdateDogData, UpdateDogVariables>;

interface UpdateDogRef {
  ...
  (dc: DataConnect, vars: UpdateDogVariables): MutationRef<UpdateDogData, UpdateDogVariables>;
}
export const updateDogRef: UpdateDogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateDogRef:
```typescript
const name = updateDogRef.operationName;
console.log(name);
```

### Variables
The `UpdateDog` mutation requires an argument of type `UpdateDogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateDogVariables {
  id: UUIDString;
  photoUrl: string;
}
```
### Return Type
Recall that executing the `UpdateDog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateDogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateDogData {
  dog_update?: Dog_Key | null;
}
```
### Using `UpdateDog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateDog, UpdateDogVariables } from '@dataconnect/generated';

// The `UpdateDog` mutation requires an argument of type `UpdateDogVariables`:
const updateDogVars: UpdateDogVariables = {
  id: ..., 
  photoUrl: ..., 
};

// Call the `updateDog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateDog(updateDogVars);
// Variables can be defined inline as well.
const { data } = await updateDog({ id: ..., photoUrl: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateDog(dataConnect, updateDogVars);

console.log(data.dog_update);

// Or, you can use the `Promise` API.
updateDog(updateDogVars).then((response) => {
  const data = response.data;
  console.log(data.dog_update);
});
```

### Using `UpdateDog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateDogRef, UpdateDogVariables } from '@dataconnect/generated';

// The `UpdateDog` mutation requires an argument of type `UpdateDogVariables`:
const updateDogVars: UpdateDogVariables = {
  id: ..., 
  photoUrl: ..., 
};

// Call the `updateDogRef()` function to get a reference to the mutation.
const ref = updateDogRef(updateDogVars);
// Variables can be defined inline as well.
const ref = updateDogRef({ id: ..., photoUrl: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateDogRef(dataConnect, updateDogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.dog_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.dog_update);
});
```

## DeleteDog
You can execute the `DeleteDog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteDog(vars: DeleteDogVariables): MutationPromise<DeleteDogData, DeleteDogVariables>;

interface DeleteDogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteDogVariables): MutationRef<DeleteDogData, DeleteDogVariables>;
}
export const deleteDogRef: DeleteDogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteDog(dc: DataConnect, vars: DeleteDogVariables): MutationPromise<DeleteDogData, DeleteDogVariables>;

interface DeleteDogRef {
  ...
  (dc: DataConnect, vars: DeleteDogVariables): MutationRef<DeleteDogData, DeleteDogVariables>;
}
export const deleteDogRef: DeleteDogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteDogRef:
```typescript
const name = deleteDogRef.operationName;
console.log(name);
```

### Variables
The `DeleteDog` mutation requires an argument of type `DeleteDogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteDogVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteDog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteDogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteDogData {
  dog_delete?: Dog_Key | null;
}
```
### Using `DeleteDog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteDog, DeleteDogVariables } from '@dataconnect/generated';

// The `DeleteDog` mutation requires an argument of type `DeleteDogVariables`:
const deleteDogVars: DeleteDogVariables = {
  id: ..., 
};

// Call the `deleteDog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteDog(deleteDogVars);
// Variables can be defined inline as well.
const { data } = await deleteDog({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteDog(dataConnect, deleteDogVars);

console.log(data.dog_delete);

// Or, you can use the `Promise` API.
deleteDog(deleteDogVars).then((response) => {
  const data = response.data;
  console.log(data.dog_delete);
});
```

### Using `DeleteDog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteDogRef, DeleteDogVariables } from '@dataconnect/generated';

// The `DeleteDog` mutation requires an argument of type `DeleteDogVariables`:
const deleteDogVars: DeleteDogVariables = {
  id: ..., 
};

// Call the `deleteDogRef()` function to get a reference to the mutation.
const ref = deleteDogRef(deleteDogVars);
// Variables can be defined inline as well.
const ref = deleteDogRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteDogRef(dataConnect, deleteDogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.dog_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.dog_delete);
});
```

## CreateTrainingGoal
You can execute the `CreateTrainingGoal` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createTrainingGoal(vars: CreateTrainingGoalVariables): MutationPromise<CreateTrainingGoalData, CreateTrainingGoalVariables>;

interface CreateTrainingGoalRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTrainingGoalVariables): MutationRef<CreateTrainingGoalData, CreateTrainingGoalVariables>;
}
export const createTrainingGoalRef: CreateTrainingGoalRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTrainingGoal(dc: DataConnect, vars: CreateTrainingGoalVariables): MutationPromise<CreateTrainingGoalData, CreateTrainingGoalVariables>;

interface CreateTrainingGoalRef {
  ...
  (dc: DataConnect, vars: CreateTrainingGoalVariables): MutationRef<CreateTrainingGoalData, CreateTrainingGoalVariables>;
}
export const createTrainingGoalRef: CreateTrainingGoalRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTrainingGoalRef:
```typescript
const name = createTrainingGoalRef.operationName;
console.log(name);
```

### Variables
The `CreateTrainingGoal` mutation requires an argument of type `CreateTrainingGoalVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTrainingGoalVariables {
  dogId: UUIDString;
  title: string;
  targetDate: DateString;
}
```
### Return Type
Recall that executing the `CreateTrainingGoal` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTrainingGoalData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTrainingGoalData {
  trainingGoal_insert: TrainingGoal_Key;
}
```
### Using `CreateTrainingGoal`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTrainingGoal, CreateTrainingGoalVariables } from '@dataconnect/generated';

// The `CreateTrainingGoal` mutation requires an argument of type `CreateTrainingGoalVariables`:
const createTrainingGoalVars: CreateTrainingGoalVariables = {
  dogId: ..., 
  title: ..., 
  targetDate: ..., 
};

// Call the `createTrainingGoal()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTrainingGoal(createTrainingGoalVars);
// Variables can be defined inline as well.
const { data } = await createTrainingGoal({ dogId: ..., title: ..., targetDate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTrainingGoal(dataConnect, createTrainingGoalVars);

console.log(data.trainingGoal_insert);

// Or, you can use the `Promise` API.
createTrainingGoal(createTrainingGoalVars).then((response) => {
  const data = response.data;
  console.log(data.trainingGoal_insert);
});
```

### Using `CreateTrainingGoal`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTrainingGoalRef, CreateTrainingGoalVariables } from '@dataconnect/generated';

// The `CreateTrainingGoal` mutation requires an argument of type `CreateTrainingGoalVariables`:
const createTrainingGoalVars: CreateTrainingGoalVariables = {
  dogId: ..., 
  title: ..., 
  targetDate: ..., 
};

// Call the `createTrainingGoalRef()` function to get a reference to the mutation.
const ref = createTrainingGoalRef(createTrainingGoalVars);
// Variables can be defined inline as well.
const ref = createTrainingGoalRef({ dogId: ..., title: ..., targetDate: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTrainingGoalRef(dataConnect, createTrainingGoalVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.trainingGoal_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.trainingGoal_insert);
});
```

## UpdateTrainingGoal
You can execute the `UpdateTrainingGoal` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateTrainingGoal(vars: UpdateTrainingGoalVariables): MutationPromise<UpdateTrainingGoalData, UpdateTrainingGoalVariables>;

interface UpdateTrainingGoalRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTrainingGoalVariables): MutationRef<UpdateTrainingGoalData, UpdateTrainingGoalVariables>;
}
export const updateTrainingGoalRef: UpdateTrainingGoalRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTrainingGoal(dc: DataConnect, vars: UpdateTrainingGoalVariables): MutationPromise<UpdateTrainingGoalData, UpdateTrainingGoalVariables>;

interface UpdateTrainingGoalRef {
  ...
  (dc: DataConnect, vars: UpdateTrainingGoalVariables): MutationRef<UpdateTrainingGoalData, UpdateTrainingGoalVariables>;
}
export const updateTrainingGoalRef: UpdateTrainingGoalRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTrainingGoalRef:
```typescript
const name = updateTrainingGoalRef.operationName;
console.log(name);
```

### Variables
The `UpdateTrainingGoal` mutation requires an argument of type `UpdateTrainingGoalVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTrainingGoalVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateTrainingGoal` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTrainingGoalData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTrainingGoalData {
  trainingGoal_update?: TrainingGoal_Key | null;
}
```
### Using `UpdateTrainingGoal`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTrainingGoal, UpdateTrainingGoalVariables } from '@dataconnect/generated';

// The `UpdateTrainingGoal` mutation requires an argument of type `UpdateTrainingGoalVariables`:
const updateTrainingGoalVars: UpdateTrainingGoalVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateTrainingGoal()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTrainingGoal(updateTrainingGoalVars);
// Variables can be defined inline as well.
const { data } = await updateTrainingGoal({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTrainingGoal(dataConnect, updateTrainingGoalVars);

console.log(data.trainingGoal_update);

// Or, you can use the `Promise` API.
updateTrainingGoal(updateTrainingGoalVars).then((response) => {
  const data = response.data;
  console.log(data.trainingGoal_update);
});
```

### Using `UpdateTrainingGoal`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTrainingGoalRef, UpdateTrainingGoalVariables } from '@dataconnect/generated';

// The `UpdateTrainingGoal` mutation requires an argument of type `UpdateTrainingGoalVariables`:
const updateTrainingGoalVars: UpdateTrainingGoalVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateTrainingGoalRef()` function to get a reference to the mutation.
const ref = updateTrainingGoalRef(updateTrainingGoalVars);
// Variables can be defined inline as well.
const ref = updateTrainingGoalRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTrainingGoalRef(dataConnect, updateTrainingGoalVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.trainingGoal_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.trainingGoal_update);
});
```

## DeleteTrainingGoal
You can execute the `DeleteTrainingGoal` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteTrainingGoal(vars: DeleteTrainingGoalVariables): MutationPromise<DeleteTrainingGoalData, DeleteTrainingGoalVariables>;

interface DeleteTrainingGoalRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTrainingGoalVariables): MutationRef<DeleteTrainingGoalData, DeleteTrainingGoalVariables>;
}
export const deleteTrainingGoalRef: DeleteTrainingGoalRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteTrainingGoal(dc: DataConnect, vars: DeleteTrainingGoalVariables): MutationPromise<DeleteTrainingGoalData, DeleteTrainingGoalVariables>;

interface DeleteTrainingGoalRef {
  ...
  (dc: DataConnect, vars: DeleteTrainingGoalVariables): MutationRef<DeleteTrainingGoalData, DeleteTrainingGoalVariables>;
}
export const deleteTrainingGoalRef: DeleteTrainingGoalRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteTrainingGoalRef:
```typescript
const name = deleteTrainingGoalRef.operationName;
console.log(name);
```

### Variables
The `DeleteTrainingGoal` mutation requires an argument of type `DeleteTrainingGoalVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteTrainingGoalVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteTrainingGoal` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteTrainingGoalData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteTrainingGoalData {
  trainingGoal_delete?: TrainingGoal_Key | null;
}
```
### Using `DeleteTrainingGoal`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteTrainingGoal, DeleteTrainingGoalVariables } from '@dataconnect/generated';

// The `DeleteTrainingGoal` mutation requires an argument of type `DeleteTrainingGoalVariables`:
const deleteTrainingGoalVars: DeleteTrainingGoalVariables = {
  id: ..., 
};

// Call the `deleteTrainingGoal()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteTrainingGoal(deleteTrainingGoalVars);
// Variables can be defined inline as well.
const { data } = await deleteTrainingGoal({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteTrainingGoal(dataConnect, deleteTrainingGoalVars);

console.log(data.trainingGoal_delete);

// Or, you can use the `Promise` API.
deleteTrainingGoal(deleteTrainingGoalVars).then((response) => {
  const data = response.data;
  console.log(data.trainingGoal_delete);
});
```

### Using `DeleteTrainingGoal`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteTrainingGoalRef, DeleteTrainingGoalVariables } from '@dataconnect/generated';

// The `DeleteTrainingGoal` mutation requires an argument of type `DeleteTrainingGoalVariables`:
const deleteTrainingGoalVars: DeleteTrainingGoalVariables = {
  id: ..., 
};

// Call the `deleteTrainingGoalRef()` function to get a reference to the mutation.
const ref = deleteTrainingGoalRef(deleteTrainingGoalVars);
// Variables can be defined inline as well.
const ref = deleteTrainingGoalRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteTrainingGoalRef(dataConnect, deleteTrainingGoalVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.trainingGoal_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.trainingGoal_delete);
});
```

## CreateTrainingSession
You can execute the `CreateTrainingSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createTrainingSession(vars: CreateTrainingSessionVariables): MutationPromise<CreateTrainingSessionData, CreateTrainingSessionVariables>;

interface CreateTrainingSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTrainingSessionVariables): MutationRef<CreateTrainingSessionData, CreateTrainingSessionVariables>;
}
export const createTrainingSessionRef: CreateTrainingSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTrainingSession(dc: DataConnect, vars: CreateTrainingSessionVariables): MutationPromise<CreateTrainingSessionData, CreateTrainingSessionVariables>;

interface CreateTrainingSessionRef {
  ...
  (dc: DataConnect, vars: CreateTrainingSessionVariables): MutationRef<CreateTrainingSessionData, CreateTrainingSessionVariables>;
}
export const createTrainingSessionRef: CreateTrainingSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTrainingSessionRef:
```typescript
const name = createTrainingSessionRef.operationName;
console.log(name);
```

### Variables
The `CreateTrainingSession` mutation requires an argument of type `CreateTrainingSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTrainingSessionVariables {
  dogId: UUIDString;
  date: DateString;
  duration: number;
  skill: string;
}
```
### Return Type
Recall that executing the `CreateTrainingSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTrainingSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTrainingSessionData {
  trainingSession_insert: TrainingSession_Key;
}
```
### Using `CreateTrainingSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTrainingSession, CreateTrainingSessionVariables } from '@dataconnect/generated';

// The `CreateTrainingSession` mutation requires an argument of type `CreateTrainingSessionVariables`:
const createTrainingSessionVars: CreateTrainingSessionVariables = {
  dogId: ..., 
  date: ..., 
  duration: ..., 
  skill: ..., 
};

// Call the `createTrainingSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTrainingSession(createTrainingSessionVars);
// Variables can be defined inline as well.
const { data } = await createTrainingSession({ dogId: ..., date: ..., duration: ..., skill: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTrainingSession(dataConnect, createTrainingSessionVars);

console.log(data.trainingSession_insert);

// Or, you can use the `Promise` API.
createTrainingSession(createTrainingSessionVars).then((response) => {
  const data = response.data;
  console.log(data.trainingSession_insert);
});
```

### Using `CreateTrainingSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTrainingSessionRef, CreateTrainingSessionVariables } from '@dataconnect/generated';

// The `CreateTrainingSession` mutation requires an argument of type `CreateTrainingSessionVariables`:
const createTrainingSessionVars: CreateTrainingSessionVariables = {
  dogId: ..., 
  date: ..., 
  duration: ..., 
  skill: ..., 
};

// Call the `createTrainingSessionRef()` function to get a reference to the mutation.
const ref = createTrainingSessionRef(createTrainingSessionVars);
// Variables can be defined inline as well.
const ref = createTrainingSessionRef({ dogId: ..., date: ..., duration: ..., skill: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTrainingSessionRef(dataConnect, createTrainingSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.trainingSession_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.trainingSession_insert);
});
```

## UpdateTrainingSession
You can execute the `UpdateTrainingSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateTrainingSession(vars: UpdateTrainingSessionVariables): MutationPromise<UpdateTrainingSessionData, UpdateTrainingSessionVariables>;

interface UpdateTrainingSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTrainingSessionVariables): MutationRef<UpdateTrainingSessionData, UpdateTrainingSessionVariables>;
}
export const updateTrainingSessionRef: UpdateTrainingSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTrainingSession(dc: DataConnect, vars: UpdateTrainingSessionVariables): MutationPromise<UpdateTrainingSessionData, UpdateTrainingSessionVariables>;

interface UpdateTrainingSessionRef {
  ...
  (dc: DataConnect, vars: UpdateTrainingSessionVariables): MutationRef<UpdateTrainingSessionData, UpdateTrainingSessionVariables>;
}
export const updateTrainingSessionRef: UpdateTrainingSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTrainingSessionRef:
```typescript
const name = updateTrainingSessionRef.operationName;
console.log(name);
```

### Variables
The `UpdateTrainingSession` mutation requires an argument of type `UpdateTrainingSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTrainingSessionVariables {
  id: UUIDString;
  rating: number;
}
```
### Return Type
Recall that executing the `UpdateTrainingSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTrainingSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTrainingSessionData {
  trainingSession_update?: TrainingSession_Key | null;
}
```
### Using `UpdateTrainingSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTrainingSession, UpdateTrainingSessionVariables } from '@dataconnect/generated';

// The `UpdateTrainingSession` mutation requires an argument of type `UpdateTrainingSessionVariables`:
const updateTrainingSessionVars: UpdateTrainingSessionVariables = {
  id: ..., 
  rating: ..., 
};

// Call the `updateTrainingSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTrainingSession(updateTrainingSessionVars);
// Variables can be defined inline as well.
const { data } = await updateTrainingSession({ id: ..., rating: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTrainingSession(dataConnect, updateTrainingSessionVars);

console.log(data.trainingSession_update);

// Or, you can use the `Promise` API.
updateTrainingSession(updateTrainingSessionVars).then((response) => {
  const data = response.data;
  console.log(data.trainingSession_update);
});
```

### Using `UpdateTrainingSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTrainingSessionRef, UpdateTrainingSessionVariables } from '@dataconnect/generated';

// The `UpdateTrainingSession` mutation requires an argument of type `UpdateTrainingSessionVariables`:
const updateTrainingSessionVars: UpdateTrainingSessionVariables = {
  id: ..., 
  rating: ..., 
};

// Call the `updateTrainingSessionRef()` function to get a reference to the mutation.
const ref = updateTrainingSessionRef(updateTrainingSessionVars);
// Variables can be defined inline as well.
const ref = updateTrainingSessionRef({ id: ..., rating: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTrainingSessionRef(dataConnect, updateTrainingSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.trainingSession_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.trainingSession_update);
});
```

## DeleteTrainingSession
You can execute the `DeleteTrainingSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteTrainingSession(vars: DeleteTrainingSessionVariables): MutationPromise<DeleteTrainingSessionData, DeleteTrainingSessionVariables>;

interface DeleteTrainingSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTrainingSessionVariables): MutationRef<DeleteTrainingSessionData, DeleteTrainingSessionVariables>;
}
export const deleteTrainingSessionRef: DeleteTrainingSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteTrainingSession(dc: DataConnect, vars: DeleteTrainingSessionVariables): MutationPromise<DeleteTrainingSessionData, DeleteTrainingSessionVariables>;

interface DeleteTrainingSessionRef {
  ...
  (dc: DataConnect, vars: DeleteTrainingSessionVariables): MutationRef<DeleteTrainingSessionData, DeleteTrainingSessionVariables>;
}
export const deleteTrainingSessionRef: DeleteTrainingSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteTrainingSessionRef:
```typescript
const name = deleteTrainingSessionRef.operationName;
console.log(name);
```

### Variables
The `DeleteTrainingSession` mutation requires an argument of type `DeleteTrainingSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteTrainingSessionVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteTrainingSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteTrainingSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteTrainingSessionData {
  trainingSession_delete?: TrainingSession_Key | null;
}
```
### Using `DeleteTrainingSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteTrainingSession, DeleteTrainingSessionVariables } from '@dataconnect/generated';

// The `DeleteTrainingSession` mutation requires an argument of type `DeleteTrainingSessionVariables`:
const deleteTrainingSessionVars: DeleteTrainingSessionVariables = {
  id: ..., 
};

// Call the `deleteTrainingSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteTrainingSession(deleteTrainingSessionVars);
// Variables can be defined inline as well.
const { data } = await deleteTrainingSession({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteTrainingSession(dataConnect, deleteTrainingSessionVars);

console.log(data.trainingSession_delete);

// Or, you can use the `Promise` API.
deleteTrainingSession(deleteTrainingSessionVars).then((response) => {
  const data = response.data;
  console.log(data.trainingSession_delete);
});
```

### Using `DeleteTrainingSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteTrainingSessionRef, DeleteTrainingSessionVariables } from '@dataconnect/generated';

// The `DeleteTrainingSession` mutation requires an argument of type `DeleteTrainingSessionVariables`:
const deleteTrainingSessionVars: DeleteTrainingSessionVariables = {
  id: ..., 
};

// Call the `deleteTrainingSessionRef()` function to get a reference to the mutation.
const ref = deleteTrainingSessionRef(deleteTrainingSessionVars);
// Variables can be defined inline as well.
const ref = deleteTrainingSessionRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteTrainingSessionRef(dataConnect, deleteTrainingSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.trainingSession_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.trainingSession_delete);
});
```

## CreateBehaviorLog
You can execute the `CreateBehaviorLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createBehaviorLog(vars: CreateBehaviorLogVariables): MutationPromise<CreateBehaviorLogData, CreateBehaviorLogVariables>;

interface CreateBehaviorLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBehaviorLogVariables): MutationRef<CreateBehaviorLogData, CreateBehaviorLogVariables>;
}
export const createBehaviorLogRef: CreateBehaviorLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createBehaviorLog(dc: DataConnect, vars: CreateBehaviorLogVariables): MutationPromise<CreateBehaviorLogData, CreateBehaviorLogVariables>;

interface CreateBehaviorLogRef {
  ...
  (dc: DataConnect, vars: CreateBehaviorLogVariables): MutationRef<CreateBehaviorLogData, CreateBehaviorLogVariables>;
}
export const createBehaviorLogRef: CreateBehaviorLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createBehaviorLogRef:
```typescript
const name = createBehaviorLogRef.operationName;
console.log(name);
```

### Variables
The `CreateBehaviorLog` mutation requires an argument of type `CreateBehaviorLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateBehaviorLogVariables {
  dogId: UUIDString;
  behaviorType: string;
  timestamp: TimestampString;
}
```
### Return Type
Recall that executing the `CreateBehaviorLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateBehaviorLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateBehaviorLogData {
  behaviorLog_insert: BehaviorLog_Key;
}
```
### Using `CreateBehaviorLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createBehaviorLog, CreateBehaviorLogVariables } from '@dataconnect/generated';

// The `CreateBehaviorLog` mutation requires an argument of type `CreateBehaviorLogVariables`:
const createBehaviorLogVars: CreateBehaviorLogVariables = {
  dogId: ..., 
  behaviorType: ..., 
  timestamp: ..., 
};

// Call the `createBehaviorLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createBehaviorLog(createBehaviorLogVars);
// Variables can be defined inline as well.
const { data } = await createBehaviorLog({ dogId: ..., behaviorType: ..., timestamp: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createBehaviorLog(dataConnect, createBehaviorLogVars);

console.log(data.behaviorLog_insert);

// Or, you can use the `Promise` API.
createBehaviorLog(createBehaviorLogVars).then((response) => {
  const data = response.data;
  console.log(data.behaviorLog_insert);
});
```

### Using `CreateBehaviorLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createBehaviorLogRef, CreateBehaviorLogVariables } from '@dataconnect/generated';

// The `CreateBehaviorLog` mutation requires an argument of type `CreateBehaviorLogVariables`:
const createBehaviorLogVars: CreateBehaviorLogVariables = {
  dogId: ..., 
  behaviorType: ..., 
  timestamp: ..., 
};

// Call the `createBehaviorLogRef()` function to get a reference to the mutation.
const ref = createBehaviorLogRef(createBehaviorLogVars);
// Variables can be defined inline as well.
const ref = createBehaviorLogRef({ dogId: ..., behaviorType: ..., timestamp: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createBehaviorLogRef(dataConnect, createBehaviorLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.behaviorLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.behaviorLog_insert);
});
```

## UpdateBehaviorLog
You can execute the `UpdateBehaviorLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateBehaviorLog(vars: UpdateBehaviorLogVariables): MutationPromise<UpdateBehaviorLogData, UpdateBehaviorLogVariables>;

interface UpdateBehaviorLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBehaviorLogVariables): MutationRef<UpdateBehaviorLogData, UpdateBehaviorLogVariables>;
}
export const updateBehaviorLogRef: UpdateBehaviorLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateBehaviorLog(dc: DataConnect, vars: UpdateBehaviorLogVariables): MutationPromise<UpdateBehaviorLogData, UpdateBehaviorLogVariables>;

interface UpdateBehaviorLogRef {
  ...
  (dc: DataConnect, vars: UpdateBehaviorLogVariables): MutationRef<UpdateBehaviorLogData, UpdateBehaviorLogVariables>;
}
export const updateBehaviorLogRef: UpdateBehaviorLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateBehaviorLogRef:
```typescript
const name = updateBehaviorLogRef.operationName;
console.log(name);
```

### Variables
The `UpdateBehaviorLog` mutation requires an argument of type `UpdateBehaviorLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateBehaviorLogVariables {
  id: UUIDString;
  notes: string;
}
```
### Return Type
Recall that executing the `UpdateBehaviorLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateBehaviorLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateBehaviorLogData {
  behaviorLog_update?: BehaviorLog_Key | null;
}
```
### Using `UpdateBehaviorLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateBehaviorLog, UpdateBehaviorLogVariables } from '@dataconnect/generated';

// The `UpdateBehaviorLog` mutation requires an argument of type `UpdateBehaviorLogVariables`:
const updateBehaviorLogVars: UpdateBehaviorLogVariables = {
  id: ..., 
  notes: ..., 
};

// Call the `updateBehaviorLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateBehaviorLog(updateBehaviorLogVars);
// Variables can be defined inline as well.
const { data } = await updateBehaviorLog({ id: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateBehaviorLog(dataConnect, updateBehaviorLogVars);

console.log(data.behaviorLog_update);

// Or, you can use the `Promise` API.
updateBehaviorLog(updateBehaviorLogVars).then((response) => {
  const data = response.data;
  console.log(data.behaviorLog_update);
});
```

### Using `UpdateBehaviorLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateBehaviorLogRef, UpdateBehaviorLogVariables } from '@dataconnect/generated';

// The `UpdateBehaviorLog` mutation requires an argument of type `UpdateBehaviorLogVariables`:
const updateBehaviorLogVars: UpdateBehaviorLogVariables = {
  id: ..., 
  notes: ..., 
};

// Call the `updateBehaviorLogRef()` function to get a reference to the mutation.
const ref = updateBehaviorLogRef(updateBehaviorLogVars);
// Variables can be defined inline as well.
const ref = updateBehaviorLogRef({ id: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateBehaviorLogRef(dataConnect, updateBehaviorLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.behaviorLog_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.behaviorLog_update);
});
```

## DeleteBehaviorLog
You can execute the `DeleteBehaviorLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteBehaviorLog(vars: DeleteBehaviorLogVariables): MutationPromise<DeleteBehaviorLogData, DeleteBehaviorLogVariables>;

interface DeleteBehaviorLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteBehaviorLogVariables): MutationRef<DeleteBehaviorLogData, DeleteBehaviorLogVariables>;
}
export const deleteBehaviorLogRef: DeleteBehaviorLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteBehaviorLog(dc: DataConnect, vars: DeleteBehaviorLogVariables): MutationPromise<DeleteBehaviorLogData, DeleteBehaviorLogVariables>;

interface DeleteBehaviorLogRef {
  ...
  (dc: DataConnect, vars: DeleteBehaviorLogVariables): MutationRef<DeleteBehaviorLogData, DeleteBehaviorLogVariables>;
}
export const deleteBehaviorLogRef: DeleteBehaviorLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteBehaviorLogRef:
```typescript
const name = deleteBehaviorLogRef.operationName;
console.log(name);
```

### Variables
The `DeleteBehaviorLog` mutation requires an argument of type `DeleteBehaviorLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteBehaviorLogVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteBehaviorLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteBehaviorLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteBehaviorLogData {
  behaviorLog_delete?: BehaviorLog_Key | null;
}
```
### Using `DeleteBehaviorLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteBehaviorLog, DeleteBehaviorLogVariables } from '@dataconnect/generated';

// The `DeleteBehaviorLog` mutation requires an argument of type `DeleteBehaviorLogVariables`:
const deleteBehaviorLogVars: DeleteBehaviorLogVariables = {
  id: ..., 
};

// Call the `deleteBehaviorLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteBehaviorLog(deleteBehaviorLogVars);
// Variables can be defined inline as well.
const { data } = await deleteBehaviorLog({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteBehaviorLog(dataConnect, deleteBehaviorLogVars);

console.log(data.behaviorLog_delete);

// Or, you can use the `Promise` API.
deleteBehaviorLog(deleteBehaviorLogVars).then((response) => {
  const data = response.data;
  console.log(data.behaviorLog_delete);
});
```

### Using `DeleteBehaviorLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteBehaviorLogRef, DeleteBehaviorLogVariables } from '@dataconnect/generated';

// The `DeleteBehaviorLog` mutation requires an argument of type `DeleteBehaviorLogVariables`:
const deleteBehaviorLogVars: DeleteBehaviorLogVariables = {
  id: ..., 
};

// Call the `deleteBehaviorLogRef()` function to get a reference to the mutation.
const ref = deleteBehaviorLogRef(deleteBehaviorLogVars);
// Variables can be defined inline as well.
const ref = deleteBehaviorLogRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteBehaviorLogRef(dataConnect, deleteBehaviorLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.behaviorLog_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.behaviorLog_delete);
});
```

