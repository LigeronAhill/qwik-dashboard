import { component$, Resource, useResource$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { CreateInvoice } from "~/components/ui/invoices/buttons";
import { Pagination } from "~/components/ui/invoices/pagination";
import { Table } from "~/components/ui/invoices/table";
import { Search } from "~/components/ui/search";
import { InvoicesTableSkeleton } from "~/components/ui/skeletons";
import { fetchFilteredInvoices } from "~/data/queries";

export default component$(() => {
    const loc = useLocation();
    const filteredSig = useResource$(async ({ track, cleanup }) => {
        track(() => loc.url.search);

        const controller = new AbortController();
        cleanup(() => controller.abort());

        const searchParams = loc.url.searchParams;
        const q = searchParams.get("query") || "";
        const p = Math.max(1, Number(searchParams.get("page")) || 1);

        try {
            const data = await fetchFilteredInvoices(q, p);
            return data;
        } catch (error) {
            // 🔥 Обработка ошибок отмены запроса
            if (error instanceof Error && error.name === "AbortError") {
                console.log("Request was aborted");
                return null;
            }
            throw error;
        }
    });
    return (
        <div class="w-full">
            <div class="flex w-full items-center justify-between">
                <h1 class="lusitana text-2xl">Invoices</h1>
            </div>
            <div class="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search invoices..." />
                <CreateInvoice />
            </div>
            <Resource
                value={filteredSig}
                onPending={() => (
                    <>
                        <InvoicesTableSkeleton />
                        <div class="mt-5 flex w-full justify-center">
                            <div class="h-10 w-48 animate-pulse rounded bg-gray-200"></div>
                        </div>
                    </>
                )}
                onRejected={(error) => (
                    <div class="mt-6 rounded-lg bg-red-50 p-4">
                        <h3 class="font-medium text-red-800">
                            Error loading invoices
                        </h3>
                        <p class="text-red-700 text-sm">{error.message}</p>
                    </div>
                )}
                onResolved={(data) => {
                    if (!data || data.table.length === 0) {
                        return (
                            <div class="mt-6 rounded-lg bg-gray-50 p-8 text-center">
                                <h3 class="font-medium text-gray-900">
                                    No invoices found
                                </h3>
                                <p class="mt-2 text-gray-600">
                                    {loc.url.searchParams.get("query")
                                        ? `No results for "${loc.url.searchParams.get("query")}"`
                                        : "Try creating your first invoice!"}
                                </p>
                            </div>
                        );
                    }

                    return (
                        <>
                            <Table data={data.table} />
                            <div class="text-gray-500 text-xs">
                                Total: <span>{`${data.totalItems}`}</span>
                            </div>
                            <div class="mt-5 flex w-full justify-center">
                                <Pagination
                                    current_page={data.currentPage}
                                    total_pages={data.totalPages}
                                />
                            </div>
                        </>
                    );
                }}
            />
        </div>
    );
});
