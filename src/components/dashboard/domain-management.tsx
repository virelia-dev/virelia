"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Globe,
  Plus,
  Trash2,
  Star,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface Domain {
  id: string;
  domain: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
}

export function DomainManagement() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showInstructions, setShowInstructions] = useState<string | null>(null);

  const fetchDomains = async () => {
    try {
      const response = await fetch("/api/domains");
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      }
    } catch (error) {
      console.error("Error fetching domains:", error);
      toast.error("Failed to load domains");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: newDomain.trim().toLowerCase(),
        }),
      });

      if (response.ok) {
        const domain = await response.json();
        await fetchDomains();
        setNewDomain("");
        setShowInstructions(domain.domain);
        toast.success("Domain added successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add domain");
      }
    } catch (error) {
      console.error("Error adding domain:", error);
      toast.error("Failed to add domain");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/domains/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDefault: true }),
      });

      if (response.ok) {
        await fetchDomains();
        toast.success("Default domain updated!");
      } else {
        toast.error("Failed to update default domain");
      }
    } catch (error) {
      console.error("Error updating domain:", error);
      toast.error("Failed to update domain");
    }
  };

  const handleDeleteDomain = async (id: string, domain: string) => {
    if (!confirm(`Are you sure you want to delete ${domain}?`)) return;

    try {
      const response = await fetch(`/api/domains/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchDomains();
        toast.success("Domain deleted successfully!");
      } else {
        toast.error("Failed to delete domain");
      }
    } catch (error) {
      console.error("Error deleting domain:", error);
      toast.error("Failed to delete domain");
    }
  };

  const getDNSInstructions = (domain: string) => ({
    cname: {
      type: "CNAME",
      name: domain,
      value:
        process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(
          "https://",
          "",
        ).replace("http://", "") || "your-virelia-app.com",
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Domains</CardTitle>
          <CardDescription>Loading your custom domains...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-primary/10 rounded animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Custom Domains
          </CardTitle>
          <CardDescription>
            Use your own domain for shortened URLs instead of the default domain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAddDomain} className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                disabled={isAdding}
                className="h-10"
              />
            </div>
            <Button
              type="submit"
              disabled={isAdding || !newDomain.trim()}
              className="h-10 px-4 flex items-center whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAdding ? "Adding..." : "Add Domain"}
            </Button>
          </form>

          {domains.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto opacity-20 mb-4" />
              <p>No custom domains added yet</p>
              <p className="text-sm">Add your first domain to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {domains.map((domain) => (
                <motion.div
                  key={domain.id}
                  className="border rounded-lg p-4 space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-medium">
                        {domain.domain}
                      </span>
                      <div className="flex gap-2">
                        {domain.isDefault && (
                          <Badge variant="default">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        <Badge
                          variant={domain.isVerified ? "default" : "secondary"}
                        >
                          {domain.isVerified ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {domain.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!domain.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(domain.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setShowInstructions(
                            showInstructions === domain.domain
                              ? null
                              : domain.domain,
                          )
                        }
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Setup
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDeleteDomain(domain.id, domain.domain)
                        }
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showInstructions === domain.domain && (
                      <motion.div
                        className="border-t pt-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <h4 className="font-medium mb-3">DNS Configuration</h4>
                        <div className="space-y-4 text-sm">
                          <div className="bg-muted p-3 rounded">
                            <p className="font-medium mb-2">CNAME Record</p>
                            <div className="space-y-1 font-mono text-xs bg-background p-2 rounded">
                              <div>
                                Type:{" "}
                                <span className="text-primary">CNAME</span>
                              </div>
                              <div>
                                Name:{" "}
                                <span className="text-primary">
                                  {domain.domain}
                                </span>
                              </div>
                              <div>
                                Value:{" "}
                                <span className="text-primary">
                                  {
                                    getDNSInstructions(domain.domain).cname
                                      .value
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                              • Add this DNS record in your domain registrar's
                              control panel
                            </p>
                            <p>
                              • DNS changes can take up to 24 hours to propagate
                            </p>
                            <p>
                              • Once configured, your short URLs will use{" "}
                              {domain.domain}/shortcode
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
