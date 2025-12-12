/**
 * Table Widget
 * Componente reutilizável para exibir tabelas
 * FASE B.2 - Consolidação de Dashboards
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Column {
  id: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  format?: (value: unknown: unknown: unknown) => string | React.ReactNode;
}

interface TableWidgetProps {
  title?: string;
  description?: string;
  columns: Column[];
  data: unknown[];
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  maxHeight?: string;
}

export const TableWidget = ({
  title,
  description,
  columns,
  data,
  className,
  striped = true,
  hoverable = true,
  maxHeight = "400px"
}: TableWidgetProps) => {
  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="relative" style={{ maxHeight, overflowY: "auto" }}>
          <table className="w-full">
            <thead className="sticky top-0 bg-background border-b">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right"
                    )}
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Nenhum dado disponível
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={cn(
                      "border-b",
                      striped && rowIndex % 2 === 0 && "bg-muted/50",
                      hoverable && "hover:bg-muted/80 transition-colors"
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          "px-4 py-3 text-sm",
                          column.align === "center" && "text-center",
                          column.align === "right" && "text-right"
                        )}
                      >
                        {column.format
                          ? column.format(row[column.id])
                          : row[column.id]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
