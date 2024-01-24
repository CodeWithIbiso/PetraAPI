// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves users from the "users" array above.
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { object, string } from "yup";

import {
  extractToken,
  FailedRequestErrorHandler,
  generateJWT,
  generateRandomNumber,
  hashPassword,
  hasVerificationCodeExpired,
  sendEmailConfirmationMail,
  sendResetPasswordMail,
  verificationCodeExpiry,
} from "./utils/helper.js";
import {
  extractAllFileUrls,
  handleDeleteFileUpload,
  handleDeleteTextUpload,
  handleFileUpload,
  handleMultipleFileUploads,
  handleTextUpload,
} from "./utils/firebaseConfig.js";

export default {
  Query: {
    getUsers: async (_, {}, { dataSources }) => {
      try {
        return dataSources.Users.getUsers();
      } catch (error) {
        return FailedRequestErrorHandler(error);
      }
    },
    getSpots: async (_, {}, { dataSources }) => {
      try {
        return dataSources.Spots.getSpots();
      } catch (error) {
        return FailedRequestErrorHandler(error);
      }
    },
    getUserSpots: async (_, creator, { dataSources: { Spots } }) => {
      try {
        return Spots.getUserSpots(creator);
      } catch (error) {
        return FailedRequestErrorHandler(error);
      }
    },
    getPopularSpots: async (_, {}, { dataSources }) => {
      try {
        return dataSources.Spots.getPopularSpots();
      } catch (error) {
        return FailedRequestErrorHandler(error);
      }
    },
  },
  Mutation: {
    signUp: async (_, { input: newUser }, { dataSources }) => {
      try {
        // validate user input using yup
        let userSchema = object({
          username: string()
            .min(3)
            .matches(
              /^[a-zA-Z0-9_]+$/,
              "Username must only contain letters, numbers, and underscores."
            )
            .required(),
          firstname: string()
            .min(3)
            .matches(
              /^[a-zA-Z ]+$/,
              "First name must not contain special characters or numbers"
            )
            .required(),
          lastname: string()
            .min(3)
            .matches(
              /^[a-zA-Z ]+$/,
              "Last name must not contain special characters or numbers"
            )
            .required(),
          email: string().email(),
          password: string().required(),
        });
        await userSchema.validate(newUser);

        // check if user already exists by email and username
        const queryOptions = {
          $or: [{ email: newUser.email }, { username: newUser.username }],
        };
        const user = await dataSources.Users.getUserByParams(queryOptions);
        if (user) {
          if (user.email == newUser.email.trim()) {
            return FailedRequestErrorHandler({
              message:
                "Your email has already being registered. Please sign in or change your email and try again",
            });
          } else {
            return FailedRequestErrorHandler({
              message:
                "Your username has already being taken. Please change your username and try again",
            });
          }
        }

        // hash password using bcrypt
        const hashedPassword = hashPassword(newUser.password);
        // generate a verification code and expiry
        const verificationCode = generateRandomNumber();
        const codeExpiry = verificationCodeExpiry();
        // save this new user
        const newUserObj = {
          firstname: newUser.firstname.trim(),
          lastname: newUser.lastname.trim(),
          username: newUser.username.trim(),
          email: newUser.email.trim(),
          password: hashedPassword,
          verificationCode: verificationCode,
          verificationCodeExpiry: codeExpiry,
        };
        const newlySavedUser = await dataSources.Users.addUser(newUserObj);
        // send user email for confirmation - SKIP
        sendEmailConfirmationMail({
          email: newUser.email,
          code: verificationCode,
          name: newUser.firstname,
        });
        // return signed in user
        const userSignInToken = generateJWT(newlySavedUser);
        return {
          user: newlySavedUser,
          code: 200,
          message: "User has been created successfully",
          token: userSignInToken,
        };
      } catch (error) {
        return FailedRequestErrorHandler(error);
      }
    },
    signIn: async (_, { input }, { dataSources }) => {
      try {
        const email = input?.email?.trim();
        const password = input?.password?.trim();

        if (!email || !password) {
          return FailedRequestErrorHandler({
            message: "Please fill up all the required fields and try again.",
          });
        }
        const user = await dataSources.Users.getUserByParams({ email }); // Find user by email and get password

        if (user == null) {
          return FailedRequestErrorHandler({
            message:
              "It seems you're trying to sign in with an email address that has not been registered with us. Kindly sign up to create an account to continue.",
          });
        }
        const passwordMatchCheck = await bcrypt.compare(
          password,
          user.password
        ); // compare user hashed password with received password
        if (!passwordMatchCheck) {
          return FailedRequestErrorHandler({
            message:
              "Your password is incorrect. Please try again or click on forgot password to create a new one",
          });
        }
        const userSignInToken = generateJWT(user);

        return {
          user,
          token: userSignInToken,
          code: 200,
          message: "User signed in successfully",
        };
      } catch (error) {
        return FailedRequestErrorHandler(error);
      }
    },
    verifyUserAccount: async (
      _,
      { verificationCode },
      { dataSources, token }
    ) => {
      try {
        const decodedToken = jwt.decode(extractToken(token));
        if (decodedToken?.id) {
          let user = await dataSources.Users.getUserByParams({
            _id: decodedToken.id,
          });
          if (verificationCode !== user.verificationCode) {
            return FailedRequestErrorHandler({
              message:
                "Verification failed. The token you have provided is invalid. Please check to make sure you have entered it correctly and try again",
            });
          }
          if (hasVerificationCodeExpired(user.verificationCodeExpiry)) {
            return FailedRequestErrorHandler({
              message:
                "Verification failed. The token you have provided has expired. Please resend another confirmation email to get a new token",
            });
          }
          const userUpdate = {
            _id: user?._id,
            verificationCodeExpiry: "",
            verificationCode: null,
            emailVerified: true,
          };
          user = await dataSources.Users.updateUser(userUpdate);

          return {
            user,
            code: 200,
            message: "User has been verified successfully",
            token,
          };
        } else {
          return FailedRequestErrorHandler({
            message: "User token is invalid. Sign in to continue",
          });
        }
      } catch (error) {
        return FailedRequestErrorHandler(error);
      }
    },
    resendVerificationCode: async (_, {}, { dataSources, token }) => {
      try {
        const decodedToken = jwt.decode(extractToken(token));
        if (decodedToken?.id) {
          let user = await dataSources.Users.getUserByParams({
            _id: decodedToken.id,
          });
          if (user.emailVerified) {
            return FailedRequestErrorHandler({
              message: "Your email has already been verified",
            });
          }
          const code = generateRandomNumber();
          const userUpdate = {
            _id: user._id,
            verificationCodeExpiry: verificationCodeExpiry(),
            verificationCode: code,
          };
          user = await dataSources.Users.updateUser(userUpdate);
          sendEmailConfirmationMail({
            email: user.email,
            code,
            name: user.firstname,
          });
          return {
            user,
            code: 200,
            message: "User verification code has been resent successfully",
            token,
          };
        } else {
          return FailedRequestErrorHandler({
            message: "User token is invalid. Sign in to continue",
          });
        }
      } catch (error) {
        return FailedRequestErrorHandler(error);
      }
    },
    forgotPasswordRequest: async (_, { input }, { dataSources }) => {
      try {
        const email = input?.email?.trim();
        if (!email) {
          return FailedRequestErrorHandler({
            message:
              "Oops, it seems you may have forgotten to fill up some fields. Please fill up the required fields and try again.",
          });
        }
        // Find user by email and get password
        let user = await dataSources.Users.getUserByParams({ email });
        if (user == null) {
          return FailedRequestErrorHandler({
            message:
              "There is no account associated with the email you sent. Kindly sign up to create an account to continue.",
          });
        }

        const code = generateRandomNumber();
        const userUpdate = {
          _id: user?._id,
          paswordResetCode: code,
          passwordResetCodeExpiry: verificationCodeExpiry(),
        };

        user = await dataSources.Users.updateUser(userUpdate);

        sendResetPasswordMail({
          email: user.email,
          code,
          name: user.firstname,
        });
        return {
          user,
          code: 200,
          message: "User password reset code has been sent successfully",
          token: null,
        };
      } catch (error) {
        return FailedRequestErrorHandler(error);
      }
    },
    resetPassword: async (_, { input }, { dataSources }) => {
      try {
        if (input?.id) {
          let user = await dataSources.Users.getUserByParams({
            _id: input?.id,
          });
          if (user == null) {
            return FailedRequestErrorHandler({
              message:
                "Invalid inputs received. Please request a password change and try again",
            });
          }
          if (input?.paswordResetCode !== user?.paswordResetCode) {
            return FailedRequestErrorHandler({
              message:
                "Verification failed. The password reset token you have provided is invalid. Please check to make sure you have entered it correctly and try again",
            });
          }
          if (hasVerificationCodeExpired(user?.passwordResetCodeExpiry)) {
            return FailedRequestErrorHandler({
              message:
                "Verification failed. The password reset token you have provided has expired. Please resend another email to get a new password reset token",
            });
          }
          const hashedPassword = hashPassword(input.password);
          const userUpdate = {
            _id: user?._id,
            passwordResetCodeExpiry: "",
            paswordResetCode: null,
            password: hashedPassword,
          };
          user = await dataSources.Users.updateUser(userUpdate);
          const userSignInToken = generateJWT(user);
          return {
            user,
            code: 200,
            message: "User password has been reset successfully",
            token: userSignInToken,
          };
        } else {
          return FailedRequestErrorHandler({
            message:
              "Invalid inputs received. Please check your inputs and try again.",
          });
        }
      } catch (error) {
        return FailedRequestErrorHandler(error);
      }
    },
    setUserCredentials: async (
      _,
      { publicKey, secretKey },
      { dataSources, token }
    ) => {
      try {
        const user = jwt.verify(
          extractToken(token),
          process.env.JWT_SECRET,
          (err, decoded) => {
            if (err) {
              return FailedRequestErrorHandler({
                message: "Authorization failed",
              });
            }
            return decoded;
          }
        );
        if (user?.code == 280) {
          return user;
        }
        let userInfo = await dataSources.Users.getUserByParams({
          email: user?.email,
        });
        if (!userInfo) {
          return FailedRequestErrorHandler({
            message: "User not found",
          });
        }
        if (userInfo?._doc) userInfo = userInfo?._doc;

        if (userInfo?.publicKey || userInfo?.secretKey)
          return FailedRequestErrorHandler({
            message: "user already has credentials",
          });
        const updatedUser = await dataSources.Users.updateUser({
          ...userInfo,
          publicKey,
          secretKey,
        });
        return {
          user: updatedUser,
          message: "user credentials updated successfully",
          code: 200,
        };
      } catch (error) {
        return FailedRequestErrorHandler(error);
      }
    },
    createOrUpdateSpot: async (_, { input }, { dataSources, token }) => {
      try {
        let spotObject = {
          ...input,
        };
        const reToken = () => {
          if (token && token.slice(0, 6) == "Bearer")
            return token.split(" ")[1];
          return token;
        };
        jwt.verify(reToken(), process.env.JWT_SECRET, (err, decoded) => {
          if (err) throw new Error("You are not authenticated");
          spotObject.creator = decoded.id;
        });

        let image = spotObject.image;
        // save spot image
        image = await handleFileUpload(image);
        let video = spotObject.video;
        // save spot image
        video = await handleFileUpload(video);
        // save categories
        let categories = await handleMultipleFileUploads(spotObject.categories);
        // save popular categories
        let popularCategories = await Promise.all(
          spotObject.popularCategories.map(async (popularCategory) => {
            const image = await handleFileUpload(popularCategory.image);
            return {
              ...popularCategory,
              image,
            };
          })
        );

        spotObject.image = image;
        spotObject.video = video;
        spotObject.categories = categories;
        spotObject.popularCategories = popularCategories;

        const spot = spotObject?.id
          ? dataSources.Spots.updateSpot(spotObject)
          : dataSources.Spots.createSpot(spotObject);

        return {
          spot,
          token,
          code: 200,
          message: "Spot saved successfully",
        };
      } catch (error) {
        return FailedRequestErrorHandler(error);
      }
    },
    deleteSpots: async (_, { input }, { dataSources, token }) => {
      try {
        const reToken = () => {
          if (token && token.slice(0, 6) == "Bearer")
            return token.split(" ")[1];
          return token;
        };
        jwt.verify(reToken(), process.env.JWT_SECRET, (err) => {
          if (err) throw new Error("You are not authenticated");
        });

        await dataSources.Spots.deleteSpots({
          _id: { $in: input.spotIds },
          creator: input.userId,
        });
        return {
          user: null,
          token: "spots deleted completely",
          code: 200,
          message: "Success",
        };
      } catch (error) {
        return FailedRequestErrorHandler(error);
      }
    },
    uploadFile: async (_, { input }, { token }) => {
      try {
        console.log({ token });
        const reToken = () => {
          return token?.replaceAll("Bearer", "")?.trim();
        };
        jwt.verify(reToken(), process.env.JWT_SECRET, (err) => {
          if (err) throw new Error("You are not authenticated");
        });
        const url = await handleTextUpload(input);
        return {
          url,
          code: 200,
          message: "File uploaded successfully",
        };
      } catch (error) {
        return FailedRequestErrorHandler(error);
      }
    },
  },
};
