import { Brand } from "ts-brand";

export type SelectionId = Brand<string, "Selection">;

export interface Selection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  id: SelectionId;
}
