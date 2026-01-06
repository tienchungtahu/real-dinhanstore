import { NextResponse } from "next/server";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let extractedText = "";

        if (file.name.endsWith(".docx")) {
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            extractedText = XLSX.utils.sheet_to_csv(sheet);
        } else {
            return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
        }

        return NextResponse.json({ text: extractedText });
    } catch (error) {
        console.error("[PARSE_FILE]", error);
        return NextResponse.json({ error: "Failed to parse file" }, { status: 500 });
    }
}
