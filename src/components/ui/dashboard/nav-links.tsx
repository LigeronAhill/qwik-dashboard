import { component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

import {
    HiDocumentDuplicateOutline,
    HiHomeOutline,
    HiUserGroupOutline,
} from "@qwikest/icons/heroicons";

const links = [
    { name: "Home", href: "/dashboard", icon: HiHomeOutline },
    {
        name: "Invoices",
        href: "/dashboard/invoices",
        icon: HiDocumentDuplicateOutline,
    },
    {
        name: "Customers",
        href: "/dashboard/customers",
        icon: HiUserGroupOutline,
    },
];

export const NavLinks = component$(() => {
    const location = useLocation();
    const url = location.url;
    const pathname = url.pathname.replace(/\/$/, "");
    console.log("pathname", pathname);
    return (
        <ul>
            {links.map((link) => {
                const LinkIcon = link.icon;
                return (
                    <li key={link.name}>
                        <Link
                            href={link.href}
                            class={`flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 font-medium text-sm hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3 ${pathname === link.href ? "bg-sky-100 text-blue-600" : ""}`}
                        >
                            <LinkIcon class="w-6" />
                            <p class="hidden md:block">{link.name}</p>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
});
