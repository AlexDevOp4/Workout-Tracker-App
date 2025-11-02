import { clerkClient } from "@clerk/express";

export const getUserByEmail = async (email) => {
  try {
    const usersList = await clerkClient.users.getUserList({
      emailAddress: [email], // Pass the email address in an array
    });

    if (usersList.totalCount > 0) {
      // Assuming email addresses are unique per user,
      // the first result in the data array will be the desired user.
      const user = usersList.data[0];
      return user;
    } else {
      return null; // User not found
    }
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
};
