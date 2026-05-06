import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getAllSettings, getSetting, setSetting, deleteSetting } from "../queries/settings";

export const settingRouter = createRouter({
  list: publicQuery.query(async () => {
    const rows = await getAllSettings();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }),

  get: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      return getSetting(input.key);
    }),

  set: adminQuery
    .input(
      z.object({
        key: z.string().min(1),
        value: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await setSetting(input.key, input.value, input.description);
      return { success: true };
    }),

  bulkSet: adminQuery
    .input(z.record(z.string(), z.string()))
    .mutation(async ({ input }) => {
      for (const [key, value] of Object.entries(input)) {
        await setSetting(key, value);
      }
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      await deleteSetting(input.key);
      return { success: true };
    }),
});
