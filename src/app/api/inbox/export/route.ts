import { NextRequest, NextResponse } from "next/server";
import { isInboxAuthenticated } from "@/lib/auth";
import { getFeedbackStore } from "@/lib/storage";
import { FEEDBACK_STATUSES, type FeedbackItem } from "@/lib/types";

export const dynamic = "force-dynamic";

function escapeCsvCell(value: string | number | undefined): string {
  if (value === undefined || value === null) {
    return "";
  }
  let text = String(value);
  // Neutralize spreadsheet formula injection in Excel / Google Sheets.
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(items: FeedbackItem[]): string {
  const headers = [
    "referenceCode",
    "createdAt",
    "status",
    "rating",
    "category",
    "chapter",
    "locale",
    "message",
    "name",
    "email",
    "deviceInfo",
    "appVersion",
    "adminNote",
  ];

  const rows = items.map((item) =>
    [
      item.referenceCode,
      item.createdAt,
      item.status,
      item.rating,
      item.category,
      item.chapter,
      item.locale,
      item.message,
      item.name,
      item.email,
      item.deviceInfo,
      item.appVersion,
      item.adminNote,
    ]
      .map(escapeCsvCell)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\r\n");
}

export async function GET(request: NextRequest) {
  const authenticated = await isInboxAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "json" ? "json" : "csv";
  const statusFilter = searchParams.get("status");

  try {
    const store = getFeedbackStore();
    let items = await store.list();

    if (
      statusFilter &&
      (FEEDBACK_STATUSES as readonly string[]).includes(statusFilter)
    ) {
      items = items.filter((item) => item.status === statusFilter);
    }

    const dateStamp = new Date().toISOString().slice(0, 10);

    if (format === "json") {
      return new NextResponse(JSON.stringify(items, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="bebaduy-feedback-${dateStamp}.json"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // Prefix UTF-8 BOM so Indonesian / accented characters open cleanly in Excel.
    const csvBody = `\uFEFF${toCsv(items)}`;
    return new NextResponse(csvBody, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bebaduy-feedback-${dateStamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to export feedback:", error);
    return NextResponse.json(
      { error: "Unable to export feedback." },
      { status: 500 }
    );
  }
}
