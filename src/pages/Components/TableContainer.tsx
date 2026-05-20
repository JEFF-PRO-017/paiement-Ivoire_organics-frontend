import React, { Fragment, useEffect, useState } from 'react';
import { CardBody, Col, Row } from 'reactstrap';
import {
  Column,
  Table as ReactTable,
  ColumnFiltersState,
  FilterFn,
  RowSelectionState,
  OnChangeFn,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Pagination from 'pages/Components/Pagination';

// ─── DebouncedInput ───────────────────────────────────────────────────────────
const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 400,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) => {
  const [value, setValue] = useState(initialValue);
  useEffect(() => { setValue(initialValue); }, [initialValue]);
  useEffect(() => {
    const t = setTimeout(() => onChange(value), debounce);
    return () => clearTimeout(t);
  }, [debounce, onChange, value]);
  return (
    <input
      {...props}
      value={value}
      id="search-bar-0"
      className="form-control border-0 search"
      onChange={e => setValue(e.target.value)}
    />
  );
};

// ─── Column Filter ────────────────────────────────────────────────────────────
const Filter = ({
  column,
}: {
  column: Column<any, unknown>;
  table: ReactTable<any>;
}) => {
  const columnFilterValue = column.getFilterValue();
  return (
    <>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={value => column.setFilterValue(value)}
        placeholder="Filtrer..."
        className="w-36 border shadow rounded"
      />
      <div className="h-1" />
    </>
  );
};

// ─── Props ────────────────────────────────────────────────────────────────────
export interface TableContainerProps {
  columns:            any[];
  data:               any[];
  // filtre global
  isGlobalFilter?:    boolean;
  SearchPlaceholder?: string;
  // pagination (votre composant Pagination)
  page:               number;
  total:              number;
  pageSize:           number;
  onPageChange:       (p: number) => void;
  onPageSizeChange:   (size: number) => void;
  // sélection de lignes (optionnelle)
  rowSelection?:         RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  getRowId?:             (row: any) => string;
  // highlight ligne sélectionnée
  selectedRowClass?:  string;
  // export
  isExport?:          boolean;
  exportFilename?:    string;
  // style (hérités du template d'origine)
  tableClass?:        string;
  theadClass?:        string;
  trClass?:           string;
  thClass?:           string;
  divClass?:          string;
  isBordered?:        boolean;
  // handlers métier (hérités du template)
  handleTaskClick?:    any;
  handleLeadClick?:    any;
  handleCompanyClick?: any;
  handleContactClick?: any;
  handleTicketClick?:  any;
}

