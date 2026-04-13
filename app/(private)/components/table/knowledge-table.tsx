"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  DeleteIcon,
  EditIcon,
  PencilEdit01Icon,
  SearchIcon,
} from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CreateKnowledge from "../create-knowledge";
import EditKnowledge from "../edit-knowledge";

interface Knowledge {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
}

interface Props {
  data: Knowledge[];
  organizationId: string;
  chatbotId: string;
}

export default function KnowledgeTable({
  data,
  organizationId,
  chatbotId,
}: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Knowledge | null>(null);
  const [open, setOpen] = useState(false);

  function onEdit(knowledge: Knowledge) {
    setSelected(knowledge);
    setOpen(true);
  }

  const columns: ColumnDef<Knowledge>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <span className="font-medium max-w-xs truncate block">
            {row.getValue("title")}
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="capitalize">{row.getValue("category")}</span>
        ),
      },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => {
          const tags = row.getValue("tags") as string[];
          return (
            <div className="flex flex-wrap gap-1">
              {tags?.length > 0 ? (
                tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs capitalize"
                  >
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            className={
              row.getValue("isActive")
                ? "bg-emerald-500"
                : "bg-muted text-muted-foreground"
            }
          >
            {row.getValue("isActive") ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) =>
          new Date(row.getValue("createdAt")).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(row.original)}
            >
              <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
              Edit
            </Button>
            {/* <Button
              variant="destructive"
              size="sm"
              onClick={() => console.log("delete", row.original.id)}
            >
              <HugeiconsIcon icon={Delete02Icon} size={16} />
              Delete
            </Button> */}
          </div>
        ),
      },
    ],
    [],
  );

  const filtered = useMemo(
    () =>
      data.filter(
        (k) =>
          k.title.toLowerCase().includes(search.toLowerCase()) ||
          k.category.toLowerCase().includes(search.toLowerCase()) ||
          k.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase())),
      ),
    [data, search],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between items-center">
        <div className="relative max-w-xs">
          <HugeiconsIcon
            icon={SearchIcon}
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search knowledge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <CreateKnowledge
          organizationId={organizationId}
          chatbotId={chatbotId}
        />
      </div>

      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-6"
                >
                  {search ? "No results found." : "No knowledge added yet."}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {search ? "No results found." : "No knowledge added yet."}
          </p>
        ) : (
          filtered.map((k) => (
            <Card key={k.id}>
              <CardHeader>
                <div className="grid grid-cols-4 gap-3">
                  <CardTitle className="col-span-3">{k.title}</CardTitle>
                  <div className="flex justify-end">
                    <Badge
                      className={`
                      ${
                        k.isActive
                          ? "bg-emerald-500"
                          : "bg-muted text-muted-foreground"
                      }
                    `}
                    >
                      {k.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="capitalize text-foreground">
                  Category:{" "}
                  <span className="text-muted-foreground">{k.category}</span>
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent>
                <div className="flex flex-col gap-3">
                  {k.tags && k.tags.length > 0 && (
                    <p className="flex flex-wrap gap-1 items-center">
                      Tags:
                      {k.tags.map((tag) => (
                        <Badge
                          className="bg-muted text-muted-foreground"
                          key={tag}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </p>
                  )}
                  <p className="flex flex-wrap gap-1 items-center">
                    Created:
                    <span className="text-muted-foreground">
                      {new Date(k.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(k)}
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
                      Edit
                    </Button>
                    {/* <Button variant={"destructive"} size={"sm"}>
                      <HugeiconsIcon icon={DeleteIcon} />
                      Delete
                    </Button> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {selected && (
        <EditKnowledge
          open={open}
          onOpenChange={setOpen}
          organizationId={organizationId}
          chatbotId={chatbotId}
          knowledge={selected}
        />
      )}
    </div>
  );
}
