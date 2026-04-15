import { useState, useEffect } from 'react';
import { apiService, ActivityLog } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { History, PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const data = await apiService.getLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const [clearing, setClearing] = useState(false);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <PlusCircle className="h-4 w-4 text-green-500" />;
      case 'update': return <Edit className="h-4 w-4 text-blue-500" />;
      case 'delete': return <Trash2 className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Clear all activity logs? This cannot be undone.')) {
      return;
    }

    try {
      setClearing(true);
      await apiService.deleteAllLogs();
      await fetchLogs();
    } catch (error) {
      console.error('Failed to clear activity logs:', error);
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <CardTitle>Inventory Activity History</CardTitle>
        <span className="ml-auto text-sm text-muted-foreground">{logs.length} logs</span>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleClearLogs}
          disabled={clearing || logs.length === 0}
        >
          <Trash2 className="h-4 w-4" />
          Clear All
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[100px]">Action</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading logs...
                  </TableCell>
                </TableRow>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log._id || log.timestamp?.toString()}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="capitalize text-sm font-medium">{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{log.productName}</TableCell>
                    <TableCell className="text-sm">{log.userEmail}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {log.details || '-'}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {log.timestamp ? format(new Date(log.timestamp), 'MMM d, HH:mm:ss') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No activity recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
