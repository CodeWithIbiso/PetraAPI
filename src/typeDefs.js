// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
export default `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "User" type defines the queryable fields for every user in our data source.
  type User {
    id : ID
    image : String
    firstname : String!
    lastname : String!
    username : String!
    email : String!
    password : String!
    emailVerified : Boolean
    verificationCode : String
    verificationCodeExpiry : String
    paswordResetCode : String
    passwordResetCodeExpiry : String
    publicKey : String
    secretKey : String
    createdAt : String
  }

  input UserInput {
    image : String
    firstname : String!
    lastname : String!
    username : String!
    email : String!
    password : String!
    emailVerified : Boolean
    verificationCode : String
    verificationCodeExpiry : String
    paswordResetCode : String
    passwordResetCodeExpiry : String
    publicKey : String
    secretKey : String
    createdAt : String
  }

  input UserSignInInput {
    email: String
    password: String
  }

  input passwordResetRequestInput {
    email: String
  }

  input resetPasswordInput {
    id: ID!
    paswordResetCode: Int!
    password: String!
  }
  
  type UserResponse {
    user: User
    code: Int
    token: String
    message: String
  }
  

  input FileInput {
    uri: String
    filename: String
    mime: String
  }
  input LocationInput {
    name: String
    latitude: Float
    longitude: Float
  }
  input CategoriesInput {
    name: String
    image: FileInput
  }
  input PopularCategoriesInput {
    name: String
    image: FileInput
    price: String
    currency: String
  }
  input SpotInput {
    id: ID
    creator: ID
    contactNumber: String!
    title: String!
    publicKey: String!
    location: LocationInput!
    about: String
    category: String!
    description: String!
    categories: [CategoriesInput]
    popularCategories: [PopularCategoriesInput]
    image: FileInput!
    video: FileInput!
    rating: Int
    likes: [ID]
    likesCount: Int
    views: [ID]
    viewsCount: Int
  }
  type Categories {
    name: String!
    image: String!
  }

  type PopularCategories {
    name: String!
    image: String!
    price: String!
    currency: String!
  }

  type Location {
    name: String
    latitude: Float
    longitude: Float
  }
  type Spot {
    id: ID
    creator: ID!
    contactNumber: String!
    publicKey: String!
    title: String!
    location: Location!
    category: String!
    about: String!
    description: String!
    categories: [Categories]
    popularCategories: [PopularCategories]
    image: String
    video: String
    rating: Int
    likes: [ID]
    likesCount: Int
    views: [ID]
    viewsCount: Int
  }

  
  type SpotResponse {
    spot: Spot
    code: Int
    token: String
    message: String
  }

  input SpotIdsInput {
    spotIds: [ID]
    userId: ID
  }
  
  type FileUpdateResponse {
    url: String
    code: Int
    token: String
    message: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "users" query returns an array of zero or more Users (defined above).
  type Query {
    getUsers: [User]
    getSpots: [Spot]
    getUserSpots(creator: ID!): [Spot]
    getPopularSpots: [Spot]
  }
  type Mutation {
    signUp(input:UserInput!): UserResponse
    signIn(input:UserSignInInput!): UserResponse
    verifyUserAccount(verificationCode: Int!): UserResponse
    resendVerificationCode: UserResponse
    forgotPasswordRequest(input: passwordResetRequestInput): UserResponse
    resetPassword(input: resetPasswordInput): UserResponse
    setUserCredentials(publicKey: String!, secretKey: String!): UserResponse
    createOrUpdateSpot(input: SpotInput): SpotResponse
    deleteSpots(input: SpotIdsInput): UserResponse
    uploadFile(input: FileInput): FileUpdateResponse
  }
`;
