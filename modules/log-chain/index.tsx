/**
 * Blockchain Log Registry - Main Module
 * PATCH 154.0 - Blockchain-based log verification
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, Shield, BarChart3, ExternalLink } from "lucide-react";
import { getBlockchainStats, listBlockchainRecords } from "./services/blockchain-service";
import { BlockchainRecord } from "./types";

export const LogChain: React.FC = () => {
  const [stats, setStats] = useState({ total: 0, verified: 0, byNetwork: {} });
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, recordsData] = await Promise.all([
        getBlockchainStats(),
        listBlockchainRecords()
      ]);
      setStats(statsData);
      setRecords(recordsData);
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Blockchain Log Registry</h1>
        <p className="text-muted-foreground">
          Immutable log verification using Ethereum and Polygon networks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <Link2 className="h-4 w-4 inline mr-2" />
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered on blockchain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <Shield className="h-4 w-4 inline mr-2" />
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Networks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(stats.byNetwork).map(([network, count]) => (
                <div key={network} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{network}:</span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blockchain Records</CardTitle>
          <CardDescription>
            Verifiable log entries stored on Ethereum Rinkeby and Polygon Mumbai testnets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No blockchain records found
              </p>
            ) : (
              records.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-start justify-between border-b pb-3">
                  <div className="space-y-1">
                    <div className="font-medium">{record.log_events?.description || "Log Event"}</div>
                    <div className="text-sm text-muted-foreground">
                      Block: {record.blockNumber}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {record.network}
                      </Badge>
                      {record.verified && (
                        <Badge variant="default" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <a
                    href={record.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">About Blockchain Registry</p>
              <p>
                Critical events and logs are hashed using SHA-256 and stored on blockchain testnets
                (Ethereum Rinkeby or Polygon Mumbai) for immutable verification. Each record includes
                a transaction hash and block number that can be independently verified on the blockchain.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogChain;
export * from "./types";
export * from "./services/blockchain-service";
