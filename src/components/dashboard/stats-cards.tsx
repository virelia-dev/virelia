"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

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
    <motion.div
      className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <motion.div
              whileHover={{
                scale: 1.02,
                y: -4,
                transition: { type: "spring", stiffness: 400, damping: 17 },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <motion.div
                    className="p-2 bg-primary/10 rounded-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Icon className="h-4 w-4 text-primary" />
                  </motion.div>
                </CardHeader>
                <CardContent className="pt-0">
                  <motion.div
                    className="text-2xl font-bold tracking-tight"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                  >
                    {stat.value}
                  </motion.div>
                  {stat.description && (
                    <motion.p
                      className="text-xs text-muted-foreground mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                    >
                      {stat.description}
                    </motion.p>
                  )}
                  {stat.trend && (
                    <motion.div
                      className="flex items-center mt-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
                    >
                      <p
                        className={`text-xs font-medium flex items-center ${
                          stat.trend.isPositive
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        <motion.span
                          className="mr-1"
                          animate={{
                            y: stat.trend.isPositive ? [-2, 0] : [2, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                        >
                          {stat.trend.isPositive ? "↗" : "↘"}
                        </motion.span>
                        {stat.trend.isPositive ? "+" : ""}
                        {stat.trend.value}
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
