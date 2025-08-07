"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableRowData {
  _key: string;
  _type: "tableRow";
  cells: string[];
}

interface TableProps {
  value: {
    _type: "table";
    rows: TableRowData[];
  };
}

export const TableComponent: React.FC<TableProps> = ({ value }) => {
  const { rows } = value;

  if (!rows || rows.length === 0) {
    return null;
  }

  const [headerRow, ...bodyRows] = rows;

  return (
    <div className="note-table-container">
      <div className="note-table-wrapper">
        <Table className="note-table">
          {headerRow && (
            <TableHeader>
              <TableRow className="note-table-header-row">
                {headerRow.cells.map((cell, index) => (
                  <TableHead
                    key={`${headerRow._key}-${index}`}
                    className="note-table-header"
                  >
                    {cell}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {bodyRows.map((row, rowIndex) => (
              <TableRow
                key={row._key}
                className={`note-table-row ${
                  rowIndex === bodyRows.length - 1 ? "border-b-0" : ""
                }`}
              >
                {row.cells.map((cell, index) => (
                  <TableCell
                    key={`${row._key}-${index}`}
                    className="note-table-cell"
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
