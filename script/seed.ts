import { config } from "dotenv";
import { Repository } from "../drizzle/db";
import {
    customers,
    invoices,
    revenue,
    users,
} from "../src/lib/placeholder-data.js";

config({ path: ".env" });

const repo = new Repository(process.env.DATABASE_URL!);

async function seedUsers() {
    try {
        users.map(async (user) => {
            const created = await repo.createUser({
                name: user.name,
                email: user.email,
                password: user.password,
            });
            console.log("created user", created);
        });
    } catch (err) {
        console.error(err);
    }
}
async function seedInvoices() {
    try {
        for (const invoice of invoices) {
            let status: "pending" | "paid" = "pending";
            if (invoice.status === "paid") {
                status = "paid";
            }
            const created = await repo.createInvoice({
                customerID: invoice.customer_id,
                amount: invoice.amount,
                date: new Date(invoice.date),
                status: status,
            });
            console.log("created invoice", created);
        }
    } catch (err) {
        console.error(err);
    }
}
async function seedCustomers() {
    try {
        for (const customer of customers) {
            const created = await repo.createCustomer({
                id: customer.id,
                name: customer.name,
                email: customer.email,
                imageURL: customer.image_url,
            });
            console.log("created customer", created);
        }
    } catch (err) {
        console.error(err);
    }
}
async function seedRevenue() {
    try {
        revenue.map(async (rev) => {
            const created = await repo.createRevenue(rev);
            console.log("created revenue", created);
        });
    } catch (err) {
        console.error(err);
    }
}

await seedUsers();
await seedCustomers();
await seedInvoices();
await seedRevenue();
