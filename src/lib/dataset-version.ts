import { queryOptions } from "@tanstack/react-query";
import { getLatestDataChange } from "./dataset-version.functions";

export const latestDataChangeQuery = queryOptions({ queryKey: ["latest-data-change"], queryFn: () => getLatestDataChange(), staleTime: 300_000 });
