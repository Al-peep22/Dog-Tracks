import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface BehaviorLog_Key {
  id: UUIDString;
  __typename?: 'BehaviorLog_Key';
}

export interface CreateBehaviorLogData {
  behaviorLog_insert: BehaviorLog_Key;
}

export interface CreateBehaviorLogVariables {
  dogId: UUIDString;
  behaviorType: string;
  timestamp: TimestampString;
}

export interface CreateDogData {
  dog_insert: Dog_Key;
}

export interface CreateDogVariables {
  name: string;
  breed: string;
  birthDate: DateString;
}

export interface CreateTrainingGoalData {
  trainingGoal_insert: TrainingGoal_Key;
}

export interface CreateTrainingGoalVariables {
  dogId: UUIDString;
  title: string;
  targetDate: DateString;
}

export interface CreateTrainingSessionData {
  trainingSession_insert: TrainingSession_Key;
}

export interface CreateTrainingSessionVariables {
  dogId: UUIDString;
  date: DateString;
  duration: number;
  skill: string;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  displayName: string;
  email: string;
}

export interface DeleteBehaviorLogData {
  behaviorLog_delete?: BehaviorLog_Key | null;
}

export interface DeleteBehaviorLogVariables {
  id: UUIDString;
}

export interface DeleteDogData {
  dog_delete?: Dog_Key | null;
}

export interface DeleteDogVariables {
  id: UUIDString;
}

export interface DeleteTrainingGoalData {
  trainingGoal_delete?: TrainingGoal_Key | null;
}

export interface DeleteTrainingGoalVariables {
  id: UUIDString;
}

export interface DeleteTrainingSessionData {
  trainingSession_delete?: TrainingSession_Key | null;
}

export interface DeleteTrainingSessionVariables {
  id: UUIDString;
}

export interface DeleteUserData {
  user_delete?: User_Key | null;
}

export interface Dog_Key {
  id: UUIDString;
  __typename?: 'Dog_Key';
}

export interface GetBehaviorLogData {
  behaviorLog?: {
    behaviorType: string;
    notes?: string | null;
  };
}

export interface GetBehaviorLogVariables {
  id: UUIDString;
}

export interface GetDogData {
  dog?: {
    name: string;
    breed: string;
    owner?: {
      displayName: string;
    };
  };
}

export interface GetDogVariables {
  id: UUIDString;
}

export interface GetTrainingGoalData {
  trainingGoal?: {
    title: string;
    status?: string | null;
  };
}

export interface GetTrainingGoalVariables {
  id: UUIDString;
}

export interface GetTrainingSessionData {
  trainingSession?: {
    skillFocused: string;
    successRating?: number | null;
  };
}

export interface GetTrainingSessionVariables {
  id: UUIDString;
}

export interface GetUserData {
  user?: {
    id: UUIDString;
    displayName: string;
    email: string;
  } & User_Key;
}

export interface ListAllUsersData {
  users: ({
    id: UUIDString;
    displayName: string;
  } & User_Key)[];
}

export interface ListDogGoalsData {
  trainingGoals: ({
    title: string;
    targetDate: DateString;
  })[];
}

export interface ListDogGoalsVariables {
  dogId: UUIDString;
}

export interface ListDogLogsData {
  behaviorLogs: ({
    timestamp: TimestampString;
    behaviorType: string;
  })[];
}

export interface ListDogLogsVariables {
  dogId: UUIDString;
}

export interface ListDogSessionsData {
  trainingSessions: ({
    date: DateString;
    skillFocused: string;
  })[];
}

export interface ListDogSessionsVariables {
  dogId: UUIDString;
}

export interface ListMyDogsData {
  dogs: ({
    id: UUIDString;
    name: string;
  } & Dog_Key)[];
}

export interface TrainingGoal_Key {
  id: UUIDString;
  __typename?: 'TrainingGoal_Key';
}

export interface TrainingSession_Key {
  id: UUIDString;
  __typename?: 'TrainingSession_Key';
}

export interface UpdateBehaviorLogData {
  behaviorLog_update?: BehaviorLog_Key | null;
}

export interface UpdateBehaviorLogVariables {
  id: UUIDString;
  notes: string;
}

export interface UpdateDogData {
  dog_update?: Dog_Key | null;
}

export interface UpdateDogVariables {
  id: UUIDString;
  photoUrl: string;
}

export interface UpdateTrainingGoalData {
  trainingGoal_update?: TrainingGoal_Key | null;
}

export interface UpdateTrainingGoalVariables {
  id: UUIDString;
  status: string;
}

