"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// meta.align helper
type Align = "left" | "center" | "right";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumnId?: string;
  searchPlaceholder?: string;
  /** Render para mobile cards (< md). Si no se pasa, solo muestra la tabla en md+. */
  renderMobileRow?: (row: TData) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumnId,
  searchPlaceholder = "Filter…",
  renderMobileRow,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const searchValue = searchColumnId
    ? (table.getColumn(searchColumnId)?.getFilterValue() as string) ?? ""
    : globalFilter ?? "";

  const handleSearch = (value: string) => {
    if (searchColumnId) {
      table.getColumn(searchColumnId)?.setFilterValue(value);
    } else {
      table.setGlobalFilter(value);
    }
  };

  const alignToClass = (align?: Align) =>
    align === "right"
      ? "text-right"
      : align === "center"
      ? "text-center"
      : "text-left";

  return (
    <div className="mt-6 flow-root">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 pb-3">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        {/* Podés agregar acciones a la derecha si hace falta */}
      </div>

      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-muted p-2 md:pt-0">
          {/* Mobile cards */}
          {renderMobileRow && (
            <div className="md:hidden">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <div
                    key={row.id}
                    className="mb-2 w-full rounded-md bg-card p-4 border border-border"
                  >
                    {renderMobileRow(row.original)}
                  </div>
                ))
              ) : (
                <div className="rounded-md bg-card p-6 text-center text-sm text-muted-foreground border border-border">
                  No results.
                </div>
              )}
            </div>
          )}

          {/* Desktop table */}
          <Table className={renderMobileRow ? "hidden md:table" : "table"}>
            <TableHeader className="text-left text-sm font-normal [&_tr]:border-0">
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="[&_th]:h-9 [&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-5 [&_th]:font-medium [&_th]:text-foreground"
                >
                  {hg.headers.map((header) => {
                    const align = (header.column.columnDef.meta as any)
                      ?.align as Align;
                    return (
                      <TableHead
                        key={header.id}
                        className={alignToClass(align)}
                      >
                        <div className="max-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody className="bg-card border border-border">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, rowIdx, all) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={[
                      "w-full py-3 text-sm border-b border-border first:border-t-0 last:border-b-0",
                      rowIdx === 0 &&
                        "[&>td:first-child]:rounded-tl-lg [&>td:last-child]:rounded-tr-lg",
                      rowIdx === all.length - 1 &&
                        "[&>td:first-child]:rounded-bl-lg [&>td:last-child]:rounded-br-lg",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const align = (cell.column.columnDef.meta as any)
                        ?.align as Align;
                      const raw =
                        typeof cell.getValue === "function"
                          ? cell.getValue()
                          : undefined;
                      const title =
                        typeof raw === "string" ? (raw as string) : undefined;

                      return (
                        <TableCell
                          key={cell.id}
                          className={["px-3 py-3", alignToClass(align)]
                            .filter(Boolean)
                            .join(" ")}
                          title={title}
                        >
                          <div className="max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
