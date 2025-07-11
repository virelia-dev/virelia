"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface UTMParameter {
  key: string;
  value: string;
}

interface UTMBuilderProps {
  baseUrl: string;
  onUrlUpdateAction: (url: string) => void;
  className?: string;
}

export function UTMBuilder({
  baseUrl,
  onUrlUpdateAction,
  className = "",
}: UTMBuilderProps) {
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [customParams, setCustomParams] = useState<UTMParameter[]>([]);

  const addCustomParam = () => {
    setCustomParams([...customParams, { key: "", value: "" }]);
  };

  const removeCustomParam = (index: number) => {
    setCustomParams(customParams.filter((_, i) => i !== index));
  };

  const updateCustomParam = (
    index: number,
    field: keyof UTMParameter,
    value: string,
  ) => {
    const updated = customParams.map((param, i) =>
      i === index ? { ...param, [field]: value } : param,
    );
    setCustomParams(updated);
  };

  const generateUrl = () => {
    const url = new URL(baseUrl);

    if (utmSource) url.searchParams.set("utm_source", utmSource);
    if (utmMedium) url.searchParams.set("utm_medium", utmMedium);
    if (utmCampaign) url.searchParams.set("utm_campaign", utmCampaign);
    if (utmTerm) url.searchParams.set("utm_term", utmTerm);
    if (utmContent) url.searchParams.set("utm_content", utmContent);

    customParams.forEach((param) => {
      if (param.key && param.value) {
        url.searchParams.set(param.key, param.value);
      }
    });

    return url.toString();
  };

  const finalUrl = generateUrl();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalUrl);
    toast.success("URL copied to clipboard");
  };

  const applyUrl = () => {
    onUrlUpdateAction(finalUrl);
    toast.success("URL updated with UTM parameters");
  };

  const clearAllParams = () => {
    setUtmSource("");
    setUtmMedium("");
    setUtmCampaign("");
    setUtmTerm("");
    setUtmContent("");
    setCustomParams([]);
    onUrlUpdateAction(baseUrl);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          UTM Parameter Builder
          <Button variant="outline" size="sm" onClick={clearAllParams}>
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Source *</label>
            <Input
              placeholder="google, newsletter, facebook"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Medium *</label>
            <Input
              placeholder="email, social, cpc"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Campaign *</label>
            <Input
              placeholder="spring-sale, newsletter-2024"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Term</label>
            <Input
              placeholder="keyword, target audience"
              value={utmTerm}
              onChange={(e) => setUtmTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Content</label>
          <Input
            placeholder="banner-ad, text-link"
            value={utmContent}
            onChange={(e) => setUtmContent(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Custom Parameters</label>
            <Button
              variant="outline"
              size="sm"
              onClick={addCustomParam}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>

          {customParams.map((param, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Parameter name"
                value={param.key}
                onChange={(e) =>
                  updateCustomParam(index, "key", e.target.value)
                }
                className="flex-1"
              />
              <Input
                placeholder="Parameter value"
                value={param.value}
                onChange={(e) =>
                  updateCustomParam(index, "value", e.target.value)
                }
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCustomParam(index)}
                className="px-2"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Generated URL</label>
          <div className="relative">
            <Input value={finalUrl} readOnly className="pr-20 text-xs" />
            <div className="absolute right-1 top-1 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <Button onClick={applyUrl} className="w-full">
          Apply UTM Parameters
        </Button>
      </CardContent>
    </Card>
  );
}
