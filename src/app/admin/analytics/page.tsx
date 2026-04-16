"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatCard from "@/components/admin/StatCard";
import PieChart from "@/components/admin/PieChart";
import HorizontalBarChart from "@/components/admin/HorizontalBarChart";
import BarChart from "@/components/admin/BarChart";
import FunnelChart from "@/components/admin/FunnelChart";
import LineChart from "@/components/admin/LineChart";
import DataTable from "@/components/admin/DataTable";
import DateRangePicker from "@/components/admin/DateRangePicker";
import {
  getSummaryCards,
  getMostViewed,
  getConversionFunnel,
  getDailyRevenue,
  getTopCustomers,
  getRevenueByCategory,
  getRevenueByZone,
  getNetRevenue,
  getTopProductsByRevenue,
  getTopColors,
  getTopSizes,
  getOrderStatusBreakdown,
  getReturnRate,
  getAOVTrend,
  getNewVsReturning,
  getCustomerByGovernorate,
  getShippingSettlement,
} from "@/services/analytics";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function pct(current: number, previous: number): number | undefined {
  if (previous === 0) return current > 0 ? 100 : undefined;
  return Math.round(((current - previous) / previous) * 100);
}

function dateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function previousRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  prevEnd.setHours(23, 59, 59, 999);
  const prevStart = new Date(prevEnd.getTime() - diff);
  prevStart.setHours(0, 0, 0, 0);
  return { start: prevStart, end: prevEnd };
}

/* ------------------------------------------------------------------ */
/*  Color constants                                                    */
/* ------------------------------------------------------------------ */

const CATEGORY_COLORS = ["#2563eb", "#7c3aed", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#f43f5e", "#14b8a6"];

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#6366f1",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  partially_returned: "#f97316",
  returned: "#f43f5e",
  exchanged: "#14b8a6",
};

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

type Tab = "overview" | "revenue" | "products" | "orders" | "customers" | "shipping" | "zones" | "funnel";

const TABS: { key: Tab; label: string; icon: string }[] = [
  {
    key: "overview",
    label: "Overview",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4",
  },
  {
    key: "revenue",
    label: "Revenue",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    key: "products",
    label: "Products",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    key: "orders",
    label: "Orders",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    key: "customers",
    label: "Customers",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    key: "shipping",
    label: "Shipping",
    icon: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0",
  },
  {
    key: "zones",
    label: "Zones",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    key: "funnel",
    label: "Funnel",
    icon: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
  },
];

