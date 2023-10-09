// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves users from the "users" array above.
export default {
  Query: {
    getUsers: async (_, { id }, { dataSources }) => {
      console.log({ dataSources });
      return dataSources.dogsDB.getDog(id);
    },
  },
};
