import React, { useEffect, useState } from "react";
import {Box, Select, Stack, Option} from "@mui/joy";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import useTasks from "@/api/v1/useTasks";
import dayjs from "dayjs";

interface HistoryListProps {
  id: string;
  startTime: string;
  status: string;
  kind: string;
  description: string;
}

const History = () => {
  const {getTasks} = useTasks();
  const [historyList, setHistoryList] = useState<HistoryListProps[]>([]);
  const [filteredList, setFilteredList] = useState<HistoryListProps[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [kindFilter, setKindFilter] = useState<string>('All');

  const statusCodeMap: Record<string, string> = {
    SUCCESS: '완료',
    FAILED: '실패',
  };

  const kindCodeMap: Record<string, string> = {
    Maintenance: '저장소 관리',
    Snapshot: '백업 리스트 생성',
    Repository: '저장소 생성',
    Restore: '저장소 복구',
  }

  const column: GridColDef[] = [
    { field: 'startTime', flex: 1, headerName: '시작 시간', valueGetter: (value) => dayjs(value).format("YYYY-MM-DD HH:mm:ss") },
    { field: 'status', flex: 1, headerName: '상태', valueGetter: (value) => statusCodeMap[value] ?? value },
    { field: 'kind', flex: 1, headerName: '유형', valueGetter: (value) => kindCodeMap[value] ?? value },
    { field: 'description', flex: 4, headerName: '설명' },
  ];

  useEffect(() => {
    handleRefresh()
  }, []);

  useEffect(() => {
    const filtered = historyList.filter(item => {
      const statusMatch = statusFilter === 'All' || item.status === statusFilter;
      const kindMatch = kindFilter === 'All' || item.kind === kindFilter;
      return statusMatch && kindMatch;
    });

    setFilteredList(filtered);
  }, [statusFilter, kindFilter]);

  const handleRefresh = async () => {
    await getTasks()
      .then(result => {
        const _historyList: HistoryListProps[] = [];
        if (result.tasks.length > 0) {
          result.tasks.map(res => {
            _historyList.push({
              id: res.id,
              startTime: res.startTime,
              status: res.status,
              kind: res.kind,
              description: res.description,
            })
          });
        }
        setHistoryList(_historyList);
        setFilteredList(_historyList);
      })
      .catch(error => {
        console.log(error)
      })
      .finally(() => {

      });

  }


  return (
    <Box sx={{width:'100%', height: '100%', display: 'flex', flexDirection: 'column'}} gap={2}>
      <Stack flexDirection={'row-reverse'} gap={3}>
        <Stack flexDirection={'row'} alignItems={'center'} gap={1}>
          <label htmlFor={'status-filter'}>상태</label>
          <Select value={statusFilter} variant={'outlined'} slotProps={{button: {id: 'status-filter'}}}>
            <Option value={'All'} onClick={() => setStatusFilter('All')}>전체</Option>
            {Object.entries(statusCodeMap).map(([value, label], index) => (
              <Option key={index} value={value} onClick={() => setStatusFilter(value)}>{label}</Option>
            ))}
          </Select>
        </Stack>
        <Stack flexDirection={'row'} alignItems={'center'} gap={1}>
          <label htmlFor={'kind-filter'}>유형</label>
          <Select value={kindFilter} variant={'outlined'} slotProps={{button: {id: 'kind-filter'}}} sx={{width: '170px'}}>
            <Option value={'All'} onClick={() => setKindFilter('All')}>전체</Option>
            {Object.entries(kindCodeMap).map(([value, label], index) => (
              <Option key={index} value={value} onClick={() => setKindFilter(value)}>{label}</Option>
            ))}
          </Select>
        </Stack>
      </Stack>
      <Stack flex={1} flexDirection={'column'} sx={{height: '100%', overflowX: 'auto'}}>
        <DataGrid columns={column}
                  rows={filteredList}
                  autosizeOnMount
                  onRowClick={(value) => console.log(value)}
        />
      </Stack>
    </Box>
  )
}

export default History;