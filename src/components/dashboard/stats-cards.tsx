"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

interface StatsCardsProps {
  stats: StatCard[];
  className?: string;
}

export function StatsCards({ stats, className = "" }: StatsCardsProps) {
  return (
    <div
      className={`grid gap-4 grid-cols-1 lg:grid-cols-3 sm:grid-cols-1 ${className}`}
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.description && (
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              )}
              {stat.trend && (
                <p
                  className={`text-xs ${
                    stat.trend.isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {stat.trend.isPositive ? "+" : ""}
                  {stat.trend.value}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
