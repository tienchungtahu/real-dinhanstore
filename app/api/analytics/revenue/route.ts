import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// UTC+7 offset in milliseconds
const VN_OFFSET = 7 * 60 * 60 * 1000;

// Get current time in Vietnam (UTC+7)
function getNowVN(): Date {
  return new Date(Date.now() + VN_OFFSET);
}

// Create a date in Vietnam timezone and convert to UTC for DB query
function createDateVN(year: number, month: number, day: number, hours = 0, minutes = 0, seconds = 0): Date {
  // Create date as if in Vietnam timezone
  const vnDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
  // Subtract 7 hours to convert to UTC (since DB stores UTC)
  return new Date(vnDate.getTime() - VN_OFFSET);
}

// Format a UTC date to Vietnam date string (YYYY-MM-DD)
function formatDateVN(utcDate: Date): string {
  const vnDate = new Date(utcDate.getTime() + VN_OFFSET);
  const year = vnDate.getUTCFullYear();
  const month = String(vnDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(vnDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7days";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const monthParam = searchParams.get("month");

    const nowVN = getNowVN();
    const todayYear = nowVN.getUTCFullYear();
    const todayMonth = nowVN.getUTCMonth();
    const todayDay = nowVN.getUTCDate();

    let fromDate: Date;
    let toDate: Date;

    switch (period) {
      case "today":
        fromDate = createDateVN(todayYear, todayMonth, todayDay, 0, 0, 0);
        toDate = createDateVN(todayYear, todayMonth, todayDay, 23, 59, 59);
        break;
      case "yesterday":
        fromDate = createDateVN(todayYear, todayMonth, todayDay - 1, 0, 0, 0);
        toDate = createDateVN(todayYear, todayMonth, todayDay - 1, 23, 59, 59);
        break;
      case "3days":
        fromDate = createDateVN(todayYear, todayMonth, todayDay - 2, 0, 0, 0);
        toDate = createDateVN(todayYear, todayMonth, todayDay, 23, 59, 59);
        break;
      case "7days":
        fromDate = createDateVN(todayYear, todayMonth, todayDay - 6, 0, 0, 0);
        toDate = createDateVN(todayYear, todayMonth, todayDay, 23, 59, 59);
        break;
      case "custom":
        if (!startDateParam || !endDateParam) {
          return NextResponse.json({ error: "startDate and endDate required" }, { status: 400 });
        }
        const [sYear, sMonth, sDay] = startDateParam.split("-").map(Number);
        const [eYear, eMonth, eDay] = endDateParam.split("-").map(Number);
        fromDate = createDateVN(sYear, sMonth - 1, sDay, 0, 0, 0);
        toDate = createDateVN(eYear, eMonth - 1, eDay, 23, 59, 59);
        break;
      case "month":
        if (!monthParam) {
          return NextResponse.json({ error: "month required (YYYY-MM format)" }, { status: 400 });
        }
        const [year, mon] = monthParam.split("-").map(Number);
        fromDate = createDateVN(year, mon - 1, 1, 0, 0, 0);
        const lastDay = new Date(year, mon, 0).getDate();
        toDate = createDateVN(year, mon - 1, lastDay, 23, 59, 59);
        break;
      default:
        fromDate = createDateVN(todayYear, todayMonth, todayDay - 6, 0, 0, 0);
        toDate = createDateVN(todayYear, todayMonth, todayDay, 23, 59, 59);
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        status: { not: "cancelled" },
      },
      orderBy: { createdAt: "asc" },
    });

    // Generate all dates in range
    const revenueByDate: Record<string, { date: string; revenue: number; orders: number }> = {};
    const currentDate = new Date(fromDate);
    
    while (currentDate <= toDate) {
      const dateKey = formatDateVN(currentDate);
      revenueByDate[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate orders by date
    orders.forEach((order) => {
      const dateKey = formatDateVN(new Date(order.createdAt));
      if (revenueByDate[dateKey]) {
        revenueByDate[dateKey].revenue += Number(order.total);
        revenueByDate[dateKey].orders += 1;
      }
    });

    const chartData = Object.values(revenueByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return NextResponse.json({
      period,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
      chartData,
      summary: { totalRevenue, totalOrders, avgOrderValue },
    });
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
