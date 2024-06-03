import { useState } from "react";

export const useRowSelection = () => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleRowSelect = (index: number) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((rowIndex) => rowIndex !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  const handleSelectAll = (dataLength: number) => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(Array.from({ length: dataLength }, (_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  return { selectedRows, handleRowSelect, handleSelectAll };
};
