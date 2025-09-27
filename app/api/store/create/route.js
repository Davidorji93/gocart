import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import imagekit from "@/config/imageKit";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const name = String(formData.get("name") || "").trim();
    const usernameRaw = formData.get("username") || "";
    const username = String(usernameRaw).toLowerCase().trim();
    const description = String(formData.get("description") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const image = formData.get("image");

    if (!name || !username || !description || !email || !contact || !address || !image) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Check if the user already has a store
    const existingStore = await prisma.store.findFirst({
      where: { userId },
    });

    if (existingStore) {
      return NextResponse.json({ status: existingStore.status });
    }

    // Check if the username is already taken
    const isUsernameTaken = await prisma.store.findFirst({
      where: { username },
    });

    if (isUsernameTaken) {
      return NextResponse.json({ message: "Username already taken" }, { status: 400 });
    }

    // IMAGE UPLOAD TO IMAGEKIT
    // `image` should be a File-like; convert to buffer
    const buffer = Buffer.from(await image.arrayBuffer());
    const response = await imagekit.upload({
      file: buffer,
      fileName: image.name || `${username}-logo`,
      folder: "logos",
    });

    const optimizedImage = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "512" },
      ],
    });

    // Create a new store and ensure the User row exists via connectOrCreate
    await prisma.store.create({
      data: {
        name,
        username,
        description,
        email,
        contact,
        address,
        logo: optimizedImage,
        // create &/or connect to the User relation:
        user: {
          connectOrCreate: {
            where: { id: userId },
            create: {
              id: userId,
              name: name,         
              email: email || "", 
              image: optimizedImage || "", 
            },
          },
        },
      },
    });

    return NextResponse.json({ message: "applied, waiting for approval" }, { status: 201 });
  } catch (error) {
    console.error("Create store error:", error);
    // Prisma errors sometimes put useful info in error.meta
    const msg = error?.code ? `${error.code} - ${error.message}` : error?.message || "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: { userId },
    });

    if (store) {
      return NextResponse.json({ status: store.status });
    }

    return NextResponse.json({ status: "Not registered" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error?.code || error?.message || "Server error" }, { status: 500 });
  }
}