// ─── TableContainer ───────────────────────────────────────────────────────────
const TableContainer: React.FC<TableContainerProps> = ({
  columns,
  data,
  isGlobalFilter,
  SearchPlaceholder = 'Rechercher…',
  page,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  selectedRowClass = 'table-active',
  isExport       = false,
  exportFilename = 'export',
  tableClass = 'table table-hover table-nowrap table-centered align-middle mb-0',
  theadClass = 'bg-light text-muted',
  trClass    = '',
  thClass    = '',
  divClass   = 'table-responsive table-card',
  isBordered,
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter,  setGlobalFilter ] = useState('');
  const [sorting,       setSorting      ] = useState<any[]>([]);

  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({ itemRank });
    return itemRank.passed;
  };

  // options de sélection uniquement si le parent les fournit
  const selectionOptions = rowSelection !== undefined && onRowSelectionChange
    ? { state: { rowSelection }, onRowSelectionChange }
    : {};

  const table = useReactTable({
    columns,
    data,
    filterFns:             { fuzzy: fuzzyFilter },
    state:                 { columnFilters, globalFilter, sorting, ...selectionOptions.state },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange:  setGlobalFilter,
    onSortingChange:       setSorting,
    ...(selectionOptions.onRowSelectionChange
      ? { onRowSelectionChange: selectionOptions.onRowSelectionChange }
      : {}),
    globalFilterFn:        fuzzyFilter,
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    ...(getRowId ? { getRowId } : {}),
  });

  const filteredRows = table.getRowModel().rows;
  const isFiltered   = filteredRows.length !== data.length;

  // ── Export Excel ─────────────────────────────────────────────────────────
  const exportExcel = () => {
    const exportData = filteredRows.map(row =>
      Object.fromEntries(
        row.getVisibleCells()
          .filter(c => !['select', 'payer', 'detail', 'confirmer', 'actions'].includes(c.column.id))
          .map(c => [
            typeof c.column.columnDef.header === 'string'
              ? c.column.columnDef.header
              : c.column.id,
            c.getValue() ?? '',
          ])
      )
    );
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Données');
    XLSX.writeFile(wb, `${exportFilename}.xlsx`);
  };

  // ── Export PDF ───────────────────────────────────────────────────────────
  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(13);
    doc.text(exportFilename, 14, 15);
    const visibleCols = table.getHeaderGroups()[0]?.headers
      .filter(h => !['select', 'payer', 'detail', 'confirmer', 'actions'].includes(h.column.id));
    autoTable(doc, {
      startY: 22,
      head: [visibleCols.map(h =>
        typeof h.column.columnDef.header === 'string' ? h.column.columnDef.header : h.column.id
      )],
      body: filteredRows.map(row =>
        row.getVisibleCells()
          .filter(c => !['select', 'payer', 'detail', 'confirmer', 'actions'].includes(c.column.id))
          .map(c => String(c.getValue() ?? '—'))
      ),
      styles:     { fontSize: 9 },
      headStyles: { fillColor: [220, 53, 69] },
    });
    doc.save(`${exportFilename}.pdf`);
  };

  return (
    <Fragment>

      {/* ── Barre filtre + exports ── */}
      {(isGlobalFilter || isExport) && (
        <Row className="mb-3 align-items-center">
          <CardBody className="border border-dashed border-end-0 border-start-0 py-2">
            <Row className="align-items-center g-2">

              {isGlobalFilter && (
                <Col sm={5}>
                  <div className="search-box d-inline-block col-12">
                    <DebouncedInput
                      value={globalFilter ?? ''}
                      onChange={value => setGlobalFilter(String(value))}
                      placeholder={SearchPlaceholder}
                    />
                    <i className="bx bx-search-alt search-icon" />
                  </div>
                </Col>
              )}

              {isGlobalFilter && (
                <Col sm={isExport ? 4 : 7} className="d-flex align-items-center">
                  <span className="text-muted small">
                    {isFiltered
                      ? <><span className="fw-semibold text-danger">{filteredRows.length}</span> / {data.length} résultat(s)</>
                      : <><span className="fw-semibold">{data.length}</span> résultat(s)</>
                    }
                  </span>
                </Col>
              )}

              {isExport && (
                <Col sm={3} className="d-flex justify-content-sm-end gap-2">
                  <button
                    className="btn btn-soft-success btn-sm d-flex align-items-center gap-1"
                    onClick={exportExcel}
                  >
                    <i className="ri-file-excel-2-line" /> Excel
                  </button>
                  <button
                    className="btn btn-soft-danger btn-sm d-flex align-items-center gap-1"
                    onClick={exportPdf}
                  >
                    <i className="ri-file-pdf-line" /> PDF
                  </button>
                </Col>
              )}

            </Row>
          </CardBody>
        </Row>
      )}

      {/* ── Tableau ── */}
      <div className={divClass}>
        <table className={`${tableClass}${isBordered ? ' table-bordered' : ''}`}>
          <thead className={theadClass}>
            {table.getHeaderGroups().map((hg: any) => (
              <tr className={trClass} key={hg.id}>
                {hg.headers.map((h: any) => (
                  <th
                    key={h.id}
                    className={thClass}
                    style={{
                      cursor: h.column.getCanSort() ? 'pointer' : 'default',
                      ...(h.getSize() !== 150 ? { width: h.getSize() } : {}),
                    }}
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {h.isPlaceholder ? null : (
                      <Fragment>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getCanSort() && (
                          <span className="ms-1 text-muted">
                            {{ asc: ' ↑', desc: ' ↓' }[h.column.getIsSorted() as string] ?? ' ↕'}
                          </span>
                        )}
                        {h.column.getCanFilter() && (
                          <div>
                            <Filter column={h.column} table={table} />
                          </div>
                        )}
                      </Fragment>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-5 text-muted">
                  <i className="ri-search-line display-6 d-block mb-2" />
                  Aucun résultat
                </td>
              </tr>
            ) : (
              filteredRows.map((row: any) => (
                <tr
                  key={row.id}
                  className={`${trClass} ${row.getIsSelected() ? selectedRowClass : ''}`.trim()}
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {data.length > 0 && (
        <Pagination
          page={page}
          total={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}

    </Fragment>
  );
};

export default TableContainer;