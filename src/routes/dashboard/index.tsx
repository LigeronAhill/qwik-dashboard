import { component$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import { CardsWrapper } from "~/components/ui/dashboard/cards";
import { LatestInvoices } from "~/components/ui/dashboard/latest-invoices";
import { RevenueChart } from "~/components/ui/dashboard/revenue-chart";

export default component$(() => {
    return (
        <main>
            <h1 class="lusitana mb-4 text-xl md:text-2xl">Dashboard</h1>
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <CardsWrapper />
            </div>
            <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <RevenueChart />
                <LatestInvoices />
            </div>
        </main>
    );
});
export const head: DocumentHead = {
    title: "Dashboard",
    meta: [
        {
            name: "description",
            content: "Learning qwik with dashboard",
        },
    ],
};
