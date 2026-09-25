import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "タスクボード",
  description: "未着手・進行中・完了の3列でタスクを管理するカンバン型タスクボード",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
