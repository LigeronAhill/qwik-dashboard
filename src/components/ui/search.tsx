import { $, component$, useSignal } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { HiMagnifyingGlassOutline } from "@qwikest/icons/heroicons";
import { useDebouncer } from "~/hooks/debouncer";

export const Search = component$(({ placeholder }: { placeholder: string }) => {
    const loc = useLocation();
    const nav = useNavigate();
    const searchParams = loc.url.searchParams;
    const inputValue = useSignal(searchParams.get("query") || "");

    const debounce = useDebouncer(
        $((value: string) => {
            const params = new URLSearchParams(searchParams);
            params.set("page", "1"); // Сбрасываем на первую страницу

            if (value.trim()) {
                params.set("query", value);
            } else {
                params.delete("query");
            }

            nav(`${loc.url.pathname}?${params.toString()}`, {
                replaceState: true,
                scroll: false,
            });
        }),
        300,
    );

    return (
        <form
            action="/dashboard/invoices"
            class="relative flex flex-1 flex-shrink-0"
            preventdefault:submit
        >
            <label for="search" class="sr-only">
                Search
            </label>
            <input
                name="query"
                class="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                placeholder={placeholder}
                onInput$={(_, target) => {
                    debounce(target.value);
                }}
                value={inputValue.value}
            />
            <HiMagnifyingGlassOutline class="absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
        </form>
    );
});
