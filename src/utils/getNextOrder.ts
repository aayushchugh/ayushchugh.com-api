import { CounterModel } from "@/db/schema/counter/counter.db";

export async function getNextOrder(type: string) {
  const counter = await CounterModel.findOneAndUpdate(
    { name: type },
    { $inc: { count: 1 } },
    { new: true, upsert: true },
  );

  return counter.count;
}