/* ------------------------------------------------------------------ */
/*  Skeleton placeholder                                               */
/* ------------------------------------------------------------------ */

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-nino-100/30 rounded-lg animate-pulse ${className}`} />;
}

function ChartCard({
  title,
  loading,
  children,
}: {
  title: string;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-nino-200/20 p-6">
      <h3 className="font-[var(--font-display)] text-sm font-semibold tracking-[0.1em] text-nino-800/40 mb-5">
        {title}
      </h3>
      {loading ? <Skeleton className="h-48" /> : children}
    </div>
  );
}

function EmptyState({ message = "No data yet" }: { message?: string }) {
  return (
    <div className="h-32 flex items-center justify-center text-nino-800/20 text-sm font-[var(--font-display)]">
      {message}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function AnalyticsPage() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [startDate, setStartDate] = useState(formatDate(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  /* ---- Tab data state ---- */

  // Overview
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewData, setOverviewData] = useState<{
    ordersToday: number;
    revenueToday: number;
    viewsToday: number;
    conversionRate: number;
    aov: number;
    returnRate: number;
    newCustomers: number;
    repeatCustomers: number;
    ordersTrend?: number;
    revenueTrend?: number;
    aovTrend?: number;
    viewsTrend?: number;
    conversionTrend?: number;
    returnTrend?: number;
    newCustTrend?: number;
    repeatCustTrend?: number;
    revenueTimeline: { date: string; value: number }[];
    orderTimeline: { date: string; value: number }[];
  } | null>(null);

  // Revenue
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueData, setRevenueData] = useState<{
    gross: number;
    returns: number;
    fees: number;
    net: number;
    byCategory: { label: string; value: number; color: string }[];
    byZone: { label: string; value: number }[];
  } | null>(null);

  // Products
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsData, setProductsData] = useState<{
    topByRevenue: { label: string; value: number }[];
    topByUnits: { label: string; value: number }[];
    mostViewed: { label: string; value: number }[];
    topColors: { label: string; value: number; color?: string }[];
    topSizes: { label: string; value: number }[];
  } | null>(null);

  // Orders
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersData, setOrdersData] = useState<{
    statusBreakdown: { label: string; value: number; color: string }[];
    ordersPerDay: { date: string; value: number }[];
    aovTrend: { date: string; value: number }[];
    returnRate: number;
  } | null>(null);

  // Customers
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersData, setCustomersData] = useState<{
    newVsReturning: { label: string; value: number; color: string }[];
    topCustomers: { name: string; phone: string; totalSpent: number; orderCount: number }[];
    byGovernorate: { label: string; value: number }[];
  } | null>(null);

  // Shipping
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingData, setShippingData] = useState<{
    settlement: {
      company: string;
      ordersShipped: number;
      feesCollected: number;
      storePaid: number;
      customerPaid: number;
      netSettlement: number;
    }[];
    volumeByCompany: { label: string; value: number }[];
  } | null>(null);

  // Zones
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zonesData, setZonesData] = useState<{
    ordersByZone: { label: string; value: number }[];
    revenueByZone: { label: string; value: number }[];
  } | null>(null);

  // Funnel
  const [funnelLoading, setFunnelLoading] = useState(false);
  const [funnelData, setFunnelData] = useState<{
    stages: { stage: string; count: number; percentage: number }[];
    cartAbandonment: number;
  } | null>(null);

  /* ---- Data loaders ---- */

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const { start, end } = dateRange(startDate, endDate);
      const prev = previousRange(startDate, endDate);

      const [summary, prevSummary, dailyRev, newVsRet, prevNewVsRet, retRate, prevRetRate] =
        await Promise.all([
          getSummaryCards(today),
          getSummaryCards(prev.end),
          getDailyRevenue(start, end),
          getNewVsReturning(start, end),
          getNewVsReturning(prev.start, prev.end),
          getReturnRate(start, end),
          getReturnRate(prev.start, prev.end),
        ]);

      const aov = summary.ordersToday > 0 ? Math.round(summary.revenueToday / summary.ordersToday) : 0;
      const prevAov = prevSummary.ordersToday > 0 ? Math.round(prevSummary.revenueToday / prevSummary.ordersToday) : 0;

      // Build order timeline from daily revenue (one entry per day)
      // For order count, we reuse daily revenue dates and derive from funnel or summary
      // We'll approximate with daily revenue structure
      const revenueTimeline = dailyRev.map((d) => ({ date: d.date, value: d.revenue }));

      setOverviewData({
        ordersToday: summary.ordersToday,
        revenueToday: summary.revenueToday,
        viewsToday: summary.viewsToday,
        conversionRate: summary.conversionRate,
        aov,
        returnRate: retRate as number,
        newCustomers: (newVsRet as { newCustomers: number; returningCustomers: number }).newCustomers,
        repeatCustomers: (newVsRet as { newCustomers: number; returningCustomers: number }).returningCustomers,
        ordersTrend: pct(summary.ordersToday, prevSummary.ordersToday),
        revenueTrend: pct(summary.revenueToday, prevSummary.revenueToday),
        aovTrend: pct(aov, prevAov),
        viewsTrend: pct(summary.viewsToday, prevSummary.viewsToday),
        conversionTrend: pct(summary.conversionRate, prevSummary.conversionRate),
        returnTrend: pct(retRate as number, prevRetRate as number),
        newCustTrend: pct(
          (newVsRet as { newCustomers: number; returningCustomers: number }).newCustomers,
          (prevNewVsRet as { newCustomers: number; returningCustomers: number }).newCustomers
        ),
        repeatCustTrend: pct(
          (newVsRet as { newCustomers: number; returningCustomers: number }).returningCustomers,
          (prevNewVsRet as { newCustomers: number; returningCustomers: number }).returningCustomers
        ),
        revenueTimeline,
        orderTimeline: revenueTimeline, // Will use order-count data when available
      });
    } catch (err) {
      console.error("Failed to load overview:", err);
    } finally {
      setOverviewLoading(false);
    }
  }, [startDate, endDate]);

  const loadRevenue = useCallback(async () => {
    setRevenueLoading(true);
    try {
      const { start, end } = dateRange(startDate, endDate);
      const [netRev, byCat, byZone] = await Promise.all([
        getNetRevenue(start, end),
        getRevenueByCategory(start, end),
        getRevenueByZone(start, end),
      ]);

      const net = netRev as { gross: number; returns: number; fees: number; net: number };
      const catData = (byCat as { category: string; revenue: number }[]).map((c, i) => ({
        label: c.category,
        value: c.revenue,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }));
      const zoneData = (byZone as { zone: string; revenue: number }[]).map((z) => ({
        label: z.zone,
        value: z.revenue,
      }));

      setRevenueData({
        gross: net.gross,
        returns: net.returns,
        fees: net.fees,
        net: net.net,
        byCategory: catData,
        byZone: zoneData,
      });
    } catch (err) {
      console.error("Failed to load revenue:", err);
    } finally {
      setRevenueLoading(false);
    }
  }, [startDate, endDate]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const { start, end } = dateRange(startDate, endDate);
      const [topRev, viewed, colors, sizes] = await Promise.all([
        getTopProductsByRevenue(start, end),
        getMostViewed(start, end),
        getTopColors(start, end),
        getTopSizes(start, end),
      ]);

      const revProducts = (topRev as { productName: string; revenue: number; unitsSold: number }[]);

      setProductsData({
        topByRevenue: revProducts.map((p) => ({ label: p.productName, value: p.revenue })),
        topByUnits: revProducts.map((p) => ({ label: p.productName, value: p.unitsSold })),
        mostViewed: viewed.map((v) => ({ label: v.productName, value: v.viewCount })),
        topColors: (colors as { color: string; count: number; hex?: string }[]).map((c) => ({
          label: c.color,
          value: c.count,
          color: c.hex,
        })),
        topSizes: (sizes as { size: string; count: number }[]).map((s) => ({
          label: s.size,
          value: s.count,
        })),
      });
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setProductsLoading(false);
    }
  }, [startDate, endDate]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const { start, end } = dateRange(startDate, endDate);
      const [statusBk, dailyRev, aovData, retRate] = await Promise.all([
        getOrderStatusBreakdown(start, end),
        getDailyRevenue(start, end),
        getAOVTrend(start, end),
        getReturnRate(start, end),
      ]);

      const statusData = (statusBk as { status: string; count: number }[]).map((s) => ({
        label: s.status,
        value: s.count,
        color: STATUS_COLORS[s.status] ?? "#94a3b8",
      }));

      setOrdersData({
        statusBreakdown: statusData,
        ordersPerDay: dailyRev.map((d) => ({ date: d.date, value: d.revenue })),
        aovTrend: (aovData as { date: string; aov: number }[]).map((a) => ({
          date: a.date,
          value: a.aov,
        })),
        returnRate: retRate as number,
      });
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, [startDate, endDate]);

  const loadCustomers = useCallback(async () => {
    setCustomersLoading(true);
    try {
      const { start, end } = dateRange(startDate, endDate);
      const [newVsRet, topCust, byGov] = await Promise.all([
        getNewVsReturning(start, end),
        getTopCustomers(start, end),
        getCustomerByGovernorate(start, end),
      ]);

      const nvr = newVsRet as { newCustomers: number; returningCustomers: number };

      setCustomersData({
        newVsReturning: [
          { label: "New Customers", value: nvr.newCustomers, color: "#2563eb" },
          { label: "Returning", value: nvr.returningCustomers, color: "#7c3aed" },
        ],
        topCustomers: topCust,
        byGovernorate: (byGov as { governorate: string; count: number }[]).map((g) => ({
          label: g.governorate,
          value: g.count,
        })),
      });
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setCustomersLoading(false);
    }
  }, [startDate, endDate]);

  const loadShipping = useCallback(async () => {
    setShippingLoading(true);
    try {
      const { start, end } = dateRange(startDate, endDate);
      const settlement = await getShippingSettlement(start, end);
      const data = settlement as {
        company: string;
        ordersShipped: number;
        feesCollected: number;
        storePaid: number;
        customerPaid: number;
        netSettlement: number;
      }[];

      setShippingData({
        settlement: data,
        volumeByCompany: data.map((d) => ({ label: d.company, value: d.ordersShipped })),
      });
    } catch (err) {
      console.error("Failed to load shipping:", err);
    } finally {
      setShippingLoading(false);
    }
  }, [startDate, endDate]);

  const loadZones = useCallback(async () => {
    setZonesLoading(true);
    try {
      const { start, end } = dateRange(startDate, endDate);
      const byZone = await getRevenueByZone(start, end);
      const zoneData = (byZone as { zone: string; revenue: number; orderCount: number }[]);

      setZonesData({
        ordersByZone: zoneData.map((z) => ({ label: z.zone, value: z.orderCount ?? 0 })),
        revenueByZone: zoneData.map((z) => ({ label: z.zone, value: z.revenue })),
      });
    } catch (err) {
      console.error("Failed to load zones:", err);
    } finally {
      setZonesLoading(false);
    }
  }, [startDate, endDate]);

  const loadFunnel = useCallback(async () => {
    setFunnelLoading(true);
    try {
      const { start, end } = dateRange(startDate, endDate);
      const stages = await getConversionFunnel(start, end);

      const addToCart = stages.find((s) => s.stage === "Add to Cart")?.count ?? 0;
      const orders = stages.find((s) => s.stage === "Orders Placed")?.count ?? 0;

      setFunnelData({
        stages,
        cartAbandonment: Math.max(0, addToCart - orders),
      });
    } catch (err) {
      console.error("Failed to load funnel:", err);
    } finally {
      setFunnelLoading(false);
    }
  }, [startDate, endDate]);

  /* ---- Lazy loading per tab ---- */

  useEffect(() => {
    switch (activeTab) {
      case "overview":
        loadOverview();
        break;
      case "revenue":
        loadRevenue();
        break;
      case "products":
        loadProducts();
        break;
      case "orders":
        loadOrders();
        break;
      case "customers":
        loadCustomers();
        break;
      case "shipping":
        loadShipping();
        break;
      case "zones":
        loadZones();
        break;
      case "funnel":
        loadFunnel();
        break;
    }
  }, [
    activeTab,
    startDate,
    endDate,
    loadOverview,
    loadRevenue,
    loadProducts,
    loadOrders,
    loadCustomers,
    loadShipping,
    loadZones,
    loadFunnel,
  ]);

  /* ---- Tab renderers ---- */

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 8 StatCards in 2x4 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Orders"
          value={overviewData?.ordersToday ?? 0}
          trend={overviewData?.ordersTrend}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
        <StatCard
          label="Revenue"
          value={overviewData?.revenueToday ?? 0}
          trend={overviewData?.revenueTrend}
          prefix=""
          suffix=" EGP"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v1"
        />
        <StatCard
          label="AOV"
          value={overviewData?.aov ?? 0}
          trend={overviewData?.aovTrend}
          suffix=" EGP"
          icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
        <StatCard
          label="Views"
          value={overviewData?.viewsToday ?? 0}
          trend={overviewData?.viewsTrend}
          icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
        <StatCard
          label="Conversion Rate"
          value={overviewData?.conversionRate ?? 0}
          trend={overviewData?.conversionTrend}
          suffix="%"
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
        <StatCard
          label="Return Rate"
          value={overviewData?.returnRate ?? 0}
          trend={overviewData?.returnTrend}
          suffix="%"
          icon="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
        />
        <StatCard
          label="New Customers"
          value={overviewData?.newCustomers ?? 0}
          trend={overviewData?.newCustTrend}
          icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
        <StatCard
          label="Repeat Customers"
          value={overviewData?.repeatCustomers ?? 0}
          trend={overviewData?.repeatCustTrend}
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </div>

      {/* Revenue & Order timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="REVENUE TIMELINE (EGP)" loading={overviewLoading}>
          {overviewData?.revenueTimeline.length ? (
            <LineChart data={overviewData.revenueTimeline} label="Revenue" />
          ) : (
            <EmptyState message="No revenue data yet" />
          )}
        </ChartCard>
        <ChartCard title="ORDER COUNT TIMELINE" loading={overviewLoading}>
          {overviewData?.orderTimeline.length ? (
            <LineChart data={overviewData.orderTimeline} label="Orders" />
          ) : (
            <EmptyState message="No order data yet" />
          )}
        </ChartCard>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      {/* Net Revenue breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Gross Revenue"
          value={revenueData?.gross ?? 0}
          suffix=" EGP"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v1"
        />
        <StatCard
          label="Returns"
          value={revenueData?.returns ?? 0}
          suffix=" EGP"
          icon="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
        />
        <StatCard
          label="Store Fees"
          value={revenueData?.fees ?? 0}
          suffix=" EGP"
          icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
        <StatCard
          label="Net Revenue"
          value={revenueData?.net ?? 0}
          suffix=" EGP"
          icon="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="REVENUE BY CATEGORY" loading={revenueLoading}>
          {revenueData?.byCategory.length ? (
            <PieChart data={revenueData.byCategory} />
          ) : (
            <EmptyState message="No category data yet" />
          )}
        </ChartCard>
        <ChartCard title="REVENUE BY ZONE" loading={revenueLoading}>
          {revenueData?.byZone.length ? (
            <HorizontalBarChart data={revenueData.byZone} valueSuffix=" EGP" />
          ) : (
            <EmptyState message="No zone data yet" />
          )}
        </ChartCard>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="TOP 10 BY REVENUE" loading={productsLoading}>
          {productsData?.topByRevenue.length ? (
            <HorizontalBarChart data={productsData.topByRevenue} valueSuffix=" EGP" />
          ) : (
            <EmptyState message="No revenue data yet" />
          )}
        </ChartCard>
        <ChartCard title="TOP 10 BY UNITS SOLD" loading={productsLoading}>
          {productsData?.topByUnits.length ? (
            <HorizontalBarChart data={productsData.topByUnits} />
          ) : (
            <EmptyState message="No unit data yet" />
          )}
        </ChartCard>
      </div>

      <ChartCard title="MOST VIEWED PRODUCTS" loading={productsLoading}>
        {productsData?.mostViewed.length ? (
          <BarChart data={productsData.mostViewed} />
        ) : (
          <EmptyState message="No view data yet" />
        )}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="TOP COLORS" loading={productsLoading}>
          {productsData?.topColors.length ? (
            <HorizontalBarChart data={productsData.topColors} />
          ) : (
            <EmptyState message="No color data yet" />
          )}
        </ChartCard>
        <ChartCard title="TOP SIZES" loading={productsLoading}>
          {productsData?.topSizes.length ? (
            <BarChart data={productsData.topSizes} />
          ) : (
            <EmptyState message="No size data yet" />
          )}
        </ChartCard>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="ORDER STATUS DISTRIBUTION" loading={ordersLoading}>
          {ordersData?.statusBreakdown.length ? (
            <PieChart data={ordersData.statusBreakdown} />
          ) : (
            <EmptyState message="No order data yet" />
          )}
        </ChartCard>
        <div className="bg-white rounded-xl border border-nino-200/20 p-6 flex items-center justify-center">
          {ordersLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <StatCard
              label="Return Rate"
              value={ordersData?.returnRate ?? 0}
              suffix="%"
              icon="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="ORDERS PER DAY" loading={ordersLoading}>
          {ordersData?.ordersPerDay.length ? (
            <LineChart data={ordersData.ordersPerDay} label="Orders" />
          ) : (
            <EmptyState message="No order data yet" />
          )}
        </ChartCard>
        <ChartCard title="AOV TREND (EGP)" loading={ordersLoading}>
          {ordersData?.aovTrend.length ? (
            <LineChart data={ordersData.aovTrend} label="AOV" />
          ) : (
            <EmptyState message="No AOV data yet" />
          )}
        </ChartCard>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="NEW VS RETURNING CUSTOMERS" loading={customersLoading}>
          {customersData?.newVsReturning.some((d) => d.value > 0) ? (
            <PieChart data={customersData.newVsReturning} />
          ) : (
            <EmptyState message="No customer data yet" />
          )}
        </ChartCard>
        <ChartCard title="CUSTOMERS BY GOVERNORATE" loading={customersLoading}>
          {customersData?.byGovernorate.length ? (
            <HorizontalBarChart data={customersData.byGovernorate} />
          ) : (
            <EmptyState message="No governorate data yet" />
          )}
        </ChartCard>
      </div>

      <ChartCard title="TOP 20 CUSTOMERS" loading={customersLoading}>
        {customersData?.topCustomers.length ? (
          <DataTable
            columns={[
              { key: "name", label: "Customer" },
              { key: "phone", label: "Phone" },
              { key: "totalSpent", label: "Spent (EGP)", align: "right" },
              { key: "orderCount", label: "Orders", align: "right" },
            ]}
            data={customersData.topCustomers}
            exportable
            exportFilename="top-customers"
          />
        ) : (
          <EmptyState message="No customer data yet" />
        )}
      </ChartCard>
    </div>
  );

  const renderShipping = () => (
    <div className="space-y-6">
      <ChartCard title="SETTLEMENT REPORT" loading={shippingLoading}>
        {shippingData?.settlement.length ? (
          <DataTable
            columns={[
              { key: "company", label: "Company" },
              { key: "ordersShipped", label: "Orders Shipped", align: "right" },
              { key: "feesCollected", label: "Fees Collected (EGP)", align: "right" },
              { key: "storePaid", label: "Store Paid (EGP)", align: "right" },
              { key: "customerPaid", label: "Customer Paid (EGP)", align: "right" },
              { key: "netSettlement", label: "Net Settlement (EGP)", align: "right" },
            ]}
            data={shippingData.settlement}
            exportable
            exportFilename="shipping-settlement"
          />
        ) : (
          <EmptyState message="No shipping data yet" />
        )}
      </ChartCard>

      <ChartCard title="VOLUME BY COMPANY" loading={shippingLoading}>
        {shippingData?.volumeByCompany.length ? (
          <BarChart data={shippingData.volumeByCompany} />
        ) : (
          <EmptyState message="No shipping data yet" />
        )}
      </ChartCard>
    </div>
  );

  const renderZones = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="ORDERS BY ZONE" loading={zonesLoading}>
          {zonesData?.ordersByZone.length ? (
            <BarChart data={zonesData.ordersByZone} />
          ) : (
            <EmptyState message="No zone data yet" />
          )}
        </ChartCard>
        <ChartCard title="REVENUE BY ZONE" loading={zonesLoading}>
          {zonesData?.revenueByZone.length ? (
            <HorizontalBarChart data={zonesData.revenueByZone} valueSuffix=" EGP" />
          ) : (
            <EmptyState message="No zone data yet" />
          )}
        </ChartCard>
      </div>
    </div>
  );

  const renderFunnel = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="CONVERSION FUNNEL" loading={funnelLoading}>
          {funnelData?.stages.length ? (
            <FunnelChart stages={funnelData.stages} />
          ) : (
            <EmptyState message="No funnel data yet" />
          )}
        </ChartCard>
        <div className="bg-white rounded-xl border border-nino-200/20 p-6 flex items-center justify-center">
          {funnelLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <StatCard
              label="Cart Abandonment"
              value={funnelData?.cartAbandonment ?? 0}
              icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              suffix=" events"
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "revenue":
        return renderRevenue();
      case "products":
        return renderProducts();
      case "orders":
        return renderOrders();
      case "customers":
        return renderCustomers();
      case "shipping":
        return renderShipping();
      case "zones":
        return renderZones();
      case "funnel":
        return renderFunnel();
    }
  };

  const isLoading = (() => {
    switch (activeTab) {
      case "overview": return overviewLoading;
      case "revenue": return revenueLoading;
      case "products": return productsLoading;
      case "orders": return ordersLoading;
      case "customers": return customersLoading;
      case "shipping": return shippingLoading;
      case "zones": return zonesLoading;
      case "funnel": return funnelLoading;
    }
  })();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold text-nino-950 mb-1">
            Analytics
          </h1>
          <p className="text-sm text-nino-800/40 font-[var(--font-display)]">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
          }}
        />
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-1.5 mb-8 p-2 rounded-2xl bg-white border border-nino-200/30">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-[var(--font-display)] text-xs font-semibold tracking-wider uppercase transition-colors ${
              activeTab === tab.key
                ? "text-white"
                : "text-nino-700/50 hover:text-nino-950 hover:bg-nino-50/50"
            }`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="active-analytics-tab"
                className="absolute inset-0 rounded-xl bg-nino-950"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10"
            >
              <path d={tab.icon} />
            </svg>
            <span className="relative z-10 hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderActiveTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