export interface UpdateTrainingSessionData {
  trainingSession_update?: TrainingSession_Key | null;
}

export interface UpdateTrainingSessionVariables {
  id: UUIDString;
  rating: number;
}

export interface UpdateUserData {
  user_update?: User_Key | null;
}

export interface UpdateUserVariables {
  displayName: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface UpdateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
  operationName: string;
}
export const updateUserRef: UpdateUserRef;

export function updateUser(vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;
export function updateUser(dc: DataConnect, vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;

interface DeleteUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteUserData, undefined>;
  operationName: string;
}
export const deleteUserRef: DeleteUserRef;

export function deleteUser(): MutationPromise<DeleteUserData, undefined>;
export function deleteUser(dc: DataConnect): MutationPromise<DeleteUserData, undefined>;

interface GetUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserData, undefined>;
  operationName: string;
}
export const getUserRef: GetUserRef;

export function getUser(options?: ExecuteQueryOptions): QueryPromise<GetUserData, undefined>;
export function getUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserData, undefined>;

interface ListAllUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllUsersData, undefined>;
  operationName: string;
}
export const listAllUsersRef: ListAllUsersRef;

export function listAllUsers(options?: ExecuteQueryOptions): QueryPromise<ListAllUsersData, undefined>;
export function listAllUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllUsersData, undefined>;

interface CreateDogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDogVariables): MutationRef<CreateDogData, CreateDogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateDogVariables): MutationRef<CreateDogData, CreateDogVariables>;
  operationName: string;
}
export const createDogRef: CreateDogRef;

export function createDog(vars: CreateDogVariables): MutationPromise<CreateDogData, CreateDogVariables>;
export function createDog(dc: DataConnect, vars: CreateDogVariables): MutationPromise<CreateDogData, CreateDogVariables>;

interface UpdateDogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateDogVariables): MutationRef<UpdateDogData, UpdateDogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateDogVariables): MutationRef<UpdateDogData, UpdateDogVariables>;
  operationName: string;
}
export const updateDogRef: UpdateDogRef;

export function updateDog(vars: UpdateDogVariables): MutationPromise<UpdateDogData, UpdateDogVariables>;
export function updateDog(dc: DataConnect, vars: UpdateDogVariables): MutationPromise<UpdateDogData, UpdateDogVariables>;

interface DeleteDogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteDogVariables): MutationRef<DeleteDogData, DeleteDogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteDogVariables): MutationRef<DeleteDogData, DeleteDogVariables>;
  operationName: string;
}
export const deleteDogRef: DeleteDogRef;

export function deleteDog(vars: DeleteDogVariables): MutationPromise<DeleteDogData, DeleteDogVariables>;
export function deleteDog(dc: DataConnect, vars: DeleteDogVariables): MutationPromise<DeleteDogData, DeleteDogVariables>;

interface GetDogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDogVariables): QueryRef<GetDogData, GetDogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetDogVariables): QueryRef<GetDogData, GetDogVariables>;
  operationName: string;
}
export const getDogRef: GetDogRef;

export function getDog(vars: GetDogVariables, options?: ExecuteQueryOptions): QueryPromise<GetDogData, GetDogVariables>;
export function getDog(dc: DataConnect, vars: GetDogVariables, options?: ExecuteQueryOptions): QueryPromise<GetDogData, GetDogVariables>;

interface ListMyDogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyDogsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyDogsData, undefined>;
  operationName: string;
}
export const listMyDogsRef: ListMyDogsRef;

export function listMyDogs(options?: ExecuteQueryOptions): QueryPromise<ListMyDogsData, undefined>;
export function listMyDogs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyDogsData, undefined>;

interface CreateTrainingGoalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTrainingGoalVariables): MutationRef<CreateTrainingGoalData, CreateTrainingGoalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTrainingGoalVariables): MutationRef<CreateTrainingGoalData, CreateTrainingGoalVariables>;
  operationName: string;
}
export const createTrainingGoalRef: CreateTrainingGoalRef;

export function createTrainingGoal(vars: CreateTrainingGoalVariables): MutationPromise<CreateTrainingGoalData, CreateTrainingGoalVariables>;
export function createTrainingGoal(dc: DataConnect, vars: CreateTrainingGoalVariables): MutationPromise<CreateTrainingGoalData, CreateTrainingGoalVariables>;

interface UpdateTrainingGoalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTrainingGoalVariables): MutationRef<UpdateTrainingGoalData, UpdateTrainingGoalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTrainingGoalVariables): MutationRef<UpdateTrainingGoalData, UpdateTrainingGoalVariables>;
  operationName: string;
}
export const updateTrainingGoalRef: UpdateTrainingGoalRef;

