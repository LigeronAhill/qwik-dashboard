import { RequestHandler } from "@builder.io/qwik-city";
import { initializeRepository } from "../../drizzle/db";

export const onRequest: RequestHandler = ({ env }) => {
    const dbURL = env.get("DATABASE_URL");
    if (!dbURL)
        throw new Error("DATABASE_URL environment variable must be set!");
    initializeRepository(dbURL);
};
