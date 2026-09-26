export type EnterKeyEventLike = Pick<KeyboardEvent, "key" | "isComposing" | "keyCode">;

// IME 変換確定の Enter は送信しない。Safari では確定の keydown が compositionend の後に届き
// isComposing が false になるため、keyCode 229 も合わせて判定する
export function shouldSubmitOnEnter(event: EnterKeyEventLike): boolean {
  return event.key === "Enter" && !event.isComposing && event.keyCode !== 229;
}
