import { component$, Resource, useResource$ } from "@builder.io/qwik";
import { routeAction$, useLocation, z, zod$ } from "@builder.io/qwik-city";
import { Breadcrumbs } from "~/components/ui/invoices/breadcrumbs";
import { EditInvoiceForm } from "~/components/ui/invoices/edit-form";
import {
    fetchCustomers,
    fetchInvoiceByID,
    updateInvoice,
} from "~/data/queries";

const FormSchema = z.object({
    id: z.string(),
    customerID: z.string(),
    amount: z.coerce.number().positive(),
    status: z.enum(["pending", "paid"]),
});
export const useUpdateInvoice = routeAction$(async (data, { redirect }) => {
    const amount = Math.round(data.amount * 100);
    data.amount = amount;
    await updateInvoice(data);
    throw redirect(302, `/dashboard/invoices`);
}, zod$(FormSchema));

export default component$(() => {
    const loc = useLocation();
    const id = loc.params.id;
    const dataComponentResource = useResource$(async () => {
        return await Promise.all([fetchInvoiceByID(id), fetchCustomers()]);
    });
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    {
                        label: "Invoices",
                        href: "/dashboard/invoices",
                    },
                    {
                        label: "Edit Invoice",
                        href: "/dashboard/invoices/[id]/edit",
                        active: true,
                    },
                ]}
            />
            <Resource
                value={dataComponentResource}
                onResolved={(data) => {
                    const [invoice, customers] = data;
                    if (!invoice) {
                        return <div>Invoice not found</div>;
                    }
                    return (
                        <EditInvoiceForm
                            invoice={invoice}
                            customers={customers}
                        />
                    );
                }}
                onPending={() => <div>Loading...</div>}
                onRejected={(error) => <div>Error: {error.message}</div>}
            />
        </main>
    );
});
