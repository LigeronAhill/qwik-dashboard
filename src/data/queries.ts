import { server$ } from "@builder.io/qwik-city";
import { count, desc, eq, ilike, or, sql, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InvoicesTable, LatestInvoice } from "~/lib/definitions";
import { customers, invoices, Revenue, schema } from "../../drizzle/schema";

const getDB = server$(function () {
    const dbURL = this.env.get("DATABASE_URL");
    if (!dbURL)
        throw new Error("DATABASE_URL environment variable must be set!");
    const pool = new Pool({
        connectionString: dbURL,
        max: 20,
        idleTimeoutMillis: 30 * 1000,
    });
    return drizzle({
        client: pool,
        casing: "snake_case",
        schema: schema,
    });
});

export const fetchRevenue = server$(async function (): Promise<Revenue[]> {
    const db = await getDB();
    try {
        const revs = db.query.revenue.findMany();
        return revs;
    } catch (err) {
        console.error("Error fetching revenue:", err);
        throw new Error(
            "Failed to fetch revenue data:" + (err as Error).message,
        );
    }
});

export const fetchCardData = server$(async function (): Promise<{
    numberOfInvoices: number;
    numberOfCustomers: number;
    totalPaidInvoices: number;
    totalPendingInvoices: number;
}> {
    const db = await getDB();
    try {
        const [
            invoiceCountPromise,
            customerCountPromise,
            invoiceStatusPromise,
        ] = await Promise.all([
            // Количество счетов
            db
                .select({ count: count() })
                .from(invoices)
                .then((result) => Number(result[0]?.count || 0)),

            // Количество клиентов
            db
                .select({ count: count() })
                .from(customers)
                .then((result) => Number(result[0]?.count || 0)),

            // Суммы по статусам счетов
            db
                .select({
                    paid: sum(
                        sql<number>`CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.amount} ELSE 0 END`,
                    ),
                    pending: sum(
                        sql<number>`CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.amount} ELSE 0 END`,
                    ),
                })
                .from(invoices)
                .then((result) => ({
                    paid: Number(result[0]?.paid || 0),
                    pending: Number(result[0]?.pending || 0),
                })),
        ]);

        return {
            numberOfInvoices: invoiceCountPromise,
            numberOfCustomers: customerCountPromise,
            totalPaidInvoices: invoiceStatusPromise.paid,
            totalPendingInvoices: invoiceStatusPromise.pending,
        };
    } catch (error) {
        console.error("Error fetching card data:", error);
        throw new Error("Failed to fetch card data.");
    }
});

export const fetchLatestInvoices = server$(async function (): Promise<
    LatestInvoice[]
> {
    const db = await getDB();

    try {
        const res = await db
            .select({
                amount: invoices.amount,
                name: customers.name,
                image_url: customers.imageURL,
                email: customers.email,
                id: invoices.id,
            })
            .from(invoices)
            .leftJoin(customers, eq(invoices.customerID, customers.id))
            .orderBy(desc(invoices.date))
            .limit(5);

        return res.map((i) => ({
            ...i,
            email: i.email || "",
            image_url: i.image_url || "",
            name: i.name || "",
            amount: i.amount.toString(),
        }));
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch the latest invoices.");
    }
});

export const fetchFilteredInvoices = server$(async function (
    query: string,
    currentPage: number,
    itemsPerPage: number = 6,
): Promise<{
    table: InvoicesTable[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
}> {
    const db = await getDB();
    try {
        const offset = (currentPage - 1) * itemsPerPage;
        const searchPattern = `%${query}%`;

        const [countResult, dataResult] = await Promise.all([
            db
                .select({
                    count: count(),
                })
                .from(invoices)
                .innerJoin(customers, eq(invoices.customerID, customers.id))
                .where(
                    or(
                        ilike(customers.name, searchPattern),
                        ilike(customers.email, searchPattern),
                        ilike(sql`${invoices.amount}::text`, searchPattern),
                        ilike(sql`${invoices.date}::text`, searchPattern),
                        ilike(sql`${invoices.status}::text`, searchPattern),
                    ),
                ),
            db
                .select({
                    id: invoices.id,
                    customer_id: invoices.customerID,
                    name: customers.name,
                    email: customers.email,
                    image_url: customers.imageURL,
                    date: invoices.date,
                    amount: invoices.amount,
                    status: invoices.status,
                })
                .from(invoices)
                .innerJoin(customers, eq(invoices.customerID, customers.id))
                .where(
                    or(
                        ilike(customers.name, searchPattern),
                        ilike(customers.email, searchPattern),
                        ilike(sql`${invoices.amount}::text`, searchPattern),
                        ilike(sql`${invoices.date}::text`, searchPattern),
                        ilike(sql`${invoices.status}::text`, searchPattern),
                    ),
                )
                .orderBy(desc(invoices.date))
                .limit(itemsPerPage)
                .offset(offset),
        ]);

        const totalItems = Number(countResult[0]?.count || 0);
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const safeCurrentPage = Math.max(
            1,
            Math.min(currentPage, totalPages || 1),
        );

        return {
            table: dataResult.map((inv) => ({
                ...inv,
                date: inv.date.toISOString(),
            })),
            currentPage: safeCurrentPage,
            totalPages: totalPages,
            totalItems: totalItems,
        };
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch invoices.");
    }
});
