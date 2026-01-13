import { $, type QRL, useSignal } from "@builder.io/qwik";

// // biome-ignore lint/suspicious/noExplicitAny: <debouncer>
// export const useDebouncer = (fn: QRL<(args: any) => void>, delay: number) => {
//     const timeoutId = useSignal<number>();

//     // biome-ignore lint/suspicious/noExplicitAny: <debouncer>
//     return $((args: any) => {
//         clearTimeout(timeoutId.value);
//         timeoutId.value = Number(setTimeout(() => fn(args), delay));
//     });
// };
export const useDebouncer = <A extends unknown[], R>(
    fn: QRL<(...args: A) => R>,
    delay: number,
): QRL<(...args: A) => void> => {
    const timeoutId = useSignal<number>();

    return $((...args: A): void => {
        window.clearTimeout(timeoutId.value);
        timeoutId.value = window.setTimeout((): void => {
            void fn(...args);
        }, delay);
    });
};
