import { component$, Resource, useResource$ } from "@builder.io/qwik";
import { HiCalendarOutline } from "@qwikest/icons/heroicons";
import { fetchRevenue } from "~/data/queries";
import { generateYAxis } from "~/lib/utils";
import { RevenueChartSkeleton } from "../skeletons";

// This component is representational only.
// For data visualization UI, check out:
// https://www.tremor.so/
// https://www.chartjs.org/
// https://airbnb.io/visx/
export const RevenueChart = component$(() => {
    const revenueResource = useResource$(async ({ cleanup }) => {
        const controller = new AbortController();
        cleanup(() => controller.abort());
        const revenue = await fetchRevenue();
        return { revenue };
    });

    return (
        <Resource
            value={revenueResource}
            onResolved={({ revenue }) => {
                const chartHeight = 350;
                const { yAxisLabels, topLabel } = generateYAxis(revenue);

                if (revenue.length === 0) {
                    return <p class="mt-4 text-gray-400">No data available.</p>;
                }
                return (
                    <div class="w-full md:col-span-4">
                        <h2 class="lusitana mb-4 text-xl md:text-2xl">
                            Recent Revenue
                        </h2>

                        <div class="rounded-xl bg-gray-50 p-4">
                            <div class="mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 sm:grid-cols-13 md:gap-4">
                                <div
                                    class="mb-6 hidden flex-col justify-between text-gray-400 text-sm sm:flex"
                                    style={{ height: `${chartHeight}px` }}
                                >
                                    {yAxisLabels.map((label) => (
                                        <p key={label}>{label}</p>
                                    ))}
                                </div>

                                {revenue.map((month) => (
                                    <div
                                        key={month.month}
                                        class="flex flex-col items-center gap-2"
                                    >
                                        <div
                                            class="w-full rounded-md bg-blue-300"
                                            style={{
                                                height: `${(chartHeight / topLabel) * month.revenue}px`,
                                            }}
                                        ></div>
                                        <p class="-rotate-90 text-gray-400 text-sm sm:rotate-0">
                                            {month.month}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div class="flex items-center pt-6 pb-2">
                                <HiCalendarOutline class="h-5 w-5 text-gray-500" />
                                <h3 class="ml-2 text-gray-500 text-sm">
                                    Last 12 months
                                </h3>
                            </div>
                        </div>
                    </div>
                );
            }}
            onRejected={(error) => {
                return <div>Error: {error.message}</div>;
            }}
            onPending={() => {
                return <RevenueChartSkeleton />;
            }}
        />
    );
});
