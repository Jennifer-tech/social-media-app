import prisma from "@/lib/prisma";

async function testUserCreation() {
    try {
        await prisma.$connect();
        console.log("Connected to Prisma DB");
        
        const newUser = await prisma.user.create({
            data: {
                id: "test123",
                username: "testuser",
                displayName: "Test User",
                email: "testuser@example.com",
                passwordHash: "hashedpassword",
            },
        });

        console.log("User created successfully:", newUser);
    } catch (error) {
        console.error("Error creating user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testUserCreation();
