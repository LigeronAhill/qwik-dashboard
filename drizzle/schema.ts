import { relations } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";

export const users = p.pgTable("users", {
    id: p.uuid().primaryKey().defaultRandom(),
    name: p.varchar({ length: 255 }).notNull(),
    email: p.varchar({ length: 255 }).notNull().unique(),
    password: p.text().notNull(),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const invoiceStatusEnum = p.pgEnum("status", ["paid", "pending"]);

export const customers = p.pgTable("customers", {
    id: p.uuid().primaryKey().defaultRandom(),
    name: p.varchar({ length: 255 }).notNull(),
    email: p.varchar({ length: 255 }).notNull().unique(),
    imageURL: p.varchar("image_url", { length: 255 }).notNull(),
});
export type InsertCustomer = typeof customers.$inferInsert;
export type SelectCustomer = typeof customers.$inferSelect;

export const invoices = p.pgTable("invoices", {
    id: p.uuid().primaryKey().defaultRandom(),
    customerID: p
        .uuid("customer_id")
        .notNull()
        .references(() => customers.id, { onDelete: "cascade" }),
    amount: p.integer().notNull(),
    status: invoiceStatusEnum().notNull().default("pending"),
    date: p.timestamp().notNull().defaultNow(),
});
export type InsertInvoice = typeof invoices.$inferInsert;
export type SelectInvoice = typeof invoices.$inferSelect;

export const revenue = p.pgTable("revenue", {
    month: p.varchar({ length: 4 }).notNull().unique(),
    revenue: p.integer().notNull(),
});
export type Revenue = typeof revenue.$inferInsert;

export const customersRelations = relations(customers, ({ many }) => ({
    // Один клиент может иметь много счетов
    invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
    // Один счет принадлежит одному клиенту
    customer: one(customers, {
        fields: [invoices.customerID],
        references: [customers.id],
    }),
}));

export const relationsSchema = {
    customers: customersRelations,
    invoices: invoicesRelations,
};

export const schema = {
    users,
    customers,
    invoices,
    revenue,
    customersRelations,
    invoicesRelations,
};
