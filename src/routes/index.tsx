import { component$ } from "@builder.io/qwik";
import { type DocumentHead, Link } from "@builder.io/qwik-city";
import { HiArrowRightOutline } from "@qwikest/icons/heroicons";
import HeroImg from "~/assets/img/heroImg.png?jsx";
import HeroMobileImg from "~/assets/img/heroMobileImg.png?jsx";
import { LRDQwikLogo } from "~/assets/svg/LRDQwikLogo";
import style from "./home.module.css";

export default component$(() => {
    return (
        <main class="flex min-h-screen flex-col p-6">
            <div class="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
                <LRDQwikLogo />
            </div>
            <div class="mt-4 flex grow flex-col gap-4 md:flex-row">
                <div class="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
                    <div class={style.shape} />
                    <p class="lusitana text-gray-800 text-xl md:text-3xl md:leading-normal">
                        <strong>Welcome to LRDQwik.</strong> This is the example
                        for the{" "}
                        <Link
                            href="https://www.learn-qwik.com/learn/"
                            target="_blank"
                            class="text-blue-500"
                        >
                            Qwik Learn Course
                        </Link>
                        , brought to you by{" "}
                        <Link
                            href="https://www.lareponsedev.com/"
                            target="_blank"
                            class="text-blue-500"
                        >
                            LaReponseDev
                        </Link>{" "}
                        .
                    </p>
                    <Link
                        href="/login"
                        class="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 font-medium text-sm text-white transition-colors hover:bg-blue-400 md:text-base"
                    >
                        <span>Log in</span>
                        <HiArrowRightOutline />
                    </Link>
                    <Link
                        href="/dashboard"
                        class="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 font-medium text-sm text-white transition-colors hover:bg-blue-400 md:text-base"
                    >
                        <span>Temporary link</span>
                    </Link>
                </div>
                <div class="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
                    <HeroImg class="hidden md:block" />
                    <HeroMobileImg class="block md:hidden" />
                </div>
            </div>
        </main>
    );
});

export const head: DocumentHead = {
    title: "Welcome to LRDQwik",
    meta: [
        {
            name: "description",
            content: "Qwik site description",
        },
    ],
};