export function updateTrainingGoal(vars: UpdateTrainingGoalVariables): MutationPromise<UpdateTrainingGoalData, UpdateTrainingGoalVariables>;
export function updateTrainingGoal(dc: DataConnect, vars: UpdateTrainingGoalVariables): MutationPromise<UpdateTrainingGoalData, UpdateTrainingGoalVariables>;

interface DeleteTrainingGoalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTrainingGoalVariables): MutationRef<DeleteTrainingGoalData, DeleteTrainingGoalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteTrainingGoalVariables): MutationRef<DeleteTrainingGoalData, DeleteTrainingGoalVariables>;
  operationName: string;
}
export const deleteTrainingGoalRef: DeleteTrainingGoalRef;

export function deleteTrainingGoal(vars: DeleteTrainingGoalVariables): MutationPromise<DeleteTrainingGoalData, DeleteTrainingGoalVariables>;
export function deleteTrainingGoal(dc: DataConnect, vars: DeleteTrainingGoalVariables): MutationPromise<DeleteTrainingGoalData, DeleteTrainingGoalVariables>;

interface GetTrainingGoalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTrainingGoalVariables): QueryRef<GetTrainingGoalData, GetTrainingGoalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTrainingGoalVariables): QueryRef<GetTrainingGoalData, GetTrainingGoalVariables>;
  operationName: string;
}
export const getTrainingGoalRef: GetTrainingGoalRef;

export function getTrainingGoal(vars: GetTrainingGoalVariables, options?: ExecuteQueryOptions): QueryPromise<GetTrainingGoalData, GetTrainingGoalVariables>;
export function getTrainingGoal(dc: DataConnect, vars: GetTrainingGoalVariables, options?: ExecuteQueryOptions): QueryPromise<GetTrainingGoalData, GetTrainingGoalVariables>;

interface ListDogGoalsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListDogGoalsVariables): QueryRef<ListDogGoalsData, ListDogGoalsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListDogGoalsVariables): QueryRef<ListDogGoalsData, ListDogGoalsVariables>;
  operationName: string;
}
export const listDogGoalsRef: ListDogGoalsRef;

export function listDogGoals(vars: ListDogGoalsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDogGoalsData, ListDogGoalsVariables>;
export function listDogGoals(dc: DataConnect, vars: ListDogGoalsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDogGoalsData, ListDogGoalsVariables>;

interface CreateTrainingSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTrainingSessionVariables): MutationRef<CreateTrainingSessionData, CreateTrainingSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTrainingSessionVariables): MutationRef<CreateTrainingSessionData, CreateTrainingSessionVariables>;
  operationName: string;
}
export const createTrainingSessionRef: CreateTrainingSessionRef;

export function createTrainingSession(vars: CreateTrainingSessionVariables): MutationPromise<CreateTrainingSessionData, CreateTrainingSessionVariables>;
export function createTrainingSession(dc: DataConnect, vars: CreateTrainingSessionVariables): MutationPromise<CreateTrainingSessionData, CreateTrainingSessionVariables>;

interface UpdateTrainingSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTrainingSessionVariables): MutationRef<UpdateTrainingSessionData, UpdateTrainingSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTrainingSessionVariables): MutationRef<UpdateTrainingSessionData, UpdateTrainingSessionVariables>;
  operationName: string;
}
export const updateTrainingSessionRef: UpdateTrainingSessionRef;

export function updateTrainingSession(vars: UpdateTrainingSessionVariables): MutationPromise<UpdateTrainingSessionData, UpdateTrainingSessionVariables>;
export function updateTrainingSession(dc: DataConnect, vars: UpdateTrainingSessionVariables): MutationPromise<UpdateTrainingSessionData, UpdateTrainingSessionVariables>;

interface DeleteTrainingSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTrainingSessionVariables): MutationRef<DeleteTrainingSessionData, DeleteTrainingSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteTrainingSessionVariables): MutationRef<DeleteTrainingSessionData, DeleteTrainingSessionVariables>;
  operationName: string;
}
export const deleteTrainingSessionRef: DeleteTrainingSessionRef;

export function deleteTrainingSession(vars: DeleteTrainingSessionVariables): MutationPromise<DeleteTrainingSessionData, DeleteTrainingSessionVariables>;
export function deleteTrainingSession(dc: DataConnect, vars: DeleteTrainingSessionVariables): MutationPromise<DeleteTrainingSessionData, DeleteTrainingSessionVariables>;

