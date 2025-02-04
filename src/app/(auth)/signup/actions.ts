"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { signUpSchema, signUpValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

//serer actions is conenient way to write backend codes in nextjs. use Serer turns the exported functions into server actions

export async function signUp(
  credentials: signUpValues,
): Promise<{ error: string }> {
  try {
    const { username, email, password } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    console.log('passwordHash', passwordHash)

    const userId = generateIdFromEntropySize(10);
    console.log('userId', userId)

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive", //this means chioma === Chioma
        },
      },
    });
    console.log("existingUsername", existingUsername)

    if (existingUsername) {
      return {
        error: "Username already taken",
      };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
    console.log("existingEmail", existingEmail)

    if (existingEmail) {
      return {
        error: "Email already taken",
      };
    }

    console.log("Creating user in database....")
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        username,
        displayName: username,
        email,
        passwordHash,
      },

      // await streamServerClient.upsertUser({
      //     id: userId,
      //     username,
      //     name: username,
      // })
    }).catch(error => {
        console.error("Error creating user:", error);
        return null;
    });
    console.log("newUser", newUser)

    if (!newUser) {
        return { error: "User creation failed. Please try again." };
    }

    const session = await lucia.createSession(userId, {});
    console.log("session", session);
    if (!session) {
        console.error("Session creation failed.");
        return { error: "Failed to create session. Please try again." };
    }
    const sessionCookie = lucia.createSessionCookie(session.id);
    console.log("sessionCookie", sessionCookie);

    const cookieStore = await cookies()
    console.log('cookieStore', cookieStore)

    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      error: "Something went wrong. Please try again",
    };
  }
}
