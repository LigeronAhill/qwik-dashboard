import { component$ } from "@builder.io/qwik";
import { DocumentHead, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { Breadcrumbs } from "~/components/ui/invoices/breadcrumbs";
import { CreateForm } from "~/components/ui/invoices/create-form";
import { createInvoice } from "~/data/queries";

const FormSchema = z.object({
    id: z.string(),
    customerID: z.string(),
    amount: z.coerce.number().positive(),
    status: z.enum(["pending", "paid"]),
    date: z.string(),
});

const CreateInvoiceSchema = FormSchema.omit({ id: true, date: true });

export const useCreateInvoice = routeAction$(async (data, { redirect }) => {
    const amount = Math.round(data.amount * 100);
    data.amount = amount;
    await createInvoice(data);
    throw redirect(302, "/dashboard/invoices");
}, zod$(CreateInvoiceSchema));

export default component$(() => {
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    {
                        label: "Invoices",
                        href: "/dashboard/invoices",
                    },
                    {
                        label: "Create Invoice",
                        href: "/dashboard/invoices/create",
                        active: true,
                    },
                ]}
            />
            <CreateForm />
        </main>
    );
});
export const head: DocumentHead = {
    title: "Create Invoice",
    meta: [
        {
            name: "description",
            content: "Learning qwik with dashboard | Create Invoice",
        },
    ],
};