interface GetTrainingSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTrainingSessionVariables): QueryRef<GetTrainingSessionData, GetTrainingSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTrainingSessionVariables): QueryRef<GetTrainingSessionData, GetTrainingSessionVariables>;
  operationName: string;
}
export const getTrainingSessionRef: GetTrainingSessionRef;

export function getTrainingSession(vars: GetTrainingSessionVariables, options?: ExecuteQueryOptions): QueryPromise<GetTrainingSessionData, GetTrainingSessionVariables>;
export function getTrainingSession(dc: DataConnect, vars: GetTrainingSessionVariables, options?: ExecuteQueryOptions): QueryPromise<GetTrainingSessionData, GetTrainingSessionVariables>;

interface ListDogSessionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListDogSessionsVariables): QueryRef<ListDogSessionsData, ListDogSessionsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListDogSessionsVariables): QueryRef<ListDogSessionsData, ListDogSessionsVariables>;
  operationName: string;
}
export const listDogSessionsRef: ListDogSessionsRef;

export function listDogSessions(vars: ListDogSessionsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDogSessionsData, ListDogSessionsVariables>;
export function listDogSessions(dc: DataConnect, vars: ListDogSessionsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDogSessionsData, ListDogSessionsVariables>;

interface CreateBehaviorLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBehaviorLogVariables): MutationRef<CreateBehaviorLogData, CreateBehaviorLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateBehaviorLogVariables): MutationRef<CreateBehaviorLogData, CreateBehaviorLogVariables>;
  operationName: string;
}
export const createBehaviorLogRef: CreateBehaviorLogRef;

export function createBehaviorLog(vars: CreateBehaviorLogVariables): MutationPromise<CreateBehaviorLogData, CreateBehaviorLogVariables>;
export function createBehaviorLog(dc: DataConnect, vars: CreateBehaviorLogVariables): MutationPromise<CreateBehaviorLogData, CreateBehaviorLogVariables>;

interface UpdateBehaviorLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBehaviorLogVariables): MutationRef<UpdateBehaviorLogData, UpdateBehaviorLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateBehaviorLogVariables): MutationRef<UpdateBehaviorLogData, UpdateBehaviorLogVariables>;
  operationName: string;
}
export const updateBehaviorLogRef: UpdateBehaviorLogRef;

export function updateBehaviorLog(vars: UpdateBehaviorLogVariables): MutationPromise<UpdateBehaviorLogData, UpdateBehaviorLogVariables>;
export function updateBehaviorLog(dc: DataConnect, vars: UpdateBehaviorLogVariables): MutationPromise<UpdateBehaviorLogData, UpdateBehaviorLogVariables>;

interface DeleteBehaviorLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteBehaviorLogVariables): MutationRef<DeleteBehaviorLogData, DeleteBehaviorLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteBehaviorLogVariables): MutationRef<DeleteBehaviorLogData, DeleteBehaviorLogVariables>;
  operationName: string;
}
export const deleteBehaviorLogRef: DeleteBehaviorLogRef;

export function deleteBehaviorLog(vars: DeleteBehaviorLogVariables): MutationPromise<DeleteBehaviorLogData, DeleteBehaviorLogVariables>;
export function deleteBehaviorLog(dc: DataConnect, vars: DeleteBehaviorLogVariables): MutationPromise<DeleteBehaviorLogData, DeleteBehaviorLogVariables>;

interface GetBehaviorLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBehaviorLogVariables): QueryRef<GetBehaviorLogData, GetBehaviorLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBehaviorLogVariables): QueryRef<GetBehaviorLogData, GetBehaviorLogVariables>;
  operationName: string;
}
export const getBehaviorLogRef: GetBehaviorLogRef;

export function getBehaviorLog(vars: GetBehaviorLogVariables, options?: ExecuteQueryOptions): QueryPromise<GetBehaviorLogData, GetBehaviorLogVariables>;
export function getBehaviorLog(dc: DataConnect, vars: GetBehaviorLogVariables, options?: ExecuteQueryOptions): QueryPromise<GetBehaviorLogData, GetBehaviorLogVariables>;

interface ListDogLogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListDogLogsVariables): QueryRef<ListDogLogsData, ListDogLogsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListDogLogsVariables): QueryRef<ListDogLogsData, ListDogLogsVariables>;
  operationName: string;
}
export const listDogLogsRef: ListDogLogsRef;

export function listDogLogs(vars: ListDogLogsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDogLogsData, ListDogLogsVariables>;
export function listDogLogs(dc: DataConnect, vars: ListDogLogsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDogLogsData, ListDogLogsVariables>;

