import bcrypt from "bcrypt";
import { count, desc, eq, ilike, or, sql, sum } from "drizzle-orm";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InvoicesTable, LatestInvoice } from "~/lib/definitions";
import {
    customers,
    InsertCustomer,
    InsertInvoice,
    InsertUser,
    invoices,
    Revenue,
    revenue,
    SelectCustomer,
    SelectInvoice,
    SelectUser,
    schema,
    users,
} from "../schema";

// async function verifyPassword(password: string, hash: string): Promise<boolean> {
//       const isMatch = await bcrypt.compare(password, hash);
//         return isMatch;
//         }
// }

let repo: Repository | undefined = undefined;

export function initializeRepository(dbURL: string) {
    if (!repo) {
        repo = new Repository(dbURL);
    }
}

export function getRepository(): Repository {
    if (!repo) {
        throw new Error("Repository not initialized");
    }
    return repo;
}

export class Repository {
    db: NodePgDatabase<typeof schema> & { $client: Pool };
    constructor(dbURL: string) {
        const pool = new Pool({
            connectionString: dbURL,
        });
        this.db = drizzle({
            client: pool,
            casing: "snake_case",
            schema: schema,
        });
    }
    async close() {
        await this.db.$client.end();
    }
    async createUser(data: InsertUser): Promise<SelectUser> {
        try {
            const saltRounds = 10;
            const hash = await bcrypt.hash(data.password, saltRounds);
            data.password = hash;
            const [inserted] = await this.db
                .insert(users)
                .values(data)
                .onConflictDoNothing({ target: users.email })
                .returning();
            return inserted;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    async createInvoice(data: InsertInvoice): Promise<SelectInvoice> {
        try {
            const [inserted] = await this.db
                .insert(invoices)
                .values(data)
                .onConflictDoNothing({ target: invoices.id })
                .returning();
            return inserted;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    async createCustomer(data: InsertCustomer): Promise<SelectCustomer> {
        try {
            const [inserted] = await this.db
                .insert(customers)
                .values(data)
                .onConflictDoNothing({ target: customers.id })
                .returning();
            return inserted;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    async createRevenue(data: Revenue): Promise<Revenue> {
        try {
            const [inserted] = await this.db
                .insert(revenue)
                .values(data)
                .onConflictDoNothing({ target: revenue.month })
                .returning();
            return inserted;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    async fetchRevenue(): Promise<Revenue[]> {
        try {
            const revs = this.db.query.revenue.findMany();

            return revs;
        } catch (err) {
            console.error("Error fetching revenue:", err);
            throw new Error(
                "Failed to fetch revenue data:" + (err as Error).message,
            );
        }
    }
    async fetchLatestInvoices(): Promise<LatestInvoice[]> {
        try {
            const res = await this.db
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
    }
    async fetchCardData() {
        try {
            const [
                invoiceCountPromise,
                customerCountPromise,
                invoiceStatusPromise,
            ] = await Promise.all([
                // Количество счетов
                this.db
                    .select({ count: count() })
                    .from(invoices)
                    .then((result) => Number(result[0]?.count || 0)),

                // Количество клиентов
                this.db
                    .select({ count: count() })
                    .from(customers)
                    .then((result) => Number(result[0]?.count || 0)),

                // Суммы по статусам счетов
                this.db
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
    }
    async fetchFilteredInvoices(
        query: string,
        currentPage: number,
        itemsPerPage: number = 6,
    ): Promise<InvoicesTable[]> {
        try {
            const offset = (currentPage - 1) * itemsPerPage;
            const searchPattern = `%${query}%`;

            const result = await this.db
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
                .offset(offset);

            return result.map((inv) => ({
                ...inv,
                date: inv.date.toISOString(),
            }));
        } catch (error) {
            console.error("Database Error:", error);
            throw new Error("Failed to fetch invoices.");
        }
    }
    async fetchInvoicesPages(
        query: string,
        itemsPerPage: number = 6,
    ): Promise<{
        totalPages: number;
        totalItems: number;
        isEmpty: boolean;
    }> {
        try {
            const searchPattern = `%${query}%`;

            const [result] = await this.db
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
                );

            const totalItems = Number(result.count || 0);
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            // Защита от деления на 0
            const safeTotalPages = isNaN(totalPages) ? 0 : totalPages;

            return {
                totalPages: safeTotalPages,
                totalItems,
                isEmpty: totalItems === 0,
            };
        } catch (error) {
            console.error("Database Error:", error);
            throw new Error("Failed to fetch invoices.");
        }
    }
}
