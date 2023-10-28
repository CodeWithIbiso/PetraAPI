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
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "users" query returns an array of zero or more Users (defined above).
  type Query {
    getUsers: [User]
  }
  type Mutation {
    signUp(input:UserInput!): UserResponse
    signIn(input:UserSignInInput!): UserResponse
    verifyUserAccount(verificationCode: Int!): UserResponse
    resendVerificationCode: UserResponse
    forgotPasswordRequest(input: passwordResetRequestInput): UserResponse
    resetPassword(input: resetPasswordInput): UserResponse
    setUserCredentials(publicKey: String!, secretKey: String!): UserResponse
  }
`;
