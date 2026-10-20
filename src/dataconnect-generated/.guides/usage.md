# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, updateUser, deleteUser, getUser, listAllUsers, createDog, updateDog, deleteDog, getDog, listMyDogs } from '@dataconnect/generated';


// Operation CreateUser:  For variables, look at type CreateUserVars in ../index.d.ts
const { data } = await CreateUser(dataConnect, createUserVars);

// Operation UpdateUser:  For variables, look at type UpdateUserVars in ../index.d.ts
const { data } = await UpdateUser(dataConnect, updateUserVars);

// Operation DeleteUser: 
const { data } = await DeleteUser(dataConnect);

// Operation GetUser: 
const { data } = await GetUser(dataConnect);

// Operation ListAllUsers: 
const { data } = await ListAllUsers(dataConnect);

// Operation CreateDog:  For variables, look at type CreateDogVars in ../index.d.ts
const { data } = await CreateDog(dataConnect, createDogVars);

// Operation UpdateDog:  For variables, look at type UpdateDogVars in ../index.d.ts
const { data } = await UpdateDog(dataConnect, updateDogVars);

// Operation DeleteDog:  For variables, look at type DeleteDogVars in ../index.d.ts
const { data } = await DeleteDog(dataConnect, deleteDogVars);

// Operation GetDog:  For variables, look at type GetDogVars in ../index.d.ts
const { data } = await GetDog(dataConnect, getDogVars);

// Operation ListMyDogs: 
const { data } = await ListMyDogs(dataConnect);


```