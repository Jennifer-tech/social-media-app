import { validateRequest } from "@/auth.server";
import { redirect } from "next/navigation";

export default async function Layout({
    children,
} : {
    children: React.ReactNode;
}) {
    const { user } = await validateRequest();

    if(user) redirect("/");

    return <>{children}</>
}