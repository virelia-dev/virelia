"use client";

import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client";
import { User } from "better-auth/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { redirect } from "next/navigation";
import {
  FolderOpen,
  CheckSquare,
  Target,
  Users,
  Plus,
  UserPlus,
  BarChart3,
  Settings,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setUser(session.data.user);
        } else {
          redirect("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        redirect("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/login");
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name || user.email}! Here's what's happening with
          your account.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+4 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+12 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+1 new member</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest project updates and tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                action: "Created new project",
                project: "Website Redesign",
                time: "2 hours ago",
                status: "new",
              },
              {
                action: "Completed task",
                project: "Mobile App",
                time: "4 hours ago",
                status: "completed",
              },
              {
                action: "Updated documentation",
                project: "API Gateway",
                time: "1 day ago",
                status: "updated",
              },
              {
                action: "Added team member",
                project: "Dashboard",
                time: "2 days ago",
                status: "team",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.action}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.project}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      activity.status === "completed" ? "default" : "secondary"
                    }
                  >
                    {activity.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <button className="flex items-center space-x-2 rounded-lg border p-3 text-left hover:bg-accent transition-colors">
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Create New Project</span>
              </button>
              <button className="flex items-center space-x-2 rounded-lg border p-3 text-left hover:bg-accent transition-colors">
                <UserPlus className="h-4 w-4" />
                <span className="text-sm font-medium">Invite Team Member</span>
              </button>
              <button className="flex items-center space-x-2 rounded-lg border p-3 text-left hover:bg-accent transition-colors">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">View Analytics</span>
              </button>
              <button className="flex items-center space-x-2 rounded-lg border p-3 text-left hover:bg-accent transition-colors">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">
                {user.name || "Not set"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Badge variant={user.emailVerified ? "default" : "secondary"}>
                {user.emailVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
