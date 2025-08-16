"use client";

import * as React from "react";
import {
  Activity,
  BarChart2,
  CheckCircle,
  LayoutDashboard,
  Menu,
  PieChart as PieChartIcon,
  Search,
  Settings,
  User,
  Bell,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Pie,
  PieChart as RePieChart,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

/* ----------------------------- Mock Data ----------------------------- */
const scoreData = [
  { day: "Mon", score: 70 },
  { day: "Tue", score: 75 },
  { day: "Wed", score: 80 },
  { day: "Thu", score: 82 },
  { day: "Fri", score: 85 },
  { day: "Sat", score: 87 },
  { day: "Sun", score: 90 },
];

const quizCategoryData = [
  { category: "Signs", quizzes: 12 },
  { category: "Rules", quizzes: 9 },
  { category: "Hazards", quizzes: 6 },
  { category: "Parking", quizzes: 4 },
];

const pieData = [
  { name: "Completed", value: 20, color: "#10b981" },
  { name: "Remaining", value: 10, color: "#f59e0b" },
];

/* --------------------------- Chart Configs --------------------------- */
const scoreChartConfig: ChartConfig = {
  score: { label: "Score", color: "#3b82f6" },
};

const quizCategoryChartConfig: ChartConfig = {
  quizzes: { label: "Quizzes", color: "#6366f1" },
};

const completionChartConfig: ChartConfig = {
  completed: { label: "Completed", color: "#10b981" },
  remaining: { label: "Remaining", color: "#f59e0b" },
};

/* ------------------------------ Component --------------------------- */
export default function Dashboard() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar – mobile first */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          {/* Left: Mobile menu trigger + brand */}
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <SheetHeader className="px-4 py-3 border-b">
                  <SheetTitle className="flex items-center gap-2 text-base">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    DrivePrep
                  </SheetTitle>
                </SheetHeader>
                <MobileNav onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="hidden md:flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <span className="font-bold">DrivePrep</span>
            </div>
          </div>

          {/* Middle: Search – full width on mobile */}
          <div className="flex-1 md:max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search quizzes, categories, attempts…"
                className="pl-9"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <img
                    src="https://i.pravatar.cc/40"
                    alt="Profile"
                    className="h-6 w-6 rounded-full"
                  />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Layout: Sidebar (md+) + Content */}
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 md:grid-cols-[220px_1fr]">
        {/* Sidebar (hidden on mobile) */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] border-r bg-white md:block">
          <div className="p-4 space-y-1">
            <SidebarLink icon={<BarChart2 className="h-4 w-4" />} label="Analytics" active />
            <SidebarLink icon={<Activity className="h-4 w-4" />} label="Activity" />
            <SidebarLink icon={<Settings className="h-4 w-4" />} label="Settings" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="px-4 py-6 md:px-6">
          {/* Mobile hero card */}
          <Card className="mb-4 md:mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg md:text-2xl">Welcome back 👋</CardTitle>
              <CardDescription className="text-white/90">
                Your weekly performance at a glance
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span>Goal: 90% avg score</span>
                <span>Current: 85%</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats – mobile first (1 col) → 2 → 4 */}
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 md:gap-4 lg:gap-6 mb-4 md:mb-6">
            <StatCard icon={<CheckCircle className="h-5 w-5 text-emerald-500" />} title="Quizzes Completed" value="12 / 20" />
            <StatCard icon={<BarChart2 className="h-5 w-5 text-blue-500" />} title="Average Score" value="85%" />
            <StatCard icon={<User className="h-5 w-5 text-purple-500" />} title="Active Streak" value="7 days" />
            <StatCard icon={<Activity className="h-5 w-5 text-orange-500" />} title="Questions Left" value="8" />
          </section>

          {/* Charts – stack on mobile */}
          <section className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
            {/* Line Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Score Progress</CardTitle>
                <CardDescription>Performance over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={scoreChartConfig} className="h-56 md:h-72 w-full">
                  <ResponsiveContainer>
                    <LineChart data={scoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[60, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke={scoreChartConfig.score.color}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Quiz Completion</CardTitle>
                <CardDescription>Completed vs. Remaining</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={completionChartConfig} className="h-56 md:h-72 w-full">
                  <ResponsiveContainer>
                    <RePieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RePieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </section>

          {/* Bar Chart */}
          <section className="mt-4 md:mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base md:text-lg">Quizzes by Category</CardTitle>
                    <CardDescription>Where you’ve practiced most</CardDescription>
                  </div>
                  <PieChartIcon className="h-5 w-5 text-muted-foreground hidden md:block" />
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={quizCategoryChartConfig} className="h-56 md:h-72 w-full">
                  <ResponsiveContainer>
                    <BarChart data={quizCategoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="quizzes" fill={quizCategoryChartConfig.quizzes.color} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ----------------------------- Subcomponents ----------------------------- */

function MobileNav({ onNavigate }: { onNavigate?: () => void }) {
  const items = [
    { icon: <BarChart2 className="h-4 w-4" />, label: "Analytics" },
    { icon: <User className="h-4 w-4" />, label: "Users" },
    { icon: <Activity className="h-4 w-4" />, label: "Activity" },
    { icon: <Settings className="h-4 w-4" />, label: "Settings" },
  ];
  return (
    <div className="py-2">
      {items.map((it) => (
        <button
          key={it.label}
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50"
          onClick={onNavigate}
        >
          {it.icon}
          <span>{it.label}</span>
        </button>
      ))}
      <div className="mt-2 border-t" />
      <button
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-gray-50"
        onClick={onNavigate}
      >
        <LogOut className="h-4 w-4" />
        <span>Log out</span>
      </button>
    </div>
  );
}

function SidebarLink({
  icon,
  label,
  active,
}: {
  icon: React.ReactElement;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
        active ? "bg-primary/10 text-primary" : "hover:bg-gray-50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactElement;
  title: string;
  value: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg border p-4 md:p-5"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{title}</div>
        {icon}
      </div>
      <div className="mt-2 text-xl md:text-2xl font-semibold">{value}</div>
    </motion.div>
  );
}
