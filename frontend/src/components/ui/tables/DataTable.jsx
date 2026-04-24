export default function DataTable({
  columns,
  rows,
  getRowKey,
  className = '',
  emptyState = null
}) {
  if (!rows.length) return emptyState;

  return (
    <div className={['ui-table-shell', className].filter(Boolean).join(' ')}>
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                className={column.align ? `is-${column.align}` : ''}
                scope="col"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={column.align ? `is-${column.align}` : ''}
                >
                  {column.render ? column.render(row) : row[column.id]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
